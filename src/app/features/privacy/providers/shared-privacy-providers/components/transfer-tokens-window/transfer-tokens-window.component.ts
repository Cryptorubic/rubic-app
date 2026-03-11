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
import { PrivateTransferService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-transfer/private-transfer.service';

@Component({
  selector: 'app-transfer-tokens-window',
  templateUrl: './transfer-tokens-window.component.html',
  styleUrls: ['./transfer-tokens-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferTokensWindowComponent {
  @Output() public handleTransfer = new EventEmitter<PrivateEvent>();

  public readonly transferAsset$ = this.privateTransferService.transferAsset$;

  public readonly transferAmount$ = this.privateTransferService.transferAmount$;

  private readonly injector = inject(Injector);

  private readonly modalService = inject(PrivateModalsService);

  private readonly _loading$ = new BehaviorSubject<boolean>(false);

  public readonly loading$ = this._loading$.asObservable();

  constructor(private readonly privateTransferService: PrivateTransferService) {}

  public openSelector(): void {
    this.modalService
      .openPrivateTokensModal(this.injector)
      .subscribe((selectedToken: BalanceToken) => {
        this.privateTransferService.transferAsset = selectedToken;
      });
  }

  public updateInputValue(value: { visibleValue: string; actualValue: BigNumber }): void {
    this.privateTransferService.transferAmount = value;
  }

  public handleMaxButton(): void {}

  private createPreviewModal(transferAsset: BalanceToken): PreviewSwapModalFactory {
    const injector = this.injector;
    const modalService = this.modalService;

    return (options: PrivateSwapOptions) => {
      return modalService.openPrivatePreviewSwap(injector, {
        fromToken: transferAsset,
        toToken: transferAsset,
        fromAmount: this.privateTransferService.transferAmount,
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
      ...this.privateTransferService.transferAsset,
      weiAmount: Token.toWei(
        this.privateTransferService.transferAmount?.actualValue,
        this.privateTransferService.transferAsset?.decimals
      )
    });
    this.handleTransfer.emit({
      token,
      loadingCallback: () => this._loading$.next(false),
      openPreview: this.createPreviewModal(this.privateTransferService.transferAsset)
    });
  }
}
