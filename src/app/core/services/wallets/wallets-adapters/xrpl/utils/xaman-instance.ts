import { Xumm } from 'xumm';
import { ENVIRONMENT } from 'src/environments/environment';

export class XamanInstance {
  private static xumm: Xumm | null = null;

  private constructor() {}

  public static getInstance(): Xumm {
    if (!this.xumm) {
      this.xumm = new Xumm(ENVIRONMENT.xamanApiKey);
    }

    return this.xumm;
  }
}
