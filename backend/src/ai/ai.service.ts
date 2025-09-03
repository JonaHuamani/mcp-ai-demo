import fetch from 'cross-fetch';
import { Injectable } from '@nestjs/common';
import { uiPlanSchema, UIPlan } from '../schemas/ui-plan';

@Injectable()
export class AiService {
  private readonly ollama = process.env.OLLAMA_URL || 'http://localhost:11434';
  private readonly loopPort = Number(process.env.PORT || 3001);
  private readonly mcpUrl = `http://127.0.0.1:${this.loopPort}/mcp`; // loopback al MCP interno

  // OpenAI configuration
  private readonly llmProvider = process.env.LLM_PROVIDER || 'ollama';
  private readonly openaiApiKey = process.env.OPENAI_API_KEY || '';
  private readonly openaiModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  private async mcpCallTool(
    name: string,
    args: Record<string, unknown>,
  ): Promise<Array<{ type: 'text'; text: string }>> {
    type JsonRpcOk = {
      result?: {
        content?: unknown;
      };
    };
    const isRecord = (v: unknown): v is Record<string, unknown> =>
      typeof v === 'object' && v !== null;
    const isTextContent = (v: unknown): v is { type: 'text'; text: string } =>
      isRecord(v) && v.type === 'text' && typeof v.text === 'string';
    const isContentArray = (
      v: unknown,
    ): v is Array<{ type: 'text'; text: string }> =>
      Array.isArray(v) && v.every(isTextContent);
    const hasContent = (v: unknown): v is { content: unknown } =>
      isRecord(v) && 'content' in v;

    const payload = {
      jsonrpc: '2.0',
      id: `${Date.now()}`,
      method: 'tools/call',
      params: { name, arguments: args },
    };
    const r = await fetch(this.mcpUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const jUnknown: unknown = await r.json();
    const jr = jUnknown as JsonRpcOk;
    if (isRecord(jr) && 'result' in jr && hasContent(jr.result)) {
      const contentUnknown = jr.result.content;
      if (isContentArray(contentUnknown)) {
        return contentUnknown;
      }
    }
    return [];
  }

  private safeJsonParse<T>(text: string, fallback: T): T {
    try {
      return JSON.parse(text) as T;
    } catch {
      return fallback;
    }
  }

  private extractJsonFromText(text: string): string | null {
    if (typeof text !== 'string' || text.trim().length === 0) return null;
    const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence && fence[1]) return fence[1].trim();
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first !== -1 && last !== -1 && last > first)
      return text.slice(first, last + 1).trim();
    return null;
  }

  private async callOpenAI(prompt: string): Promise<string> {
    console.log(
      '[AI Service] Calling OpenAI API with model:',
      this.openaiModel,
    );

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: this.openaiModel,
        messages: [
          {
            role: 'system',
            content:
              'Eres un generador de interfaces dinámicas. Siempre respondes con JSON válido sin explicaciones adicionales.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.9, // Más creatividad
        max_tokens: 1500,
        response_format: { type: 'json_object' }, // Forzar respuesta JSON
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${error}`);
    }

    const data = (await response.json()) as {
      choices: Array<{
        message: {
          content: string;
        };
      }>;
    };

    return data.choices[0]?.message?.content || '';
  }

  private async callOllama(prompt: string): Promise<string> {
    console.log('[AI Service] Calling Ollama with deepseek-coder');

    const llmRes = await fetch(`${this.ollama}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'deepseek-coder', prompt, stream: false }),
    });

    if (!llmRes.ok) {
      throw new Error(`Ollama error ${llmRes.status}: ${await llmRes.text()}`);
    }

    const llmText = await llmRes.text();

    // Extraer solo el campo 'response' de la respuesta de Ollama
    try {
      const ollamaResponse = JSON.parse(llmText) as { response?: string };
      return ollamaResponse.response || '';
    } catch {
      return llmText;
    }
  }

  async generateUiPlan(body: {
    route?: string;
    signals?: Record<string, unknown>;
  }): Promise<UIPlan> {
    const routeInput = body?.route;
    const route =
      typeof routeInput === 'string' && routeInput.length > 0
        ? routeInput
        : '/home';
    const slug = route === '/' ? 'home' : String(route).replace(/^\//, '');
    const signals: Record<string, unknown> = body?.signals ?? {};

    // 1) Contexto desde MCP (Strapi vía tool) + fallback mock
    let cmsJson: unknown = {};
    try {
      const cmsContent = await this.mcpCallTool('cms.page.get', { slug });
      const cmsText = cmsContent.find((c) => c.type === 'text')?.text ?? '{}';
      const extractedCms = this.extractJsonFromText(cmsText) ?? cmsText;
      cmsJson = this.safeJsonParse(extractedCms, {});

      // Si no hay contenido real, usar datos mock para la demo
      const parsed = cmsJson as { data?: unknown[] };
      if (
        !parsed.data ||
        (Array.isArray(parsed.data) && parsed.data.length === 0)
      ) {
        cmsJson = {
          data: [
            {
              id: 1,
              attributes: {
                slug,
                title: slug === 'home' ? 'Página Principal' : `Página ${slug}`,
                blocks: [
                  {
                    type: 'hero',
                    title:
                      slug === 'home'
                        ? 'Bienvenido a nuestra tienda'
                        : `Descubre ${slug}`,
                    subtitle:
                      'Contenido personalizado basado en tus preferencias',
                    ctaText: 'Explorar ahora',
                  },
                  {
                    type: 'category-grid',
                    categories: ['Moda', 'Fitness', 'Tecnología', 'Hogar'],
                  },
                ],
              },
            },
          ],
        };
      }
    } catch {
      // Fallback completo con datos mock
      cmsJson = {
        data: [
          {
            attributes: {
              slug,
              title: `Página ${slug}`,
              blocks: [
                {
                  type: 'hero',
                  title: 'Contenido dinámico',
                  subtitle: 'Generado por IA según el contexto',
                },
              ],
            },
          },
        ],
      };
    }

    // 2) Prompt + contrato de UI Plan
    const contextSnippet = JSON.stringify(cmsJson).slice(0, 8000);

    // Generar contenido dinámico basado en signals
    const signalsInfo = signals || {};
    const isLoggedIn = signalsInfo.isLoggedIn ?? false;
    const device = signalsInfo.device ?? 'desktop';
    const interests = Array.isArray(signalsInfo.interests)
      ? signalsInfo.interests
      : [];
    const spendTier = signalsInfo.spendTier ?? 'basic';
    const timeOfDay = signalsInfo.timeOfDay ?? 'afternoon';
    const locale = signalsInfo.locale ?? 'es-PE';

    // Generar variaciones basadas en contexto
    const currentHour = new Date().getHours();
    const dayOfWeek = new Date().toLocaleDateString('es-PE', {
      weekday: 'long',
    });
    const season =
      currentHour < 6
        ? 'madrugada'
        : currentHour < 12
          ? 'mañana'
          : currentHour < 18
            ? 'tarde'
            : 'noche';

    const prompt = `Eres un generador de interfaces dinámicas creativo. Devuelve ÚNICAMENTE JSON válido.

ESQUEMA REQUERIDO:
{
  "version": "1",
  "sections": [
    {
      "id": "hero-1",
      "type": "Hero",
      "props": {
        "title": "string",
        "subtitle": "string",
        "ctaText": "string",
        "variant": "${signalsInfo.ab || 'hero-a'}"
      }
    },
    {
      "id": "category-grid-1",
      "type": "CategoryGrid",
      "props": {
        "items": [
          {"label": "string1", "href": "/category1"},
          {"label": "string2", "href": "/category2"},
          {"label": "string3", "href": "/category3"},
          {"label": "string4", "href": "/category4"}
        ]
      }
    }
  ]
}

CONTEXTO TEMPORAL:
- Día: ${dayOfWeek}
- Momento: ${season}
- Hora exacta: ${currentHour}:00

PERFIL DEL USUARIO:
- Autenticado: ${isLoggedIn ? 'SÍ (usuario recurrente, personalizar)' : 'NO (visitante nuevo, captar atención)'}
- Dispositivo: ${device === 'mobile' ? 'MÓVIL (CTAs grandes, scroll vertical, one-tap actions)' : 'DESKTOP (layouts grid, comparativas, multi-columna)'}
- Intereses declarados: ${interests.length > 0 ? interests.join(', ') : 'sin intereses específicos'}
- Nivel de cliente: ${spendTier === 'enterprise' ? 'VIP MÁXIMO (exclusividad, lujo, concierge)' : spendTier === 'pro' ? 'PRO (premium, preventas)' : spendTier === 'basic' ? 'BÁSICO (ofertas, descuentos)' : 'FREE (promos, outlet)'}
- Preferencia horaria: ${timeOfDay === 'morning' ? 'Madrugador (café, energía)' : timeOfDay === 'evening' ? 'Tarde (relax, hogar)' : timeOfDay === 'night' ? 'Nocturno (gaming, streaming)' : 'Activo (productividad)'}
- Región: ${locale === 'es-PE' ? 'Perú (S/, envío Lima)' : locale === 'en-US' ? 'USA ($, free shipping)' : locale === 'pt-BR' ? 'Brasil (R$, frete grátis)' : 'Internacional'}

INSTRUCCIONES CREATIVAS:
0. IDIOMA: ${
      locale === 'en-US'
        ? 'Generate ALL content in ENGLISH (title, subtitle, ctaText, categories)'
        : locale === 'pt-BR'
          ? 'Gerar TODO o conteúdo em PORTUGUÊS (título, subtítulo, ctaText, categorias)'
          : 'Generar TODO el contenido en ESPAÑOL (título, subtítulo, ctaText, categorías)'
    }

1. TÍTULO: Genera un saludo MUY VARIADO según:
   - Si es ${dayOfWeek}: menciona el día específico
   - Si es ${season}: adapta el tono (energético/relajado)
   - Si está autenticado: ${locale === 'en-US' ? '"Welcome back", "Good to see you", "Hey there"' : locale === 'pt-BR' ? '"Bem-vindo de volta", "Que bom te ver", "Olá novamente"' : '"Qué bueno verte", "Has vuelto", "Te estábamos esperando"'}
   - Si NO está autenticado: ${locale === 'en-US' ? '"Discover", "Explore", "Welcome"' : locale === 'pt-BR' ? '"Descubra", "Explore", "Bem-vindo"' : '"Descubre", "Explora", "Bienvenido"'}
   - Para ${device}: móvil = títulos cortos (3-5 palabras), desktop = más descriptivos

2. SUBTÍTULO: Debe ser ÚNICO y mencionar:
   - Para ${spendTier}: enterprise="exclusividades VIP", pro="beneficios pro", basic="ofertas del día", free="descubre gratis"
   - Si tiene intereses (${interests.join(', ')}): menciónalos sutilmente
   - Hora del día: mañana="comienza bien", tarde="aprovecha la tarde", noche="ofertas nocturnas"

3. CTA (Call to Action): VARÍA según contexto:
   - Mañana: "Empezar el día", "Ver novedades", "Explorar ahora"
   - Tarde: "Aprovechar ofertas", "Descubrir más", "Ver destacados"
   - Noche: "Ofertas nocturnas", "Últimas oportunidades", "Ver especiales"
   - ${spendTier === 'enterprise' ? '"Acceso VIP", "Ver exclusivos"' : '"Explorar", "Ver más"'}

4. CATEGORÍAS: Genera 4 categorías DINÁMICAS:
   - SIEMPRE incluye los intereses del usuario (${interests.join(', ')}) si los tiene
   - Agrega categorías relevantes para ${season} y ${dayOfWeek}
   - Para enterprise: categorías premium/exclusivas
   - Para mobile: nombres cortos
   - URLs deben ser consistentes: /c/nombre-categoria

5. VARIACIÓN OBLIGATORIA:
   - NO uses "Bienvenido" genérico
   - NO uses siempre "Ver más" como CTA
   - Cambia las categorías según el contexto temporal
   - Sé creativo con los mensajes

GENERA UN PLAN ÚNICO Y CREATIVO. JSON PURO:`;

    // 3) Llamar al LLM según el proveedor configurado
    console.log(`[AI Service] Using LLM provider: ${this.llmProvider}`);
    console.log(
      '[AI Service] Sending prompt:',
      prompt.substring(0, 200) + '...',
    );

    let llmResponse = '';

    try {
      if (this.llmProvider === 'openai') {
        // Usar OpenAI
        llmResponse = await this.callOpenAI(prompt);
      } else {
        // Usar Ollama (por defecto)
        llmResponse = await this.callOllama(prompt);
      }
    } catch (error) {
      console.error('[AI Service] LLM call failed:', error);
      // Si falla el LLM, usar el fallback
      llmResponse = '';
    }

    console.log(
      '[AI Service] LLM response:',
      llmResponse.substring(0, 200) + '...',
    );

    // Extraer JSON de la respuesta
    let candidate = '';
    if (llmResponse) {
      candidate = this.extractJsonFromText(llmResponse) ?? llmResponse;
    }

    console.log(
      '[AI Service] Extracted JSON candidate:',
      candidate.substring(0, 200) + '...',
    );

    // 4) Validación del plan con fallback robusto
    let parsedPlan: UIPlan;
    try {
      const maybeObj = this.safeJsonParse(candidate, {});
      console.log(
        '[AI Service] Parsed object:',
        JSON.stringify(maybeObj).substring(0, 200) + '...',
      );
      parsedPlan = uiPlanSchema.parse(maybeObj);
      console.log(
        '[AI Service] Validated plan:',
        JSON.stringify(parsedPlan).substring(0, 200) + '...',
      );
    } catch (error) {
      console.log(
        '[AI Service] Validation failed, using dynamic fallback:',
        error,
      );

      // Fallback dinámico con más variación
      const randomGreetings = [
        '¡Qué alegría verte!',
        'Has vuelto justo a tiempo',
        'Te estábamos esperando',
        '¡Hola otra vez!',
        'Qué bueno que estás aquí',
      ];

      const randomExplore = [
        'Explora lo nuevo',
        'Descubre hoy',
        'Encuentra tu estilo',
        'Comienza tu aventura',
        'Conoce nuestro mundo',
      ];

      const title = isLoggedIn
        ? `${randomGreetings[Math.floor(Math.random() * randomGreetings.length)]} ${timeOfDay === 'morning' ? '☀️' : timeOfDay === 'evening' ? '🌙' : '✨'}`
        : randomExplore[Math.floor(Math.random() * randomExplore.length)];

      const subtitle =
        device === 'mobile'
          ? `${spendTier === 'enterprise' ? 'VIP exclusivo' : 'Especial'} para ti`
          : `${interests.length > 0 ? `Todo en ${interests[0]}` : 'Personalizado'} ${spendTier === 'enterprise' ? 'con beneficios VIP' : 'para ti'}`;

      const ctaActions: Record<string, string[]> = {
        morning: ['Empezar el día', 'Ver lo nuevo', 'Explorar ahora'],
        afternoon: ['Descubrir más', 'Ver ofertas', 'Explorar'],
        evening: ['Ver especiales', 'Últimas ofertas', 'Descubrir'],
        night: ['Ofertas nocturnas', 'Ver exclusivos', 'Explorar noche'],
      };

      const ctaOptions =
        ctaActions[timeOfDay as string] || ctaActions.afternoon;
      const ctaText = ctaOptions[Math.floor(Math.random() * ctaOptions.length)];

      // Categorías dinámicas basadas en contexto
      const timeCategories: Record<string, string[]> = {
        morning: ['Desayunos', 'Energía', 'Café', 'Matutino'],
        afternoon: ['Destacados', 'Ofertas', 'Tendencias', 'Popular'],
        evening: ['Relax', 'Hogar', 'Entretenimiento', 'Cena'],
        night: ['Nocturno', 'Streaming', 'Gaming', 'Snacks'],
      };

      const premiumCategories = ['Exclusivos', 'Premium', 'VIP', 'Lujo'];
      const basicCategories = ['Ofertas', 'Outlet', 'Descuentos', 'Básicos'];

      let categories =
        timeCategories[timeOfDay as string] || timeCategories.afternoon;

      if (spendTier === 'enterprise') {
        categories = premiumCategories;
      } else if (spendTier === 'free') {
        categories = basicCategories;
      }

      if (interests.length > 0) {
        const capitalizedInterests = interests
          .map((i) =>
            typeof i === 'string'
              ? i.charAt(0).toUpperCase() + i.slice(1).toLowerCase()
              : '',
          )
          .filter(Boolean);
        // Mezclar intereses con categorías contextuales
        categories = [...capitalizedInterests, ...categories].slice(0, 4);
      }

      // Convertir categorías a formato items con label y href
      const items = categories.map((cat) => ({
        label: cat,
        href: `/category/${cat.toLowerCase().replace(/\s+/g, '-')}`,
      }));

      parsedPlan = {
        version: '1',
        sections: [
          {
            id: 'hero-1',
            type: 'Hero',
            props: {
              title,
              subtitle,
              ctaText,
              variant: signalsInfo.ab || 'hero-a',
            },
          },
          {
            id: 'category-grid-1',
            type: 'CategoryGrid',
            props: {
              items,
            },
          },
        ],
      } as UIPlan;
    }
    return parsedPlan;
  }
}
