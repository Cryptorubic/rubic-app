import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Injector,
  Output
} from '@angular/core';
import { PrivateEvent } from '../../models/private-event';
import { BehaviorSubject } from 'rxjs';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import BigNumber from 'bignumber.js';
import { PrivateModalsService } from '../../services/private-modals/private-modals.service';
import { Token, TokenAmount } from '@cryptorubic/core';
import { PreviewSwapModalFactory } from '../private-preview-swap/models/preview-swap-modal-factory';
import { PrivateSwapOptions } from '../private-preview-swap/models/preview-swap-options';

@Component({
  selector: 'app-transfer-tokens-window',
  templateUrl: './transfer-tokens-window.component.html',
  styleUrls: ['./transfer-tokens-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferTokensWindowComponent {
  @Output() public handleTransfer = new EventEmitter<PrivateEvent>();

  private readonly _transferAsset$ = new BehaviorSubject<BalanceToken | null>(null);

  public readonly transferAsset$ = this._transferAsset$.asObservable();

  private readonly _transferAmount$ = new BehaviorSubject<{
    visibleValue: string;
    actualValue: BigNumber;
  } | null>(null);

  public readonly transferAmount$ = this._transferAmount$.asObservable();

  private readonly injector = inject(Injector);

  private readonly modalService = inject(PrivateModalsService);

  private readonly _loading$ = new BehaviorSubject<boolean>(false);

  public readonly loading$ = this._loading$.asObservable();

  public openSelector(): void {
    this.modalService
      .openPrivateTokensModal(this.injector)
      .subscribe((selectedToken: BalanceToken) => {
        this._transferAsset$.next(selectedToken);
      });
  }

  public updateInputValue(value: { visibleValue: string; actualValue: BigNumber }): void {
    this._transferAmount$.next(value);
  }

  public handleMaxButton(): void {}

  private createPreviewModal(transferAsset: BalanceToken): PreviewSwapModalFactory {
    const injector = this.injector;
    const modalService = this.modalService;

    return (options: PrivateSwapOptions) => {
      return modalService.openPrivatePreviewSwap(injector, {
        fromToken: transferAsset,
        toToken: transferAsset,
        fromAmount: this._transferAmount$.value,
        toAmount: {
          actualValue: new BigNumber(options.dstTokenAmount || 0),
          visibleValue: options.dstTokenAmount || '0'
        },
        swapType: 'transfer',
        swapOptions: options
      });
    };
  }

  public async transfer(): Promise<void> {
    this._loading$.next(true);
    const token = new TokenAmount({
      ...this._transferAsset$.value,
      weiAmount: Token.toWei(
        this._transferAmount$.value?.actualValue,
        this._transferAsset$.value?.decimals
      )
    });
    this.handleTransfer.emit({
      token,
      loadingCallback: () => this._loading$.next(false),
      openPreview: this.createPreviewModal(this._transferAsset$.value)
    });
  }
}
