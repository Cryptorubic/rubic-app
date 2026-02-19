import * as Sentry from '@sentry/angular';
import { ENVIRONMENT } from './environments/environment';
import { EnvType } from '@app/core/services/sdk/sdk-legacy/features/common/models/sdk-models/env-type';

export function initSentry(): void {
  /**
   * send logs to sentry only in production
   */
  const prodDomains: EnvType[] = ['prod', 'prod-api', 'rubic'];
  if (!prodDomains.includes(ENVIRONMENT.environmentName)) {
    return;
  }

  const sentryAllowUrlRegexpString = /https:\/\/.*\.rubic\.exchange/;

  Sentry.init({
    dsn: 'https://b281c2a8f1bae4aa11a308d01fa61fb7@sentry.rubic.exchange/2',
    sendDefaultPii: true,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.httpClientIntegration(),
      Sentry.breadcrumbsIntegration({
        console: true,
        dom: true,
        fetch: true,
        history: true,
        xhr: true
      }),
      Sentry.browserApiErrorsIntegration({
        setTimeout: true,
        setInterval: true,
        requestAnimationFrame: true,
        XMLHttpRequest: true,
        eventTarget: true,
        unregisterOriginalCallbacks: true
      }),
      Sentry.httpClientIntegration(),
      Sentry.consoleLoggingIntegration({ levels: ['error', 'debug'] }),
      Sentry.eventFiltersIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true
      })
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    enableLogs: true,
    allowUrls: [sentryAllowUrlRegexpString],
    denyUrls: [
      //Chrome extensions
      /^chrome(-extension)?:\/\//i,
      //Mozilla extensions
      /^moz-extension:\/\//i,
      //Safari extensions
      /^safari(-web)?-extension:\/\/|webkit-masked-url/i
    ],
    ignoreSpans: [
      // Browser connection events
      { op: /^browser\.(cache|connect|DNS)$/ },
      // Fonts
      { op: 'resource.other', name: /.+\.(woff2|woff|ttf|eot)$/ },
      // CSS files
      { op: 'resource.link', name: /.+\.css.*$/ },
      { op: 'resource.css' },
      // JS files
      { op: /resource\.(link|script)/, name: /.+\.js.*$/ },
      // Images
      {
        op: /resource\.(other|img)/,
        name: /.+\.(png|svg|jpe?g|gif|bmp|tiff?|webp|avif|heic?|ico).*$/
      },
      // IFrame
      { op: 'resource.iframe' },
      // Measure spans
      { op: 'measure' }
    ],
    ignoreErrors: ['[webpack-dev-server]'],
    beforeSendLog: log => {
      if (log.level === 'info') {
        return null;
      }
      return log;
    },
    beforeSend: (event, _) => {
      event.tags = event.tags || {};
      if (event.tags.url) {
        const url = (event.tags.url as string) || '';
        return url.includes('https://sentry.rubic.exchange') ? null : event;
      }

      return event;
    }
  });
}
