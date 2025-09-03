import React from 'react';

type CMSDataDisplayProps = {
  data?: any;
  visible?: boolean;
};

export const CMSDataDisplay: React.FC<CMSDataDisplayProps> = ({ data, visible = false }) => {
  if (!visible || !data) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📊 Datos del CMS Disponibles
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campañas */}
        {data.campaigns && (
          <div className="space-y-3">
            <h4 className="font-medium text-blue-600">🎯 Campañas Activas</h4>
            <div className="space-y-2">
              {data.campaigns.current?.map((campaign: any, idx: number) => (
                <div key={idx} className="bg-blue-50 p-3 rounded-lg">
                  <div className="font-medium text-blue-900">{campaign.name}</div>
                  <div className="text-sm text-blue-700">
                    {campaign.discount} • {campaign.categories?.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categorías Trending */}
        {data.categories?.trending && (
          <div className="space-y-3">
            <h4 className="font-medium text-green-600">📈 Categorías Trending</h4>
            <div className="space-y-2">
              {data.categories.trending.map((cat: any, idx: number) => (
                <div key={idx} className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <div className="font-medium text-green-900">{cat.name}</div>
                      <div className="text-sm text-green-700">
                        {cat.items} items • {cat.growth}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Intereses Personalizados */}
        {data.personalizedContent?.interests && (
          <div className="space-y-3">
            <h4 className="font-medium text-purple-600">🎭 Contenido por Intereses</h4>
            <div className="space-y-2">
              {Object.entries(data.personalizedContent.interests).map(([key, content]: [string, any]) => (
                <div key={key} className="bg-purple-50 p-3 rounded-lg">
                  <div className="font-medium text-purple-900 capitalize">{key}</div>
                  <div className="text-sm text-purple-700">{content.featured}</div>
                  <div className="text-xs text-purple-600 mt-1">
                    {content.brands?.slice(0, 3).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optimizaciones por Dispositivo */}
        {data.deviceOptimizations && (
          <div className="space-y-3">
            <h4 className="font-medium text-orange-600">📱 Optimizaciones por Dispositivo</h4>
            <div className="space-y-2">
              {Object.entries(data.deviceOptimizations).map(([device, config]: [string, any]) => (
                <div key={device} className="bg-orange-50 p-3 rounded-lg">
                  <div className="font-medium text-orange-900 capitalize">{device}</div>
                  <div className="text-sm text-orange-700">
                    Layout: {config.layout} • CTA: {config.ctaSize}
                  </div>
                  <div className="text-xs text-orange-600 mt-1">
                    {config.features?.slice(0, 2).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contenido por Locale */}
        {data.localeContent && (
          <div className="space-y-3">
            <h4 className="font-medium text-indigo-600">🌍 Contenido por Región</h4>
            <div className="space-y-2">
              {Object.entries(data.localeContent).map(([locale, content]: [string, any]) => (
                <div key={locale} className="bg-indigo-50 p-3 rounded-lg">
                  <div className="font-medium text-indigo-900">{locale}</div>
                  <div className="text-sm text-indigo-700">
                    {content.currency} • {content.shipping}
                  </div>
                  <div className="text-xs text-indigo-600 mt-1">
                    {content.holidays?.slice(0, 2).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Beneficios por Tier */}
        {data.benefits && (
          <div className="space-y-3">
            <h4 className="font-medium text-red-600">💎 Beneficios por Tier</h4>
            <div className="space-y-2">
              {Object.entries(data.benefits).map(([tier, benefits]: [string, any]) => (
                <div key={tier} className="bg-red-50 p-3 rounded-lg">
                  <div className="font-medium text-red-900 capitalize">{tier}</div>
                  <div className="text-sm text-red-700">
                    {Array.isArray(benefits) ? benefits.slice(0, 2).join(', ') : 'Sin beneficios'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          💡 Estos datos del CMS son utilizados por la IA para generar contenido personalizado según tus signals.
          Cambia los valores en el panel izquierdo para ver cómo se adapta la interfaz.
        </p>
      </div>
    </div>
  );
};
