import { Injectable, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';
import { ModalService } from '@core/modals/services/modal.service';
import { XamanSignModalData, XamanSignRequestRef } from '../models/xaman-sign-modal-data';

/**
 * Presents the Xaman (XUMM) sign request as an in-app QR modal and exposes an imperative
 * handle so the non-Angular wallet adapter layer can close it once the payload is resolved.
 */
@Injectable({ providedIn: 'root' })
export class XamanSignService {
  constructor(private readonly modalService: ModalService, private readonly ngZone: NgZone) {}

  public openSignRequest(data: XamanSignModalData): XamanSignRequestRef {
    let resolveDismissed: () => void = () => {};
    const dismissed = new Promise<void>(resolve => {
      resolveDismissed = resolve;
    });

    let subscription: Subscription | null = null;

    this.ngZone.run(() => {
      subscription = this.modalService.openXamanSignModal(data).subscribe({
        complete: () => resolveDismissed()
      });
    });

    return {
      dismissed,
      close: () => this.ngZone.run(() => subscription?.unsubscribe())
    };
  }
}
