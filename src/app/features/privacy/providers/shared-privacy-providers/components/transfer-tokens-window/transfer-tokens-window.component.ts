import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Injector,
  Input,
  OnInit,
  Output,
  Self
} from '@angular/core';
import { PrivateEvent } from '../../models/private-event';
import { BehaviorSubject, combineLatestWith, takeUntil } from 'rxjs';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import BigNumber from 'bignumber.js';
import { PrivateModalsService } from '../../services/private-modals/private-modals.service';
import { Token, TokenAmount } from '@cryptorubic/core';
import { PreviewSwapModalFactory } from '../private-preview-swap/models/preview-swap-modal-factory';
import { PrivateSwapOptions } from '../private-preview-swap/models/preview-swap-options';
import { PrivateTransferInfo } from '../../models/transfer-info';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { SwapAmount } from '../../models/swap-info';
import { PrivateTransferFormConfig } from '../../models/swap-form-types';

@Component({
  selector: 'app-transfer-tokens-window',
  templateUrl: './transfer-tokens-window.component.html',
  styleUrls: ['./transfer-tokens-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class TransferTokensWindowComponent implements OnInit {
  @Input() creationConfig: PrivateTransferFormConfig = {
    withActionButton: true,
    withReceiver: true,
    withSrcAmount: true
  };

  @Output() public handleTransfer = new EventEmitter<PrivateEvent>();

  @Output() public formChanged = new EventEmitter<PrivateTransferInfo>();

  private readonly _transferAsset$ = new BehaviorSubject<BalanceToken | null>(null);

  public readonly transferAsset$ = this._transferAsset$.asObservable();

  private readonly _transferAmount$ = new BehaviorSubject<SwapAmount | null>(null);

  public readonly transferAmount$ = this._transferAmount$.asObservable();

  private readonly injector = inject(Injector);

  private readonly modalService = inject(PrivateModalsService);

  private readonly _loading$ = new BehaviorSubject<boolean>(false);

  public readonly loading$ = this._loading$.asObservable();

  constructor(@Self() private readonly destroy$: TuiDestroyService) {}

  ngOnInit(): void {
    this.subscribeOnFormInputChanged();
  }

  private subscribeOnFormInputChanged(): void {
    this.transferAsset$
      .pipe(combineLatestWith(this.transferAmount$), takeUntil(this.destroy$))
      .subscribe(([fromAsset, fromAmount]) =>
        this.formChanged.emit({ fromAsset, fromAmount, toAmount: null })
      );
  }

  public openSelector(): void {
    this.modalService
      .openPrivateTokensModal(this.injector)
      .subscribe((selectedToken: BalanceToken) => {
        this._transferAsset$.next(selectedToken);
      });
  }

  public updateInputValue(value: SwapAmount): void {
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
        toAmount: options.dstTokenAmount
          ? {
              actualValue: new BigNumber(options.dstTokenAmount),
              visibleValue: options.dstTokenAmount
            }
          : this._transferAmount$.value,
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
