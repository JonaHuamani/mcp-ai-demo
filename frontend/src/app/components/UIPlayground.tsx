'use client';

import React from 'react';
import { SignalsProvider, useSignals } from './signals/SignalsContext';
import SignalsForm from './signals/SignalsForm';
import { PlanRenderer } from './PlanRenderer';
import type { Signals } from './signals/types';

type Plan = { version: '1'; sections: unknown[] };

async function fetchPlan(api: string, route: string, signals: Signals) {
  // Agregar timestamp y un ID único para forzar regeneración
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const requestBody = { 
    userId: 'u_123', 
    route, 
    signals,
    requestId, // ID único para cada petición
    timestamp: new Date().toISOString()
  };
  
  console.log('[Frontend] Fetching plan from:', `${api}/ui/plan`);
  console.log('[Frontend] Request body:', requestBody);
  
  const res = await fetch(`${api}/ui/plan`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    },
    body: JSON.stringify(requestBody),
    cache: 'no-store'
  });
  
  console.log('[Frontend] Response status:', res.status);
  console.log('[Frontend] Response ok:', res.ok);
  
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  console.log('[Frontend] Response data:', data);
  return data;
}

function Inner({ api, route }: { api: string; route: string }) {
  const { signals } = useSignals();
  const [plan, setPlan] = React.useState<Plan | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async (override?: Signals) => {
    console.log('[Frontend] refresh() called with:', { api, route, override, signals });
    setLoading(true);
    setError(null);
    try {
      const s = override ?? signals;
      const json = await fetchPlan(api, route, s);
      setPlan(json);
    } catch (e: unknown) {
      console.error('[Frontend] Error in refresh():', e);
      setError(e instanceof Error ? e.message : 'Error al cargar el plan');
    } finally {
      setLoading(false);
    }
  }, [api, route, signals]);

  React.useEffect(() => { 
    console.log('[Frontend] useEffect triggered, calling refresh()');
    void refresh(); 
  }, [refresh]); // carga inicial

  return (
    <>
      {/* Panel de Signals flotante */}
      <SignalsForm onApply={(s) => refresh(s)} />
      
      {/* Contenido principal */}
      <div className="w-full">
        {/* Barra de estado */}
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Vista previa del plan UI</h2>
            {loading && (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Generando plan...</span>
              </div>
            )}
          </div>
          <button
            onClick={() => refresh()}
            className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium disabled:opacity-50 hover:bg-blue-700 transition-colors disabled:hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Generando…' : 'Regenerar plan'}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Contenido del plan */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          {loading || !plan ? (
            <div className="text-center py-12">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-3"></div>
                <div className="h-32 bg-gray-200 rounded w-full mx-auto mb-4"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-24 bg-gray-200 rounded"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
                </div>
              </div>
              <p className="text-gray-500 mt-4">
                {loading ? 'Regenerando plan de UI...' : 'Cargando plan de UI...'}
              </p>
            </div>
          ) : (
            <PlanRenderer plan={plan as Parameters<typeof PlanRenderer>[0]['plan']} />
          )}
        </section>
      </div>
    </>
  );
}

export default function UIPlayground({ api, route }: { api: string; route: string }) {
  return (
    <SignalsProvider>
      <Inner api={api} route={route} />
    </SignalsProvider>
  );
}
