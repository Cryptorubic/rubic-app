import { Inject, Injectable } from '@angular/core';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from 'src/app/shared/utils/rubic-window';

@Injectable({
  providedIn: 'root'
})
export class GoogleTagManagerService {
  constructor(@Inject(WINDOW) private readonly window: RubicWindow) {}

  /**
   * Inform google tag manager that tx was signed.
   */
  public notifySignTransaction(): void {
    this.window.dataLayer?.push({
      event: 'transactionSigned',
      ecategory: 'transaction',
      eaction: 'ok',
      elabel: '',
      evalue: '',
      transaction: true,
      interactionType: false
    });
  }
}
