import { Injectable } from '@nestjs/common';
import fetch from 'cross-fetch';

type PageInput = {
  slug: string;
  title: string;
  blocks?: any; // JSON (si existe el campo)
  locale?: string;
  publishedAt?: string | null;
};

function isInvalidBlocksError(e: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const msg = String((e as any)?.message || e || '');
  return msg.includes('Invalid key blocks');
}

@Injectable()
export class StrapiService {
  private readonly base = process.env.STRAPI_URL || 'http://localhost:1337';
  private readonly token = process.env.STRAPI_TOKEN || '';

  private headers(json = true) {
    const h: Record<string, string> = {};
    if (json) h['Content-Type'] = 'application/json';
    if (this.token) h['Authorization'] = `Bearer ${this.token}`;
    return h;
  }

  /** GET por slug, incluyendo drafts; con fallbacks */
  async getPageBySlug(slug: string) {
    const q = `filters[slug][$eq]=${encodeURIComponent(slug)}`;
    const base = `${this.base}/api/pages?${q}`;
    const urls = [
      `${base}&publicationState=preview&populate=*`,
      `${base}&publicationState=preview`,
      `${base}&populate=*`,
      base,
    ];

    let lastErr = '';
    for (const url of urls) {
      const res = await fetch(url, { headers: this.headers(false) });
      if (res.ok) return res.json() as Promise<{ data: any[] }>;
      lastErr = `Strapi GET pages ${res.status}: ${await res.text()}`;
      if (res.status >= 500) break;
    }
    throw new Error(lastErr);
  }

  // --- sanitización: nunca mandar "publish" en body ---
  private sanitizeCreate(
    input: PageInput | (PageInput & { publish?: boolean }),
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { ...data } = input as any;
    return data as PageInput;
  }
  private sanitizeUpdate(
    input: Partial<PageInput> | (Partial<PageInput> & { publish?: boolean }),
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { ...data } = input as any;
    return data as Partial<PageInput>;
  }

  // --- llamadas base ---
  private async _createPage(input: PageInput): Promise<unknown> {
    console.log('createPage _createPage', input);
    const url = `${this.base}/api/pages`;
    const body = { data: input };
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: this.headers(true),
        body: JSON.stringify(body),
      });
      console.log('createPage _createPage res', res);
      if (!res.ok)
        throw new Error(`Strapi POST page ${res.status}: ${await res.text()}`);
      const data: unknown = await res.json();
      console.log('createPage _createPage data', data);
      return data;
    } catch (e) {
      console.log('createPage _createPage error', e);
      throw e;
    }
  }

  private async _updatePageById(
    id: number,
    input: Partial<PageInput>,
  ): Promise<unknown> {
    console.log('createPage _updatePageById', id, input);
    try {
      const url = `${this.base}/api/pages/${id}`;
      const body = { data: input };
      const res = await fetch(url, {
        method: 'PUT',
        headers: this.headers(true),
        body: JSON.stringify(body),
      });
      console.log('createPage _updatePageById res', res);
      if (!res.ok)
        throw new Error(`Strapi PUT page ${res.status}: ${await res.text()}`);
      const data: unknown = await res.json();
      console.log('createPage _updatePageById data', data);
      return data;
    } catch (e) {
      console.log('createPage _updatePageById error', e);
      throw e;
    }
  }

  /** Crea página con tolerancia:
   * - si falla por blocks → reintenta sin blocks
   * - si falla por cualquier motivo → re-GET por slug y devuelve si existe
   */
  async createPage(input: PageInput | (PageInput & { publish?: boolean })) {
    const safe = this.sanitizeCreate(input);
    try {
      console.log('createPage safe', safe);
      return await this._createPage(safe);
    } catch (e) {
      console.log('createPage error', e);
      if (isInvalidBlocksError(e)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { ...safeNoBlocks } = safe as any;
        try {
          console.log('createPage safeNoBlocks', safeNoBlocks);
          return await this._createPage(safeNoBlocks as PageInput);
        } catch {
          /* sigue al fallback */
        }
      }
      // Fallback genérico: intenta leer por slug (ej. duplicado/raza) y devuelve si existe
      try {
        console.log('createPage safe', safe);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        const existing = await this.getPageBySlug((safe as any).slug);
        console.log('createPage existing', existing);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        if (existing?.data?.length) return { data: existing.data[0] };
      } catch (e) {
        console.log('createPage error 2', e);
        /* ignore */
      }
      throw e;
    }
  }

  async updatePageById(
    id: number,
    input: Partial<PageInput> | (Partial<PageInput> & { publish?: boolean }),
  ) {
    const safe = this.sanitizeUpdate(input);
    try {
      return await this._updatePageById(id, safe);
    } catch (e) {
      if (isInvalidBlocksError(e) && 'blocks' in (safe as any)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { ...safeNoBlocks } = safe as any;
        return await this._updatePageById(
          id,
          safeNoBlocks as Partial<PageInput>,
        );
      }
      throw e;
    }
  }

  async publishPage(id: number) {
    return this.updatePageById(id, { publishedAt: new Date().toISOString() });
  }

  /** Upsert idempotente por slug (publish opcional) */
  async ensureOrUpdatePage(input: PageInput & { publish?: boolean }) {
    const { publish, ...rest } = input;

    // 1) GET preview
    let existing: { data: any[] };
    try {
      existing = await this.getPageBySlug(rest.slug);
    } catch {
      existing = { data: [] };
    }

    // 2) UPDATE si existe

    if (Array.isArray(existing?.data) && existing.data.length > 0) {
      const id = (existing.data[0] as { id: number }).id;

      const out = await this.updatePageById(id, {
        title: rest.title,
        blocks: rest.blocks,
      });
      if (publish) await this.publishPage(id);
      return {
        created: false,
        updated: true,
        data: (out as { data: unknown }).data ?? out,
      };
    }

    // 3) CREATE si no existe
    let created: any;
    try {
      console.log('createPage', rest);
      created = await this.createPage(rest); // ya maneja fallback a GET si choca duplicado
    } catch (e) {
      // Último recurso: intentar GET de nuevo (por si hubo carrera)
      const again = await this.getPageBySlug(rest.slug).catch(() => ({
        data: [],
      }));
      if (again?.data?.length) {
        const id = (again.data[0] as { id: number }).id;
        const out = await this.updatePageById(id, {
          title: rest.title,
          blocks: rest.blocks,
        });
        if (publish) await this.publishPage(id);
        return {
          created: false,
          updated: true,
          data: (out as { data: unknown }).data ?? out,
        };
      }
      throw e;
    }

    const id = (created as { data: { id: number } })?.data?.id;
    if (publish && id) await this.publishPage(id);
    return {
      created: true,
      updated: false,
      data: (created as { data: unknown }).data,
    };
  }
}
