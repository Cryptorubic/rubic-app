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
import { FormControl } from '@angular/forms';
import { PrivateTransferWindowService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-transfer-window/private-transfer-window.service';

@Component({
  selector: 'app-transfer-tokens-window',
  templateUrl: './transfer-tokens-window.component.html',
  styleUrls: ['./transfer-tokens-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class TransferTokensWindowComponent implements OnInit {
  @Input() receiverCtrl: FormControl<string>;

  @Input() creationConfig: PrivateTransferFormConfig = {
    withActionButton: true,
    withReceiver: true,
    withSrcAmount: true,
    withMaxBtn: true
  };

  @Output() public handleTransfer = new EventEmitter<PrivateEvent>();

  @Output() public formChanged = new EventEmitter<PrivateTransferInfo>();

  public readonly transferAsset$ = this.privateTransferWindowService.transferAsset$;

  public readonly transferAmount$ = this.privateTransferWindowService.transferAmount$;

  private readonly injector = inject(Injector);

  private readonly modalService = inject(PrivateModalsService);

  private readonly _loading$ = new BehaviorSubject<boolean>(false);

  public readonly loading$ = this._loading$.asObservable();

  constructor(
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly privateTransferWindowService: PrivateTransferWindowService
  ) {}

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
      .openPrivateTokensModal(this.injector, 'to', this.creationConfig.assetsSelectorConfig)
      .subscribe((selectedToken: BalanceToken) => {
        this.privateTransferWindowService.setTransferAsset(selectedToken);
      });
  }

  public updateInputValue(value: SwapAmount): void {
    this.privateTransferWindowService.setTransferAmount(value);
  }

  public handleMaxButton(): void {
    const token = this.privateTransferWindowService.transferAsset;
    this.privateTransferWindowService.setTransferAmount({
      visibleValue: token.amount.toString(),
      actualValue: token.amount
    });
  }

  private createPreviewModal(transferAsset: BalanceToken): PreviewSwapModalFactory {
    const injector = this.injector;
    const modalService = this.modalService;

    return (options: PrivateSwapOptions) => {
      return modalService.openPrivatePreviewSwap(injector, {
        fromToken: transferAsset,
        toToken: transferAsset,
        fromAmount: options.srcTokenAmount
          ? {
              actualValue: new BigNumber(options.srcTokenAmount || 0),
              visibleValue: options.srcTokenAmount || '0'
            }
          : this.privateTransferWindowService.transferAmount,
        toAmount: {
          actualValue: new BigNumber(options.dstTokenAmount || 0),
          visibleValue: options.dstTokenAmount || '0'
        },
        swapType: options.swapType ?? 'transfer',
        swapOptions: options
      });
    };
  }

  public async transfer(): Promise<void> {
    this._loading$.next(true);
    const token = new TokenAmount({
      ...this.privateTransferWindowService.transferAsset,
      weiAmount: Token.toWei(
        this.privateTransferWindowService.transferAmount?.actualValue,
        this.privateTransferWindowService.transferAsset?.decimals
      )
    });
    this.handleTransfer.emit({
      token,
      loadingCallback: () => this._loading$.next(false),
      openPreview: this.createPreviewModal(this.privateTransferWindowService.transferAsset)
    });
  }
}
