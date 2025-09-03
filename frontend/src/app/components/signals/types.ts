export type Signals = {
  locale: string;
  device: 'mobile' | 'desktop';
  ab?: string;
  interests: string[];
  isLoggedIn?: boolean;
  spendTier?: 'free' | 'basic' | 'pro' | 'enterprise';
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  [key: string]: unknown;
};
