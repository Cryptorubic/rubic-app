import { ENVIRONMENT } from './environments/environment';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export function initGoogleAnalytics(): void {
  if (ENVIRONMENT.local) {
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ENVIRONMENT.googleAnalyticsId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function (): void {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());

  if (ENVIRONMENT.production) {
    window.gtag('config', ENVIRONMENT.googleAnalyticsId);
  } else {
    localStorage.setItem('debug_mode', 'true');
    window.gtag('config', ENVIRONMENT.googleAnalyticsId, {
      debug_mode: true
    });
    window.gtag('event', 'init_debug');
  }
}
