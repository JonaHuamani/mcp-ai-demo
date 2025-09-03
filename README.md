# 🤖 MCP AI Demo

Demo de personalización de UI usando **Model Context Protocol (MCP)** + **IA** + **Signals**.

## 🚀 Inicio Rápido

### 1. **Configurar Variables de Entorno**

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus valores reales
nano .env
```

### 2. **Levantar el Proyecto**

```bash
# Levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### 3. **Acceder a los Servicios**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Strapi CMS**: http://localhost:1337
- **Ollama**: http://localhost:11434

## 📁 Estructura del Proyecto

```
mcp-ai-demo/
├── frontend/          # Next.js App con personalización por signals
├── backend/           # NestJS API con integración de IA
├── docker-compose.yml # Orquestación de servicios
├── .env.example       # Variables de entorno de ejemplo
└── SIGNALS_ANALYSIS.md # Análisis detallado de signals
```

## 🔧 Configuración Requerida

### **OpenAI API Key**
1. Ve a https://platform.openai.com/api-keys
2. Crea una nueva API key
3. Agrégala a tu archivo `.env`

### **Strapi Secrets**
1. Levanta Strapi: `docker-compose up strapi`
2. Ve a http://localhost:1337/admin
3. Configura admin y obtén tokens desde Settings → API Tokens

## 🎯 Cómo Funciona

1. **Signals**: El usuario completa un formulario con preferencias
2. **MCP**: Los signals se envían al backend via Model Context Protocol
3. **IA**: OpenAI/Ollama genera UI personalizada basada en los signals
4. **Render**: El frontend renderiza la UI personalizada dinámicamente

## 📊 Signals Implementados

- `ab`: A/B Testing de componentes
- `interests`: Personalización por intereses
- `spendTier`: Nivel de gasto del usuario
- `timeOfDay`: Contexto temporal
- `isLoggedIn`: Estado de autenticación
- `locale`: Localización (parcial)
- `device`: Tipo de dispositivo (parcial)

Ver `SIGNALS_ANALYSIS.md` para análisis completo.

## 🛠️ Desarrollo

```bash
# Backend (NestJS)
cd backend
npm install
npm run start:dev

# Frontend (Next.js)
cd frontend
npm install
npm run dev
```

## 📝 Notas

- Usa Ollama para desarrollo local sin costos
- OpenAI para mejor calidad de respuestas
- Strapi para gestión de contenido dinámico
- Docker para ambiente consistente
