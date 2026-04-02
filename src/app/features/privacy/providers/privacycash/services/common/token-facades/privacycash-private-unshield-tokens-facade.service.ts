import { Injectable, inject } from '@angular/core';
import { PrivateSwapInfo } from '@app/features/privacy/providers/shared-privacy-providers/models/swap-info';
import { RevealWindowService } from '@app/features/privacy/providers/shared-privacy-providers/services/reveal-window/reveal-window.service';
import { Observable, combineLatest, map } from 'rxjs';
import { PrivacycashPrivateTokensFacadeService } from './privacycash-private-tokens-facade.service';

@Injectable()
export class PrivacycashPrivateUnshieldTokensFacadeService extends PrivacycashPrivateTokensFacadeService {
  private readonly revealWindowService = inject(RevealWindowService);

  protected swapInfo$: Observable<PrivateSwapInfo> = combineLatest([
    this.revealWindowService.revealAsset$,
    this.revealWindowService.revealAmount$
  ]).pipe(
    map(
      ([revealAsset, revealAmount]) =>
        ({
          fromAsset: revealAsset,
          fromAmount: revealAmount,
          toAsset: null,
          toAmount: null
        } as PrivateSwapInfo)
    )
  );
}
