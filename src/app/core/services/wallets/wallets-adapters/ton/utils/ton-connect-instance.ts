import { THEME, TonConnectUI } from '@tonconnect/ui';
import { ENVIRONMENT } from 'src/environments/environment';

export class TonConnectInstance {
  private static tonConnectUI: TonConnectUI | null = null;

  private constructor() {}

  /**
   * Per each call new TonConnectUI() from lib it creates new dom-element for widget,
   * if this element-id already in use - throws error!
   */
  public static getInstance(): TonConnectUI {
    if (!this.tonConnectUI) {
      this.tonConnectUI = new TonConnectUI({
        manifestUrl: `https://api.rubic.exchange/api/info/tonconnect/${ENVIRONMENT.environmentName}`,
        uiPreferences: {
          theme: THEME.DARK
        },
        language: 'en'
      });
    }

    return this.tonConnectUI;
  }
}
