import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Injector,
  Input,
  Output,
  OnInit
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, filter } from 'rxjs';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import BigNumber from 'bignumber.js';
import { PrivateModalsService } from '@features/privacy/providers/shared-privacy-providers/services/private-modals/private-modals.service';
import { Token, TokenAmount } from '@cryptorubic/core';
import { PrivateEvent } from '../../models/private-event';
import { PreviewSwapModalFactory } from '../private-preview-swap/models/preview-swap-modal-factory';
import { PrivateSwapOptions } from '../private-preview-swap/models/preview-swap-options';
import { receiverAnimation } from '../../animations/receiver-animation';
import { RevealWindowService } from '../../services/reveal-window/reveal-window.service';
import { PrivateUnshieldFormConfig } from '@features/privacy/providers/shared-privacy-providers/models/swap-form-types';
import { getCorrectAddressValidator } from '@app/features/trade/components/target-network-address/utils/get-correct-address-validator';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: false,
  selector: 'app-reveal-window',
  templateUrl: './reveal-window.component.html',
  styleUrls: ['./reveal-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [receiverAnimation()]
})
export class RevealWindowComponent implements OnInit {
  @Input() receiverCtrl: FormControl<string>;

  @Input() creationConfig: PrivateUnshieldFormConfig = {
    withActionButton: true,
    withReceiver: true,
    withSrcAmount: true,
    withMaxBtn: true,
    direction: 'to',
    showPresets: true,
    showWarnings: true
  };

  @Output() public handleReveal = new EventEmitter<PrivateEvent>();

  @Input() private customHandleMaxButton = false;

  @Output() public maxButtonClick = new EventEmitter<void>();

  private readonly revealWindowService = inject(RevealWindowService);

  private readonly _displayReceiver$ = new BehaviorSubject<boolean>(false);

  public readonly displayReceiver$ = this._displayReceiver$.asObservable();

  public readonly revealAsset$ = this.revealWindowService.revealAsset$;

  public readonly revealAmount$ = this.revealWindowService.revealAmount$;

  private readonly injector = inject(Injector);

  private readonly modalService = inject(PrivateModalsService);

  private readonly _loading$ = new BehaviorSubject<boolean>(false);

  public readonly loading$ = this._loading$.asObservable();

  readonly destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.revealWindowService.revealAsset$
      .pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef))
      .subscribe(token => {
        this.receiverCtrl.clearAsyncValidators();
        this.receiverCtrl.setAsyncValidators(
          getCorrectAddressValidator(
            {
              fromAssetType: token.blockchain,
              validatedChain: token.blockchain
            },
            { requiredReceiver: true }
          )
        );
        this.receiverCtrl.updateValueAndValidity({ emitEvent: false });
      });
  }

  public openSelector(): void {
    this.modalService
      .openPrivateTokensModal(
        this.injector,
        this.creationConfig.direction || 'to',
        this.creationConfig.assetsSelectorConfig
      )
      .subscribe((selectedToken: BalanceToken) => {
        this.revealWindowService.setRevealAsset(selectedToken);
      });
  }

  public updateInputValue(value: { visibleValue: string; actualValue: BigNumber }): void {
    this.revealWindowService.setRevealAmount(value);
  }

  public handleMaxButton(): void {
    if (this.customHandleMaxButton) {
      this.maxButtonClick.emit();
      return;
    }
    const token = this.revealWindowService.revealAsset;
    this.revealWindowService.setRevealAmount({
      visibleValue: token.amount.toString(),
      actualValue: token.amount
    });
  }

  private createPreviewModal(revealAsset: BalanceToken): PreviewSwapModalFactory {
    const injector = this.injector;
    const modalService = this.modalService;

    return (options: PrivateSwapOptions) => {
      const revealAmount = this.revealWindowService.revealAmount;

      return modalService.openPrivatePreviewSwap(injector, {
        fromToken: revealAsset,
        toToken: revealAsset,
        fromAmount: revealAmount,
        toAmount: options.dstTokenAmount
          ? {
              actualValue: new BigNumber(options.dstTokenAmount),
              visibleValue: options.dstTokenAmount
            }
          : revealAmount,
        swapType: options.swapType ?? 'unshield',
        swapOptions: options
      });
    };
  }

  public async reveal(): Promise<void> {
    this._loading$.next(true);
    const revealAsset = this.revealWindowService.revealAsset;
    const revealAmount = this.revealWindowService.revealAmount;

    const token = new TokenAmount({
      ...revealAsset,
      weiAmount: Token.toWei(revealAmount.actualValue, revealAsset.decimals)
    });
    this.handleReveal.emit({
      token,
      balanceToken: revealAsset,
      loadingCallback: () => this._loading$.next(false),
      openPreview: this.createPreviewModal(revealAsset)
    });
  }

  public toggleReceiver(): void {
    this._displayReceiver$.next(!this._displayReceiver$.value);
  }

  public handlePresetSelect(amount: string): void {
    this.revealWindowService.setRevealAmount({
      visibleValue: amount,
      actualValue: new BigNumber(amount)
    });
  }
}
