import { Injectable, inject } from '@angular/core';
import { PrivacycashPrivateTokensFacadeService } from './privacycash-private-tokens-facade.service';
import { PrivateSwapInfo } from '@app/features/privacy/providers/shared-privacy-providers/models/swap-info';
import { Observable } from 'rxjs';
import { PrivateSwapWindowService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-swap-window/private-swap-window.service';

@Injectable()
export class PrivacycashPrivateSwapTokensFacadeService extends PrivacycashPrivateTokensFacadeService {
  private readonly privateSwapWindowService = inject(PrivateSwapWindowService);

  protected swapInfo$: Observable<PrivateSwapInfo> = this.privateSwapWindowService.swapInfo$;
}
