export interface TurnstileRenderOptions {
  sitekey: string;
  // Optional: 'invisible' is the common choice for gated actions
  size?: 'invisible' | 'normal' | 'compact';
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  action?: string;
  cData?: string;
  retry?: 'auto' | 'never';
  retryInterval?: number;
}

export type Turnstile = {
  ready: (cb: () => void) => void;
  render: (container: string | HTMLElement, params: Record<string, unknown>) => string;
  execute: (widgetId: string) => void;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};
