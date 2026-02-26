import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Injector,
  Output
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TokenAmount } from '@cryptorubic/core';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import BigNumber from 'bignumber.js';
import { PrivateModalService } from '@features/privacy/shared/services/private-modal/private-modal.service';

@Component({
  selector: 'app-hide-tokens-window',
  templateUrl: './hide-tokens-window.component.html',
  styleUrls: ['./hide-tokens-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HideTokensWindowComponent {
  @Output() public handleHide = new EventEmitter<{
    token: TokenAmount;
    loadingCallback: () => void;
  }>();

  private readonly _displayReceiver$ = new BehaviorSubject<boolean>(false);

  public readonly displayReceiver$ = this._displayReceiver$.asObservable();

  private readonly _hideAsset$ = new BehaviorSubject<BalanceToken | null>(null);

  public readonly hideAsset$ = this._hideAsset$.asObservable();

  private readonly _hideAmount$ = new BehaviorSubject<{
    visibleValue: string;
    actualValue: BigNumber;
  } | null>(null);

  public readonly hideAmount$ = this._hideAmount$.asObservable();

  // private readonly hideService = inject(HideService);

  private readonly injector = inject(Injector);

  private readonly modalService = inject(PrivateModalService);

  private readonly _loading$ = new BehaviorSubject<boolean>(false);

  public readonly loading$ = this._loading$.asObservable();

  public openSelector(): void {
    this.modalService
      .openPublicTokensModal(this.injector)
      .subscribe((selectedToken: BalanceToken) => {
        this._hideAsset$.next(selectedToken);
      });
  }

  public updateInputValue(value: { visibleValue: string; actualValue: BigNumber }): void {
    this._hideAmount$.next(value);
  }

  public handleMaxButton(): void {}

  public async hide(): Promise<void> {
    this._loading$.next(true);
    const token = new TokenAmount({
      ...this._hideAsset$.value,
      weiAmount: this._hideAmount$.value?.actualValue
    });
    this.handleHide.emit({ token, loadingCallback: () => this._loading$.next(false) });
    // try {
    //   const amount = Token.toWei(
    //     this._hideAmount$.value?.actualValue.toFixed(),
    //     this._hideAsset$.value?.decimals
    //   );
    //   const bigintAmount = BigInt(amount);
    //   await this.hideService.shieldERC20(
    //     this.railgunWalletAddress,
    //     this._hideAsset$.value.address,
    //     bigintAmount
    //   );
    // } finally {
    //   this._loading$.next(false);
    // }
  }

  public toggleReceiver(): void {
    debugger;
    this._displayReceiver$.next(!this._displayReceiver$.value);
  }
}
