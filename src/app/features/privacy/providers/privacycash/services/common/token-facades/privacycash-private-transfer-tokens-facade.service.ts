import { Injectable, inject } from '@angular/core';
import { PrivacycashPrivateTokensFacadeService } from './privacycash-private-tokens-facade.service';
import { PrivateTransferWindowService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-transfer-window/private-transfer-window.service';
import { Observable, combineLatest, map } from 'rxjs';
import { PrivateSwapInfo } from '@app/features/privacy/providers/shared-privacy-providers/models/swap-info';

@Injectable()
export class PrivacycashPrivateTransferTokensFacadeService extends PrivacycashPrivateTokensFacadeService {
  private readonly privateTransferWindowService = inject(PrivateTransferWindowService);

  protected swapInfo$: Observable<PrivateSwapInfo> = combineLatest([
    this.privateTransferWindowService.transferAsset$,
    this.privateTransferWindowService.transferAmount$
  ]).pipe(
    map(
      ([transferAsset, transferAmount]) =>
        ({
          fromAsset: transferAsset,
          fromAmount: transferAmount,
          toAsset: null,
          toAmount: null
        } as PrivateSwapInfo)
    )
  );
}
