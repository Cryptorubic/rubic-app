export interface TurnstileRenderOptions {
  sitekey: string;
  size?: 'invisible' | 'normal' | 'compact' | 'flexible';
  theme?: 'light' | 'dark' | 'auto';
  appearance?: 'always' | 'execute' | 'interaction-only';
  language?: string;
  action?: string;
  cData?: string;
  retry?: 'auto' | 'never';
  retryInterval?: number;
  callback?: (token: string) => void;
  'error-callback'?: (error: Error) => void;
  'expired-callback'?: () => void;
}

export type Turnstile = {
  ready: (cb: () => void) => void;
  render: (container: string, params: TurnstileRenderOptions) => string;
  execute: (widgetId: string) => void;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};
