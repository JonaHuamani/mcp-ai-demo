import React from 'react';

type Props = {
  title: string;
  subtitle?: string;
  ctaText?: string;
  imageUrl?: string;
  bgGradient?: string;
  variant?: 'hero-a' | 'hero-b' | 'default' | 'promo';
  children?: React.ReactNode;
};

export const Hero: React.FC<Props> = ({
  title, subtitle, ctaText, imageUrl, bgGradient, variant = 'hero-a', children
}) => {
  // Configuración específica para cada variante A/B
  const variantConfigs = {
    'hero-a': {
      bgGradient: bgGradient || 'from-indigo-600 to-purple-700',
      layout: 'grid grid-cols-1 md:grid-cols-2',
      titleSize: 'text-4xl md:text-5xl',
      ctaStyle: 'rounded-full bg-white text-gray-900',
      hasPattern: true,
      hasCircles: true,
    },
    'hero-b': {
      bgGradient: bgGradient || 'from-gradient-to-r from-pink-500 via-red-500 to-yellow-500',
      layout: 'flex flex-col items-center text-center',
      titleSize: 'text-5xl md:text-6xl',
      ctaStyle: 'rounded-lg bg-gradient-to-r from-green-400 to-blue-500 text-white',
      hasPattern: false,
      hasCircles: false,
    },
    'default': {
      bgGradient: bgGradient || 'from-slate-800 to-slate-900',
      layout: 'grid grid-cols-1 md:grid-cols-2',
      titleSize: 'text-4xl md:text-5xl',
      ctaStyle: 'rounded-full bg-white text-gray-900',
      hasPattern: true,
      hasCircles: true,
    },
    'promo': {
      bgGradient: bgGradient || 'from-yellow-400 via-orange-500 to-red-500',
      layout: 'flex flex-col items-center text-center',
      titleSize: 'text-5xl md:text-7xl',
      ctaStyle: 'rounded-xl bg-black text-white',
      hasPattern: false,
      hasCircles: true,
    },
  };

  const config = variantConfigs[variant] || variantConfigs['hero-a'];

  // Variante A: Layout tradicional con imagen a la derecha
  if (variant === 'hero-a') {
    return (
      <section className={`relative rounded-2xl p-10 bg-gradient-to-br ${config.bgGradient} text-white shadow-2xl overflow-hidden`}>
        {/* Patrón decorativo de fondo */}
        {config.hasPattern && (
          <div className="absolute inset-0 bg-black opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
        )}
        
        <div className={`relative ${config.layout} gap-8 items-center`}>
          <div className="space-y-4">
            <h2 className={`${config.titleSize} font-extrabold leading-tight drop-shadow-lg`}>
              {title}
            </h2>
            {subtitle && (
              <p className="text-lg md:text-xl text-white/95 font-medium">
                {subtitle}
              </p>
            )}
            {ctaText && (
              <button className={`
                mt-6 px-8 py-4 ${config.ctaStyle} font-bold text-lg
                transform transition-all duration-300
                hover:scale-105 hover:shadow-xl
                active:scale-95
                shadow-lg
              `}>
                {ctaText}
                <span className="ml-2">→</span>
              </button>
            )}
            {children}
          </div>
          {imageUrl && (
            <div className="justify-self-end">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={imageUrl} 
                alt="" 
                className="w-full max-w-sm rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300" 
              />
            </div>
          )}
        </div>
        
        {/* Círculos decorativos */}
        {config.hasCircles && (
          <>
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white opacity-5 rounded-full"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white opacity-5 rounded-full"></div>
          </>
        )}
      </section>
    );
  }

  // Variante B: Layout centrado con diseño más moderno
  if (variant === 'hero-b') {
    return (
      <section className={`relative rounded-3xl p-12 bg-gradient-to-r ${config.bgGradient} text-white shadow-2xl overflow-hidden`}>
        {/* Efecto de onda animada */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="rgba(255,255,255,0.1)" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,101.3C1248,85,1344,75,1392,69.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        
        <div className={`relative ${config.layout} gap-6 max-w-4xl mx-auto`}>
          {imageUrl && (
            <div className="mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={imageUrl} 
                alt="" 
                className="w-full max-w-md mx-auto rounded-2xl shadow-2xl ring-4 ring-white/20" 
              />
            </div>
          )}
          <h2 className={`${config.titleSize} font-black leading-tight animate-pulse`}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-xl md:text-2xl text-white/90 font-light max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
          {ctaText && (
            <div className="flex gap-4 justify-center mt-8">
              <button className={`
                px-10 py-5 ${config.ctaStyle} font-bold text-xl
                transform transition-all duration-300
                hover:scale-110 hover:rotate-1 hover:shadow-2xl
                active:scale-95
                shadow-xl
              `}>
                {ctaText}
                <span className="ml-3 text-2xl">🚀</span>
              </button>
            </div>
          )}
          {children}
        </div>
        
        {/* Elementos flotantes animados */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full animate-ping"></div>
      </section>
    );
  }

  // Fallback a variante A para otros casos
  return (
    <section className={`relative rounded-2xl p-10 bg-gradient-to-br ${config.bgGradient} text-white shadow-2xl overflow-hidden`}>
      <div className={`relative ${config.layout} gap-8 items-center`}>
        <div className="space-y-4">
          <h2 className={`${config.titleSize} font-extrabold leading-tight drop-shadow-lg`}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg md:text-xl text-white/95 font-medium">
              {subtitle}
            </p>
          )}
          {ctaText && (
            <button className={`
              mt-6 px-8 py-4 ${config.ctaStyle} font-bold text-lg
              transform transition-all duration-300
              hover:scale-105 hover:shadow-xl
              active:scale-95
              shadow-lg
            `}>
              {ctaText}
              <span className="ml-2">→</span>
            </button>
          )}
          {children}
        </div>
      </div>
    </section>
  );
};
