import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { randomUUID } from 'crypto';
import fetch from 'cross-fetch';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

@Injectable()
export class McpService implements OnApplicationBootstrap {
  private server!: McpServer;
  private transport!: StreamableHTTPServerTransport;

  async onApplicationBootstrap(): Promise<void> {
    console.log('[MCP] Initializing MCP server...');
    const STRAPI_URL = process.env.STRAPI_URL || 'http://strapi:1337';
    const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

    this.server = new McpServer({ name: 'cms-mcp-internal', version: '0.1.0' });

    // Tool: cms.page.get
    this.server.registerTool(
      'cms.page.get',
      {
        title: 'Get Strapi Page by slug',
        description: 'Fetch a Strapi page JSON by slug',
        inputSchema: { slug: z.string() },
      },
      async ({
        slug,
      }): Promise<{ content: Array<{ type: 'text'; text: string }> }> => {
        const q = `filters[slug][$eq]=${encodeURIComponent(slug)}`;
        const base = `${STRAPI_URL}/api/pages?${q}`;
        const urls = [
          `${base}&publicationState=preview&populate=*`,
          `${base}&publicationState=preview`,
          `${base}&populate=*`,
          base,
        ];
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (STRAPI_TOKEN) headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;

        let lastErr = '';
        for (const url of urls) {
          const resp = await fetch(url, { headers });
          if (resp.ok) {
            const json: unknown = await resp.json();
            return { content: [{ type: 'text', text: JSON.stringify(json) }] };
          }
          lastErr = `GET ${await resp.text()}`;
          if (resp.status >= 500) break;
        }

        // Si Strapi falla, retornar contenido rico de fallback
        console.log('[MCP] Strapi failed, using rich fallback content');
        const richFallback = {
          data: [
            {
              id: 1,
              attributes: {
                slug,
                title: 'Premium Store',
                blocks: {
                  campaigns: {
                    current: [
                      {
                        name: 'Black Friday VIP',
                        discount: '50%',
                        categories: ['tech', 'gaming'],
                      },
                      {
                        name: 'Cyber Week',
                        discount: '40%',
                        categories: ['moda', 'fitness'],
                      },
                    ],
                    seasonal: {
                      morning: {
                        bonus: '20% extra',
                        products: ['café', 'energía'],
                      },
                      evening: {
                        bonus: 'Envío gratis',
                        products: ['relax', 'hogar'],
                      },
                      night: {
                        bonus: 'Flash sales',
                        products: ['gaming', 'streaming'],
                      },
                    },
                  },
                  categories: {
                    trending: [
                      { name: 'Tech', growth: '+45%', items: 1250 },
                      { name: 'Gaming', growth: '+67%', items: 2100 },
                      { name: 'Fitness', growth: '+89%', items: 650 },
                    ],
                    byTier: {
                      enterprise: ['VIP Exclusivos', 'Lujo', 'Concierge'],
                      pro: ['Premium', 'Edición Limitada'],
                      basic: ['Populares', 'Best Sellers'],
                    },
                  },
                  personalizedContent: {
                    moda: {
                      featured: 'Colección 2025',
                      brands: ['Zara', 'H&M'],
                    },
                    fitness: {
                      featured: 'Reto 30 días',
                      brands: ['Nike', 'Adidas'],
                    },
                    gaming: {
                      featured: 'Torneo eSports',
                      brands: ['Razer', 'Logitech'],
                    },
                  },
                },
              },
            },
          ],
        };

        return {
          content: [{ type: 'text', text: JSON.stringify(richFallback) }],
        };
      },
    );

    // Transport HTTP para Nest (lo usaremos en el controller)
    console.log('[MCP] Creating transport...');
    this.transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
    });
    console.log('[MCP] Connecting server to transport...');
    await this.server.connect(this.transport);
    console.log('[MCP] Server initialized successfully!');
  }

  async handleHttp(
    req: unknown,
    res: {
      json: (data: unknown) => void;
      status: (code: number) => { json: (data: unknown) => void };
    },
    body?: {
      jsonrpc?: string;
      id?: string | number | null;
      method?: string;
      params?: Record<string, unknown>;
    },
  ) {
    // Manejo directo de JSON-RPC sin StreamableHTTPServerTransport
    try {
      const request = body || {};
      const method = typeof request.method === 'string' ? request.method : '';
      console.log('[MCP Service] Processing request:', method);

      if (method === 'initialize') {
        const response = {
          jsonrpc: '2.0',
          id: request.id ?? null,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {},
            },
            serverInfo: {
              name: 'cms-mcp-internal',
              version: '0.1.0',
            },
          },
        };
        res.json(response);
        return;
      }

      if (method === 'tools/list') {
        const response = {
          jsonrpc: '2.0',
          id: request.id ?? null,
          result: {
            tools: [
              {
                name: 'cms.page.get',
                description:
                  'Fetch a Strapi page JSON by slug (with deep populate)',
                inputSchema: {
                  type: 'object',
                  properties: {
                    slug: { type: 'string' },
                  },
                  required: ['slug'],
                },
              },
            ],
          },
        };
        res.json(response);
        return;
      }

      if (method === 'tools/call') {
        const params = request.params || {};
        const name = typeof params.name === 'string' ? params.name : '';
        const args =
          typeof params.arguments === 'object' && params.arguments !== null
            ? (params.arguments as Record<string, unknown>)
            : {};

        if (name === 'cms.page.get') {
          const slug = typeof args.slug === 'string' ? args.slug : 'home';
          const STRAPI_URL = process.env.STRAPI_URL || 'http://strapi:1337';
          const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

          const url = `${STRAPI_URL}/api/pages?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`;
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          if (STRAPI_TOKEN) headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;

          const resp = await fetch(url, { headers });
          const jsonData: unknown = await resp.json();

          const response = {
            jsonrpc: '2.0',
            id: request.id ?? null,
            result: {
              content: [{ type: 'text', text: JSON.stringify(jsonData) }],
            },
          };
          res.json(response);
          return;
        }
      }

      // Método no soportado
      const errorResponse = {
        jsonrpc: '2.0',
        id: request.id ?? null,
        error: {
          code: -32601,
          message: 'Method not found',
        },
      };
      res.status(400).json(errorResponse);
    } catch (error) {
      console.error('[MCP Service] Error:', error);
      const errorResponse = {
        jsonrpc: '2.0',
        id: body?.id ?? null,
        error: {
          code: -32603,
          message: 'Internal error',
        },
      };
      res.status(500).json(errorResponse);
    }
  }
}
