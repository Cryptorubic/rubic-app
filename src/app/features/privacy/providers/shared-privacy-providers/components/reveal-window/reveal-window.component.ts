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
import { Token, TokenAmount } from '@cryptorubic/core';
import { PrivateEvent } from '../../models/private-event';
import { PreviewSwapModalFactory } from '../private-preview-swap/models/preview-swap-modal-factory';
import { PrivateSwapOptions } from '../private-preview-swap/models/preview-swap-options';
import { receiverAnimation } from '../../animations/receiver-animation';

@Component({
  selector: 'app-reveal-window',
  templateUrl: './reveal-window.component.html',
  styleUrls: ['./reveal-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [receiverAnimation()]
})
export class RevealWindowComponent {
  @Output() public handleReveal = new EventEmitter<PrivateEvent>();

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

  private createPreviewModal(revealAsset: BalanceToken): PreviewSwapModalFactory {
    const injector = this.injector;
    const modalService = this.modalService;

    return (options: PrivateSwapOptions) => {
      return modalService.openPrivatePreviewSwap(injector, {
        fromToken: revealAsset,
        toToken: revealAsset,
        fromAmount: this._revealAmount$.value,
        toAmount: { actualValue: new BigNumber(0), visibleValue: '0' },
        swapType: 'transfer',
        swapOptions: options
      });
    };
  }

  public async reveal(): Promise<void> {
    this._loading$.next(true);
    const token = new TokenAmount({
      ...this._revealAsset$.value,
      weiAmount: Token.toWei(
        this._revealAmount$.value?.actualValue,
        this._revealAsset$.value?.decimals
      )
    });
    this.handleReveal.emit({
      token,
      loadingCallback: () => this._loading$.next(false),
      openPreview: this.createPreviewModal(this._revealAsset$.value)
    });
  }

  public toggleReceiver(): void {
    this._displayReceiver$.next(!this._displayReceiver$.value);
  }
}
