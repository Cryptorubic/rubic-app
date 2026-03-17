import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Injector,
  Input,
  Output
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Token, TokenAmount } from '@cryptorubic/core';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import BigNumber from 'bignumber.js';
import { PrivateModalsService } from '@features/privacy/providers/shared-privacy-providers/services/private-modals/private-modals.service';
import { PrivateEvent } from '../../models/private-event';
import { receiverAnimation } from '../../animations/receiver-animation';
import { PrivateSwapOptions } from '../private-preview-swap/models/preview-swap-options';
import { PreviewSwapModalFactory } from '../private-preview-swap/models/preview-swap-modal-factory';
import { SwapAmount } from '../../models/swap-info';
import { PrivateShieldFormConfig } from '../../models/swap-form-types';

@Component({
  selector: 'app-hide-tokens-window',
  templateUrl: './hide-tokens-window.component.html',
  styleUrls: ['./hide-tokens-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [receiverAnimation()]
})
export class HideTokensWindowComponent {
  @Input() creationConfig: PrivateShieldFormConfig = {
    withActionButton: true,
    withReceiver: true,
    withSrcAmount: true
  };

  @Input() receiverCtrl: FormControl<string>;

  @Output() public handleHide = new EventEmitter<PrivateEvent>();

  private readonly _displayReceiver$ = new BehaviorSubject<boolean>(false);

  public readonly displayReceiver$ = this._displayReceiver$.asObservable();

  private readonly _hideAsset$ = new BehaviorSubject<BalanceToken | null>(null);

  public readonly hideAsset$ = this._hideAsset$.asObservable();

  private readonly _hideAmount$ = new BehaviorSubject<{
    visibleValue: string;
    actualValue: BigNumber;
  } | null>(null);

  public readonly hideAmount$ = this._hideAmount$.asObservable();

  private readonly injector = inject(Injector);

  private readonly modalService = inject(PrivateModalsService);

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

  private createPreviewModal(
    hideAsset: BalanceToken,
    fromAmount: SwapAmount
  ): PreviewSwapModalFactory {
    const injector = this.injector;
    const modalService = this.modalService;

    return (options: PrivateSwapOptions) => {
      return modalService.openPrivatePreviewSwap(injector, {
        fromToken: hideAsset,
        toToken: hideAsset,
        fromAmount,
        toAmount: options.dstTokenAmount
          ? {
              actualValue: new BigNumber(options.dstTokenAmount),
              visibleValue: options.dstTokenAmount
            }
          : fromAmount,
        swapType: 'shield',
        swapOptions: options
      });
    };
  }

  public async hide(): Promise<void> {
    this._loading$.next(true);
    const token = new TokenAmount({
      ...this._hideAsset$.value,
      weiAmount: Token.toWei(this._hideAmount$.value?.actualValue, this._hideAsset$.value?.decimals)
    });

    this.handleHide.emit({
      token,
      balanceToken: this._hideAsset$.value,
      loadingCallback: () => this._loading$.next(false),
      openPreview: this.createPreviewModal(this._hideAsset$.value, this._hideAmount$.value)
    });
  }

  public toggleReceiver(): void {
    this._displayReceiver$.next(!this._displayReceiver$.value);
  }
}
