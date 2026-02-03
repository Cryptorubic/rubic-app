import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import BigNumber from 'bignumber.js';
import { ModalService } from '@core/modals/services/modal.service';
import { HideService } from '@features/privacy/services/hide/hide.service';
import { BlockchainName, Token } from '@cryptorubic/core';
import { PublicTokensSelectorComponent } from '@features/privacy/components/public-tokens-selector/public-tokens-selector.component';

@Component({
  selector: 'app-hide-tokens-page',
  templateUrl: './hide-tokens-page.component.html',
  styleUrls: ['./hide-tokens-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HideTokensPageComponent {
  @Input({ required: true }) public readonly railgunWalletAddress: string;

  @Input({ required: true }) public readonly pendingBalances:
    | {
        address: string;
        amount: string;
        blockchain: BlockchainName;
      }[]
    | null;

  private readonly _hideAsset$ = new BehaviorSubject<BalanceToken | null>(null);

  public readonly hideAsset$ = this._hideAsset$.asObservable();

  private readonly _hideAmount$ = new BehaviorSubject<{
    visibleValue: string;
    actualValue: BigNumber;
  } | null>(null);

  public readonly hideAmount$ = this._hideAmount$.asObservable();

  private readonly modalService = inject(ModalService);

  private readonly hideService = inject(HideService);

  private readonly _loading$ = new BehaviorSubject<boolean>(false);

  public readonly loading$ = this._loading$.asObservable();

  public openSelector(): void {
    this.modalService
      .showDialog(PublicTokensSelectorComponent, {
        size: 's',
        closeable: false
      })
      .subscribe((selectedToken: BalanceToken) => {
        this._hideAsset$.next(selectedToken);
      });
  }

  public updateInputValue(value: { visibleValue: string; actualValue: BigNumber }): void {
    this._hideAmount$.next(value);
  }

  public handleMaxButton(): void {}

  public async hide(): Promise<void> {
    try {
      this._loading$.next(true);
      const amount = Token.toWei(
        this._hideAmount$.value?.actualValue.toFixed(),
        this._hideAsset$.value?.decimals
      );
      const bigintAmount = BigInt(amount);
      await this.hideService.shieldERC20(
        this.railgunWalletAddress,
        this._hideAsset$.value.address,
        bigintAmount
      );
    } finally {
      this._loading$.next(false);
    }
  }
}
