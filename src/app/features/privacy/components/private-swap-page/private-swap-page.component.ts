import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { BlockchainName } from '@cryptorubic/core';
import { BehaviorSubject } from 'rxjs';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import BigNumber from 'bignumber.js';
import { ModalService } from '@core/modals/services/modal.service';
import { HideService } from '@features/privacy/services/hide/hide.service';
import { PrivateTokensSelectorComponent } from '@features/privacy/components/private-tokens-selector/private-tokens-selector.component';
import { PublicTokensSelectorComponent } from '@features/privacy/components/public-tokens-selector/public-tokens-selector.component';

@Component({
  selector: 'app-private-swap-page',
  templateUrl: './private-swap-page.component.html',
  styleUrls: ['./private-swap-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivateSwapPageComponent {
  @Input({ required: true }) public readonly railgunWalletAddress: string;

  @Input({ required: true }) public readonly balances:
    | {
        address: string;
        amount: string;
        blockchain: BlockchainName;
      }[]
    | null;

  private readonly _fromAsset$ = new BehaviorSubject<BalanceToken | null>(null);

  public readonly fromAsset$ = this._fromAsset$.asObservable();

  private readonly _toAsset$ = new BehaviorSubject<BalanceToken | null>(null);

  public readonly toAsset$ = this._toAsset$.asObservable();

  private readonly _fromAmount$ = new BehaviorSubject<{
    visibleValue: string;
    actualValue: BigNumber;
  } | null>(null);

  public readonly fromAmount$ = this._fromAmount$.asObservable();

  private readonly _toAmount$ = new BehaviorSubject<{
    visibleValue: string;
    actualValue: BigNumber;
  } | null>(null);

  public readonly toAmount$ = this._toAmount$.asObservable();

  private readonly modalService = inject(ModalService);

  private readonly hideService = inject(HideService);

  private readonly _loading$ = new BehaviorSubject<boolean>(false);

  public readonly loading$ = this._loading$.asObservable();

  public openFromSelector(): void {
    this.modalService
      .showDialog(PrivateTokensSelectorComponent, {
        size: 's',
        closeable: false,
        data: this.balances
      })
      .subscribe((selectedToken: BalanceToken) => {
        this._fromAsset$.next(selectedToken);
      });
  }

  public openToSelector(): void {
    this.modalService
      .showDialog(PublicTokensSelectorComponent, {
        size: 's',
        closeable: false
      })
      .subscribe((selectedToken: BalanceToken) => {
        this._toAsset$.next(selectedToken);
      });
  }

  public updateFromInputValue(value: { visibleValue: string; actualValue: BigNumber }): void {
    this._fromAmount$.next(value);
  }

  public handleMaxButton(): void {}

  public async swap(): Promise<void> {
    try {
      this._loading$.next(true);
    } finally {
      this._loading$.next(false);
    }
  }
}
