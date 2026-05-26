import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PendingUnshieldToken } from '../../../services/zama-sdk/models/pending-unshield-token';
import { DEFAULT_TOKEN_IMAGE } from '@app/shared/constants/tokens/default-token-image';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { ZamaSwapService } from '../../../services/zama-sdk/zama-swap.service';
import { ZamaBalanceService } from '../../../services/zama-sdk/zama-balance.service';
import { BehaviorSubject } from 'rxjs';
import { PrivateStatisticsService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-statistics/private-statistics.service';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { Token } from '@cryptorubic/core';
import { ZamaHideTokensFacadeService } from '../../../services/zama-hide-tokens-facade.service';

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
    private readonly zamaBalanceService: ZamaBalanceService,
    private readonly privateStatisticsService: PrivateStatisticsService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly tokensFacade: ZamaHideTokensFacadeService
  ) {}

  public onImageError($event: Event): void {
    TokensFacadeService.onTokenImageError($event);
  }

  public async finalizeUnwrap(): Promise<void> {
    this._unwrapLoading$.next(true);
    try {
      const publicToken = await this.tokensFacade.findToken({
        address: this.token.address,
        blockchain: this.token.blockchain
      });

      await this.zamaSwapService
        .finalizeUnwrap(this.token, this.token.encryptedAmount)
        .then(res => {
          this.privateStatisticsService.saveAction(
            'UNSHIELD',
            'ZAMA',
            this.walletConnectorService.address,
            this.token.address,
            Token.toWei(this.token.decryptedNonWeiAmount, publicToken.decimals),
            this.token.blockchain
          );
          this.zamaBalanceService.refreshPendingUnshieldBalances();
          return res;
        });
    } finally {
      this._unwrapLoading$.next(false);
    }
  }
}
