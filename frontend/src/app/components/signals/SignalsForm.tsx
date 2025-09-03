'use client';

import React from 'react';
import { useSignals } from './SignalsContext';
import type { Signals } from './types';
import { CMSDataDisplay } from '../CMSDataDisplay';

function toArray(input: string): string[] {
  return input.split(',').map(s => s.trim()).filter(Boolean);
}

export default function SignalsForm({ onApply }: { onApply?: (s: Signals) => void }) {
  const { signals, setSignals } = useSignals();
  const [open, setOpen] = React.useState(false);
  const [showCMSData, setShowCMSData] = React.useState(false);

  const [locale, setLocale] = React.useState(signals.locale ?? 'es-PE');
  const [device, setDevice] = React.useState<Signals['device']>(signals.device ?? 'desktop');
  const [ab, setAb] = React.useState(signals.ab ?? '');
  const [interests, setInterests] = React.useState((signals.interests ?? []).join(', '));
  const [isLoggedIn, setIsLoggedIn] = React.useState(!!signals.isLoggedIn);
  const [spendTier, setSpendTier] = React.useState<Signals['spendTier']>(signals.spendTier ?? 'basic');
  const [timeOfDay, setTimeOfDay] = React.useState<Signals['timeOfDay']>(signals.timeOfDay ?? 'afternoon');

  function apply(e?: React.FormEvent) {
    e?.preventDefault();
    const next: Signals = {
      locale, device, ab: ab || undefined,
      interests: toArray(interests),
      isLoggedIn, spendTier, timeOfDay,
    };
    setSignals(next);
    onApply?.(next);
  }
  
  function resetToCurrent() {
    setLocale(signals.locale ?? 'es-PE');
    setDevice(signals.device ?? 'desktop');
    setAb(signals.ab ?? '');
    setInterests((signals.interests ?? []).join(', '));
    setIsLoggedIn(!!signals.isLoggedIn);
    setSpendTier(signals.spendTier ?? 'basic');
    setTimeOfDay(signals.timeOfDay ?? 'afternoon');
  }

  return (
    <>
      {/* Botón flotante para abrir/cerrar */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-6 rounded-r-lg shadow-lg hover:shadow-xl transition-all duration-300 ${
          open ? 'translate-x-80' : 'translate-x-0'
        }`}
        aria-label="Toggle Signals Panel"
      >
        <div className="flex flex-col items-center gap-2">
          <svg 
            className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="writing-mode-vertical text-sm font-semibold" style={{ writingMode: 'vertical-rl' }}>
            SIGNALS
          </span>
        </div>
      </button>

      {/* Panel lateral flotante */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-40 transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Configuración de Signals</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Cerrar panel"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-white/80 mt-2">Personaliza las señales para generar UI dinámica</p>
            <button
              type="button"
              onClick={() => setShowCMSData(!showCMSData)}
              className="mt-3 px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs rounded-md transition-colors"
            >
              {showCMSData ? '🔒 Ocultar' : '📊 Ver'} Datos CMS
            </button>
          </div>

          {/* Form */}
          <form onSubmit={apply} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Localización y Dispositivo */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Contexto</h3>
              <div className="grid grid-cols-2 gap-4">
                              <label className="block">
                <span className="text-sm font-medium text-gray-700">Locale</span>
                <select 
                  className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border" 
                  value={locale} 
                  onChange={e => setLocale(e.target.value)}
                >
                  <option value="es-PE">🇵🇪 Español (Perú)</option>
                  <option value="en-US">🇺🇸 English (USA)</option>
                  <option value="pt-BR">🇧🇷 Português (Brasil)</option>
                </select>
              </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Dispositivo</span>
                  <select 
                    className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border" 
                    value={device} 
                    onChange={e => setDevice(e.target.value as Signals['device'])}
                  >
                    <option value="desktop">Desktop</option>
                    <option value="mobile">Mobile</option>
                  </select>
                </label>
              </div>
            </div>

            {/* Experimentos e Intereses */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Personalización</h3>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Experimento A/B</span>
                <input 
                  className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border" 
                  value={ab} 
                  onChange={e => setAb(e.target.value)} 
                  placeholder="ej: hero-b, checkout-v2" 
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Intereses (separados por coma)</span>
                <input 
                  className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border" 
                  value={interests} 
                  onChange={e => setInterests(e.target.value)} 
                  placeholder="ej: moda, fitness, tecnología" 
                />
              </label>
            </div>

            {/* Estado del Usuario */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Usuario</h3>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="isLoggedIn"
                  checked={isLoggedIn} 
                  onChange={e => setIsLoggedIn(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isLoggedIn" className="ml-2 text-sm font-medium text-gray-700">
                  Usuario autenticado
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Nivel de gasto</span>
                <select 
                  className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border" 
                  value={spendTier} 
                  onChange={e => setSpendTier(e.target.value as Signals['spendTier'])}
                >
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Hora del día</span>
                <select 
                  className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border" 
                  value={timeOfDay} 
                  onChange={e => setTimeOfDay(e.target.value as Signals['timeOfDay'])}
                >
                  <option value="morning">Mañana (6-12h)</option>
                  <option value="afternoon">Tarde (12-18h)</option>
                  <option value="evening">Noche (18-22h)</option>
                  <option value="night">Madrugada (22-6h)</option>
                </select>
              </label>
            </div>
          </form>

          {/* Footer con botones */}
          <div className="border-t bg-gray-50 px-6 py-4 space-y-3">
            <button 
              type="submit" 
              onClick={apply}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-md hover:from-blue-700 hover:to-purple-700 transition-colors"
            >
              Aplicar cambios
            </button>
            <button 
              type="button" 
              onClick={resetToCurrent} 
              className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Restablecer valores
            </button>
          </div>
        </div>
      </div>

      {/* Datos del CMS */}
      <CMSDataDisplay 
        visible={showCMSData} 
        data={{
          campaigns: {
            current: [
              { name: 'Black Friday Exclusivo', discount: '50%', categories: ['tech', 'gaming'] },
              { name: 'Cyber Week Premium', discount: '40%', categories: ['moda', 'fitness'] },
              { name: 'VIP Members Only', discount: '30%', minTier: 'enterprise' }
            ]
          },
          categories: {
            trending: [
              { name: 'Tecnología', icon: '💻', items: 1250, growth: '+45%' },
              { name: 'Moda Sostenible', icon: '♻️', items: 890, growth: '+120%' },
              { name: 'Gaming Pro', icon: '🎮', items: 2100, growth: '+67%' },
              { name: 'Fitness Tech', icon: '⌚', items: 650, growth: '+89%' }
            ]
          },
          personalizedContent: {
            interests: {
              moda: { featured: 'Colección Primavera 2025', brands: ['Zara', 'H&M', 'Mango'] },
              fitness: { featured: 'Reto 30 días Transform', brands: ['Nike', 'Adidas', 'Under Armour'] },
              gaming: { featured: 'Torneo eSports Latam', brands: ['Razer', 'Logitech', 'HyperX'] },
              tecnología: { featured: 'AI & Future Tech Expo', brands: ['Apple', 'Samsung', 'Google'] },
              deportes: { featured: 'Copa América 2025', brands: ['Nike', 'Adidas', 'Puma'] },
              hogar: { featured: 'Smart Home Revolution', brands: ['IKEA', 'Sodimac', 'Promart'] }
            }
          },
          deviceOptimizations: {
            mobile: { features: ['One-tap checkout', 'App exclusivos -20%'], layout: 'vertical-priority', ctaSize: 'large' },
            desktop: { features: ['Vista comparativa', 'Multi-ventana'], layout: 'grid-masonry', ctaSize: 'standard' }
          },
          localeContent: {
            'es-PE': { currency: 'S/', shipping: 'Envío gratis Lima > S/99', holidays: ['Fiestas Patrias', 'Navidad'] },
            'en-US': { currency: '$', shipping: 'Free shipping over $50', holidays: ['Black Friday', 'Cyber Monday'] },
            'pt-BR': { currency: 'R$', shipping: 'Frete grátis acima de R$150', holidays: ['Black Friday', 'Natal'] }
          },
          benefits: {
            enterprise: ['Conserje personal 24/7', 'Envío en 2 horas', 'Acceso sala VIP física'],
            pro: ['Envío gratis ilimitado', 'Devoluciones 90 días', 'Acceso preventas'],
            basic: ['Envío gratis +$50', 'Devoluciones 30 días', 'Ofertas exclusivas'],
            free: ['Envío gratis +$100', 'Devoluciones 15 días', 'Newsletter exclusiva']
          }
        }}
      />
    </>
  );
}
