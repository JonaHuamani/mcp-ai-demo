# Análisis de Signals y Mejoras Necesarias

## 📊 Estado Actual de los Signals

### ✅ **Signals Funcionando Correctamente:**

1. **`ab` (A/B Testing)**

   - ✅ Implementado en frontend y backend
   - ✅ Soporta variantes `hero-a` y `hero-b`
   - ✅ El componente Hero renderiza diferentes diseños
   - **Uso**: Determina el diseño visual del Hero

2. **`interests` (Intereses)**

   - ✅ Se usa en el prompt de la IA
   - ✅ Influye en las categorías generadas
   - ✅ Tiene contenido personalizado en el seed
   - **Uso**: Personaliza categorías y contenido

3. **`spendTier` (Nivel de Gasto)**

   - ✅ Se usa para determinar categorías premium/básicas
   - ✅ Tiene beneficios específicos en el seed
   - **Valores**: `free`, `basic`, `pro`, `enterprise`
   - **Uso**: Ajusta ofertas y beneficios mostrados

4. **`timeOfDay` (Hora del Día)**

   - ✅ Se usa para CTAs y categorías contextuales
   - ✅ Tiene campañas específicas por hora en el seed
   - **Valores**: `morning`, `afternoon`, `evening`, `night`
   - **Uso**: Mensajes y productos relevantes a la hora

5. **`isLoggedIn` (Estado de Login)**
   - ✅ Se usa en el prompt para personalización
   - ✅ Cambia el tono del mensaje (nuevo vs recurrente)
   - **Uso**: Personaliza saludos y CTAs

### ⚠️ **Signals Parcialmente Implementados:**

1. **`locale` (Localización)**

   - ⚠️ Se captura pero NO se usa efectivamente
   - **Estado actual**: Siempre genera contenido en español
   - **Mejora necesaria**: Implementar soporte multiidioma

2. **`device` (Dispositivo)**
   - ⚠️ Se captura pero tiene uso limitado
   - **Estado actual**: Solo se menciona en el prompt
   - **Mejora necesaria**: Ajustar layouts y tamaños según dispositivo

### ❌ **Signals No Implementados (pero en el form):**

Ninguno - todos los signals del formulario están al menos parcialmente implementados.

## 🔧 Mejoras Necesarias

### 1. **Mejorar soporte de `locale`**

```typescript
// En ai.service.ts, agregar lógica de idioma:
const languageMap = {
  "es-PE": { greeting: "Hola", cta: "Explorar" },
  "en-US": { greeting: "Hello", cta: "Explore" },
  "pt-BR": { greeting: "Olá", cta: "Explorar" },
};
```

### 2. **Optimizar `device` para layouts responsivos**

```typescript
// Agregar en el prompt:
- Para mobile: Priorizar scroll vertical, CTAs grandes
- Para desktop: Aprovechar layouts en grid, más contenido visible
```

### 3. **Expandir variantes A/B**

```typescript
// Agregar más experimentos:
- 'category-a' vs 'category-b': Diferentes estilos de grid
- 'cta-a' vs 'cta-b': Diferentes textos y colores de botones
```

### 4. **Enriquecer el seed con más contexto**

#### Campañas por dispositivo:

```javascript
deviceCampaigns: {
  mobile: {
    features: ['One-tap checkout', 'App exclusive deals', 'Swipe navigation'],
    layout: 'vertical-scroll'
  },
  desktop: {
    features: ['Multi-window shopping', 'Advanced filters', 'Comparison tools'],
    layout: 'grid-layout'
  }
}
```

#### Contenido por locale:

```javascript
localeContent: {
  'es-PE': {
    currency: 'S/',
    shipping: 'Envío gratis en Lima',
    holidays: ['Fiestas Patrias', 'Navidad']
  },
  'en-US': {
    currency: '$',
    shipping: 'Free shipping over $50',
    holidays: ['Black Friday', 'Cyber Monday']
  }
}
```

#### Más intereses con contenido específico:

```javascript
interests: {
  deportes: {
    featured: 'Mundial 2026',
    brands: ['Nike', 'Adidas', 'Puma'],
    categories: ['Fútbol', 'Running', 'Gym']
  },
  hogar: {
    featured: 'Smart Home 2025',
    brands: ['IKEA', 'Home Depot'],
    categories: ['Muebles', 'Decoración', 'Jardín']
  },
  belleza: {
    featured: 'Skincare Coreano',
    brands: ['Sephora', 'MAC', 'L\'Oreal'],
    categories: ['Maquillaje', 'Cuidado Facial', 'Perfumes']
  }
}
```

## 📈 Matriz de Uso de Signals

| Signal       | Frontend | Backend | AI Prompt | Seed Data | Impacto Visual |
| ------------ | -------- | ------- | --------- | --------- | -------------- |
| `ab`         | ✅       | ✅      | ✅        | ❌        | ✅ Alto        |
| `interests`  | ✅       | ✅      | ✅        | ✅        | ✅ Alto        |
| `spendTier`  | ✅       | ✅      | ✅        | ✅        | ✅ Alto        |
| `timeOfDay`  | ✅       | ✅      | ✅        | ✅        | ⚠️ Medio       |
| `isLoggedIn` | ✅       | ✅      | ✅        | ❌        | ⚠️ Medio       |
| `locale`     | ✅       | ⚠️      | ⚠️        | ❌        | ❌ Bajo        |
| `device`     | ✅       | ⚠️      | ⚠️        | ❌        | ❌ Bajo        |

## 🎯 Prioridades de Implementación

1. **Alta Prioridad**:

   - Agregar más variantes A/B (category-grid, banners)
   - Enriquecer seed con contenido por dispositivo y locale

2. **Media Prioridad**:

   - Implementar lógica de locale para multiidioma
   - Ajustar layouts según dispositivo

3. **Baja Prioridad**:
   - Agregar más intereses específicos
   - Crear variantes de tiempo más granulares

## 🚀 Signals Adicionales Sugeridos

1. **`userHistory`**: Productos vistos recientemente
2. **`cartValue`**: Valor actual del carrito
3. **`loyaltyPoints`**: Puntos de fidelidad
4. **`preferredCategories`**: Categorías más visitadas
5. **`seasonalContext`**: Temporada/festividad actual
6. **`weatherContext`**: Clima actual (para productos relevantes)
7. **`referralSource`**: De dónde viene el usuario (email, social, direct)

## 📝 Conclusión

El sistema de signals está **70% implementado**. Los signals principales funcionan bien, pero hay oportunidades para:

- Mejorar el uso de `locale` y `device`
- Expandir las variantes A/B
- Enriquecer el contenido del seed
- Agregar más contexto dinámico

Para la demo, los signals actuales son suficientes para mostrar el poder de la personalización con MCP + IA, pero estas mejoras harían la demo aún más impresionante.
