import * as Sentry from '@sentry/angular';
import { ENVIRONMENT } from './environments/environment';

export function initSentry(): void {
  // @FIX log only prod
  if (ENVIRONMENT.environmentName !== 'local') {
    return;
  }

  const sentryAllowUrlRegexpString = `https:\\/\\/(${ENVIRONMENT.environmentName})(\\-app)?\\.rubic\\.exchange`;
  Sentry.init({
    dsn: 'https://28830c940f3cd986b5bc9662943aeaa5@sentry.rubic.exchange/1',
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
    allowUrls: [new RegExp(sentryAllowUrlRegexpString)],
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
