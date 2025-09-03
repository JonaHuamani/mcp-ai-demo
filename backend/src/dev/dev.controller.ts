import { Controller, Post } from '@nestjs/common';
import { StrapiService } from '../strapi/strapi.service';
import * as fs from 'fs';
import * as path from 'path';

@Controller('dev')
export class DevController {
  constructor(private readonly strapi: StrapiService) {}

  /**
   * Seed endpoint para crear múltiples páginas con contenido rico
   * Lee desde seed-data.json para crear home, categories, deals, trending
   */
  @Post('seed')
  async seedMinimal() {
    try {
      // Leer el archivo JSON con los datos
      const seedDataPath = path.join(
        process.cwd(),
        'src',
        'dev',
        'seed-data.json',
      );
      const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));

      console.log(
        `📚 Leyendo ${seedData.pages.length} páginas desde seed-data.json`,
      );

      // Crear todas las páginas
      const results: any[] = [];
      for (const page of seedData.pages) {
        try {
          console.log(`🌱 Creando página: ${page.slug} - ${page.title}`);

          const result = await this.strapi.ensureOrUpdatePage({
            ...page,
            publish: true,
          });

          results.push({
            slug: page.slug,
            title: page.title,
            ...result,
          });

          console.log(
            `✅ ${page.slug}: ${result.created ? 'Creada' : 'Actualizada'}`,
          );
        } catch (error) {
          console.log(`❌ Error creando ${page.slug}:`, error);
          results.push({
            slug: page.slug,
            title: page.title,
            created: false,
            updated: false,
            mock: true,
            data: page,
            error: String(error),
          });
        }
      }

      const summary = {
        total: seedData.pages.length,
        created: results.filter((r: any) => r.created).length,
        updated: results.filter((r: any) => r.updated).length,
        mocked: results.filter((r: any) => r.mock).length,
        failed: results.filter((r: any) => r.error).length,
      };

      console.log(`📊 Resumen del seed:`, summary);

      return {
        ok: true,
        message: 'Multiple pages seeded successfully from JSON',
        pages: seedData.pages.map((p) => ({ slug: p.slug, title: p.title })),
        results,
        summary,
        dataSource: 'seed-data.json',
      };
    } catch (error) {
      console.log('❌ Seed error:', error);
      return {
        ok: false,
        message: 'Seed failed',
        error: String(error),
      };
    }
  }

  /**
   * Seed simple para una sola página (fallback)
   */
  @Post('seed/simple')
  async seedSimple() {
    const richContent = {
      campaigns: {
        current: [
          {
            id: 'black-friday',
            name: 'Black Friday Exclusivo',
            discount: '50%',
            categories: ['tech', 'gaming'],
          },
          {
            id: 'cyber-week',
            name: 'Cyber Week Premium',
            discount: '40%',
            categories: ['moda', 'fitness'],
          },
        ],
      },
      categories: {
        trending: [
          { name: 'Tecnología', icon: '💻', items: 1250, growth: '+45%' },
          { name: 'Moda Sostenible', icon: '♻️', items: 890, growth: '+120%' },
        ],
      },
    };

    try {
      const result = await this.strapi.ensureOrUpdatePage({
        slug: 'home-simple',
        title: 'Home Simple',
        blocks: richContent as any,
        publish: true,
      });

      return {
        ok: true,
        message: 'Simple content seeded',
        result,
        summary: {
          total: 1,
          created: result.created ? 1 : 0,
          updated: result.updated ? 1 : 0,
          mocked: 0,
        },
      };
    } catch (error) {
      return {
        ok: true,
        message: 'Using simple mock data',
        data: richContent,
        mock: true,
        summary: { total: 1, created: 0, updated: 0, mocked: 1 },
      };
    }
  }

  /**
   * Endpoint para ver el contenido del archivo JSON
   */
  @Post('seed/info')
  async getSeedInfo() {
    try {
      const seedDataPath = path.join(
        process.cwd(),
        'src',
        'dev',
        'seed-data.json',
      );
      const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));

      return {
        ok: true,
        message: 'Seed data info',
        totalPages: seedData.pages.length,
        pages: seedData.pages.map((p: any) => ({
          slug: p.slug,
          title: p.title,
          hasBlocks: !!p.blocks,
          blockKeys: p.blocks ? Object.keys(p.blocks) : [],
        })),
        fileSize: fs.statSync(seedDataPath).size,
        lastModified: fs.statSync(seedDataPath).mtime,
      };
    } catch (error) {
      return {
        ok: false,
        message: 'Could not read seed data',
        error: String(error),
      };
    }
  }
}
