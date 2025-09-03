import React from 'react';
type Item = { label: string; href: string };
type Props = { items: Item[]; children?: React.ReactNode };

// Paleta de colores con buen contraste
const colorSchemes = [
  'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white',
  'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white',
  'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white',
  'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white',
  'bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white',
  'bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white',
  'bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white',
  'bg-gradient-to-br from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white',
];

export const CategoryGrid: React.FC<Props> = ({ items = [], children }) => (
  <section className="w-full">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((it, idx) => {
        // Asignar color basado en el índice para consistencia
        const colorClass = colorSchemes[idx % colorSchemes.length];
        
        return (
          <a 
            key={idx} 
            href={it.href} 
            className={`
              block p-6 rounded-xl shadow-lg transform transition-all duration-300
              hover:scale-105 hover:shadow-xl
              ${colorClass}
              relative overflow-hidden group
            `}
          >
            {/* Efecto de brillo al hover */}
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            
            {/* Icono decorativo */}
            <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-30 transition-opacity">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            
            {/* Contenido */}
            <div className="relative z-10">
              <div className="font-bold text-lg mb-1">{it.label}</div>
              <div className="text-sm opacity-90">Explorar →</div>
            </div>
          </a>
        );
      })}
    </div>
    {children}
  </section>
);
