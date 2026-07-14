import { Xumm } from 'xumm';
import { ENVIRONMENT } from 'src/environments/environment';

/**
 * xumm@1.8.0 resets `environment.ready` inside `logout()` but never re-emits
 * the `ready` event (that only happens in the constructor). Awaiting ready
 * after disconnect therefore hangs forever unless we unblock it.
 */
export class XamanInstance {
  private static xumm: Xumm | null = null;

  private static readyNeedsUnblock = false;

  private constructor() {}

  public static getInstance(): Xumm {
    if (!this.xumm) {
      this.xumm = new Xumm(ENVIRONMENT.xamanApiKey);
      this.readyNeedsUnblock = false;
    }

    return this.xumm;
  }

  public static async waitUntilReady(): Promise<Xumm> {
    const xumm = this.getInstance();

    if (this.readyNeedsUnblock) {
      xumm.emit('ready');
      this.readyNeedsUnblock = false;
    }

    await xumm.environment.ready;

    return xumm;
  }

  public static markReadyNeedsUnblock(): void {
    this.readyNeedsUnblock = true;
  }

  public static async logout(): Promise<void> {
    if (!this.xumm) {
      return;
    }

    await this.xumm.logout();
    this.readyNeedsUnblock = true;
  }
}
