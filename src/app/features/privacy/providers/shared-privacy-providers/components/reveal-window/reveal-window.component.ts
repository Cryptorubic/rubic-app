import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Injector,
  Output
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import BigNumber from 'bignumber.js';
import { PrivateModalsService } from '@features/privacy/providers/shared-privacy-providers/services/private-modals/private-modals.service';
import { RevealService } from '@features/privacy/providers/railgun/services/reveal/reveal.service';
import { TokenAmount } from '@cryptorubic/core';

@Component({
  selector: 'app-reveal-window',
  templateUrl: './reveal-window.component.html',
  styleUrls: ['./reveal-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RevealWindowComponent {
  @Output() public handleReveal = new EventEmitter<{
    token: TokenAmount;
    loadingCallback: () => void;
  }>();

  private readonly _displayReceiver$ = new BehaviorSubject<boolean>(false);

  public readonly displayReceiver$ = this._displayReceiver$.asObservable();

  private readonly _revealAsset$ = new BehaviorSubject<BalanceToken | null>(null);

  public readonly revealAsset$ = this._revealAsset$.asObservable();

  private readonly _revealAmount$ = new BehaviorSubject<{
    visibleValue: string;
    actualValue: BigNumber;
  } | null>(null);

  public readonly revealAmount$ = this._revealAmount$.asObservable();

  private readonly injector = inject(Injector);

  private readonly modalService = inject(PrivateModalsService);

  private readonly revealService = inject(RevealService);

  private readonly _loading$ = new BehaviorSubject<boolean>(false);

  public readonly loading$ = this._loading$.asObservable();

  public openSelector(): void {
    this.modalService
      .openPrivateTokensModal(this.injector)
      .subscribe((selectedToken: BalanceToken) => {
        this._revealAsset$.next(selectedToken);
      });
  }

  public updateInputValue(value: { visibleValue: string; actualValue: BigNumber }): void {
    this._revealAmount$.next(value);
  }

  public handleMaxButton(): void {}

  public async reveal(): Promise<void> {
    this._loading$.next(true);
    const token = new TokenAmount({
      ...this._revealAsset$.value,
      weiAmount: this._revealAmount$.value?.actualValue
    });
    this.handleReveal.emit({ token, loadingCallback: () => this._loading$.next(false) });

    //   this._loading$.next(true);
    //   const amount = Token.toWei(
    //     this._revealAmount$.value?.actualValue.toFixed(),
    //     this._revealAsset$.value?.decimals
    //   );
    //   const bigintAmount = BigInt(amount);
    //
    //   await this.revealService.unshieldTokens(
    //     this.railgunId,
    //     this._revealAsset$.value.address,
    //     bigintAmount.toString()
    //   );
    // } finally {
    //   this._loading$.next(false);
    // }
  }

  public toggleReceiver(): void {
    this._displayReceiver$.next(!this._displayReceiver$.value);
  }
}
