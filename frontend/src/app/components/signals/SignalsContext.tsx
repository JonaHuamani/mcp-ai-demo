'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Signals } from './types';

const defaultSignals: Signals = {
  locale: 'es-PE',
  device: 'desktop',
  interests: ['moda', 'fitness'],
  ab: 'hero-b',
  isLoggedIn: true,
  spendTier: 'basic',
  timeOfDay: 'afternoon',
};

type Ctx = { signals: Signals; setSignals: React.Dispatch<React.SetStateAction<Signals>>; };
const SignalsCtx = createContext<Ctx | null>(null);

export function SignalsProvider({ children }: { children: React.ReactNode }) {
  const [signals, setSignals] = useState<Signals>(defaultSignals);
  const value = useMemo(() => ({ signals, setSignals }), [signals]);
  return <SignalsCtx.Provider value={value}>{children}</SignalsCtx.Provider>;
}
export function useSignals() {
  const ctx = useContext(SignalsCtx);
  if (!ctx) throw new Error('useSignals must be used within SignalsProvider');
  return ctx;
}
