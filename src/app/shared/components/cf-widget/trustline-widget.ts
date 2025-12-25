import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { RubicWindow } from '@shared/utils/rubic-window';

export class TurnstileManager {
  private readonly widgets = new Map<string, string>();

  private get turnstile(): RubicAny {
    return (this.window as RubicAny).turnstile;
  }

  constructor(private readonly window: RubicWindow) {}

  public createWidget(containerId: string, config: RubicAny): void {
    // Wait for Turnstile to be ready
    this.turnstile.ready(() => {
      debugger;
      const widgetId = this.turnstile.render(containerId, {
        sitekey: config.sitekey,
        theme: config.theme || 'auto',
        size: config.size || 'normal',
        callback: (token: unknown) => {
          console.log(`Widget ${widgetId} completed:`, token);
          if (config.onSuccess) config.onSuccess(token, widgetId);
        },
        'error-callback': (error: unknown) => {
          console.error(`Widget ${widgetId} error:`, error);
          if (config.onError) config.onError(error, widgetId);
        }
      });

      console.log(widgetId);
      this.widgets.set(containerId, widgetId);
      return widgetId;
    });
  }

  public removeWidget(containerId: string) {
    const widgetId = this.widgets.get(containerId);
    if (widgetId) {
      this.turnstile.remove(widgetId);
      this.widgets.delete(containerId);
    }
  }

  public resetWidget(containerId: string) {
    const widgetId = this.widgets.get(containerId);
    if (widgetId) {
      this.turnstile.reset(widgetId);
    }
  }
}
