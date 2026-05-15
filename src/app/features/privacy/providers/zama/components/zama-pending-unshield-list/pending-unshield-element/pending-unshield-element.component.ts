import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PendingUnshieldToken } from '../../../services/zama-sdk/models/pending-unshield-token';
import { DEFAULT_TOKEN_IMAGE } from '@app/shared/constants/tokens/default-token-image';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { ZamaSwapService } from '../../../services/zama-sdk/zama-swap.service';
import { ZamaBalanceService } from '../../../services/zama-sdk/zama-balance.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-pending-unshield-element',
  templateUrl: './pending-unshield-element.component.html',
  styleUrls: ['./pending-unshield-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PendingUnshieldElementComponent {
  @Input({ required: true }) token: PendingUnshieldToken;

  public readonly DEFAULT_TOKEN_IMAGE = DEFAULT_TOKEN_IMAGE;

  private readonly _unwrapLoading$ = new BehaviorSubject(false);

  public readonly unwrapLoading$ = this._unwrapLoading$.asObservable();

  constructor(
    private readonly zamaSwapService: ZamaSwapService,
    private readonly zamaBalanceService: ZamaBalanceService
  ) {}

  public onImageError($event: Event): void {
    TokensFacadeService.onTokenImageError($event);
  }

  public async finalizeUnwrap(): Promise<void> {
    this._unwrapLoading$.next(true);
    try {
      await this.zamaSwapService
        .finalizeUnwrap(this.token, this.token.encryptedAmount)
        .then(() => this.zamaBalanceService.refreshPendingUnshieldBalances());
    } finally {
      this._unwrapLoading$.next(false);
    }
  }
}
