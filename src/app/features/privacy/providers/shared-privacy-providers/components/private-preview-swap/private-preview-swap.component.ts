import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { blockchainColor } from '@app/shared/constants/blockchain/blockchain-color';
import { BLOCKCHAINS } from '@app/shared/constants/blockchain/ui-blockchains';
import { AssetSelector } from '@app/shared/models/asset-selector';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import {
  PreviewPrivateSwapOptions,
  PreviewSwapWarning,
  PrivateStep,
  PrivateSwapOptions,
  PrivateSwapType
} from './models/preview-swap-options';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import BigNumber from 'bignumber.js';
import { SWAP_TYPE_LABEL } from './constants/swap-type-label';
import { HeaderStore } from '@app/core/header/services/header.store';
import { AppGasData } from '@app/features/trade/models/provider-info';
import { FeeInfo } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { ErrorsService } from '@app/core/errors/errors.service';
import { BlockchainsInfo } from '@cryptorubic/core';
import { Web3Pure } from '@cryptorubic/web3';
import { SwapDataElementConfig } from '@app/features/trade/components/swap-data-element/model';
import { PrivateSwapWindowService } from '../../services/private-swap-window/private-swap-window.service';

@Component({
  selector: 'app-private-preview-swap',
  templateUrl: './private-preview-swap.component.html',
  styleUrls: ['./private-preview-swap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivatePreviewSwapComponent {
  public readonly fromAsset: AssetSelector;

  public readonly toAsset: AssetSelector;

  public readonly fromValue: { tokenAmount: BigNumber; fiatAmount: string };

  public readonly toValue: { tokenAmount: BigNumber; fiatAmount: string };

  public readonly warnings?: PreviewSwapWarning[];

  private readonly swapType: PrivateSwapType;

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  public readonly nativeToken$: Observable<BalanceToken>;

  public readonly gasInfo: AppGasData | null;

  public readonly gasTokens: BalanceToken[];

  public readonly feeInfo: FeeInfo | null;

  public readonly displayAmount: string | undefined;

  public readonly hideFeeInfo: boolean | undefined;

  private readonly _currentStep$ = new BehaviorSubject<PrivateStep | null>(null);

  public readonly currentStep$ = this._currentStep$.asObservable();

  private steps: PrivateStep[];

  private readonly swapOptions: PrivateSwapOptions;

  public get formLabel(): string {
    return SWAP_TYPE_LABEL[this.swapType];
  }

  public readonly swapDataCreationConfig: SwapDataElementConfig = {
    feeIcon: 'assets/images/icons/privacy-fee.svg',
    withVerboseFeeHint: false,
    zeroFeeText: 'Zero fee',
    direction: 'vertical'
  };

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<void, PreviewPrivateSwapOptions>,
    private readonly headerStore: HeaderStore,
    private readonly tokensFacade: TokensFacadeService,
    private readonly errorService: ErrorsService,
    private readonly privateSwapWindowService: PrivateSwapWindowService
  ) {
    this.fromAsset = this.getTokenAsset(context.data.fromToken);
    this.toAsset = this.getTokenAsset(context.data.toToken);

    const fromChain = context.data.fromToken.blockchain;
    const chainType = BlockchainsInfo.getChainType(fromChain);
    const fromChainNativeAddress = Web3Pure.getNativeTokenAddress(chainType);
    this.nativeToken$ = from(
      this.tokensFacade.findToken({ address: fromChainNativeAddress, blockchain: fromChain })
    );

    this.fromValue = this.getTokenValue(
      context.data.fromToken,
      context.data.fromAmount.actualValue
    );
    this.toValue = this.getTokenValue(context.data.toToken, context.data.toAmount.actualValue);

    const [initialStep, ...steps] = context.data.swapOptions.steps;
    this._currentStep$.next(initialStep);
    this.steps = steps;

    this.warnings = context.data.swapOptions.warnings;
    this.swapType = context.data.swapType;
    this.gasInfo = context.data.swapOptions.gasInfo || null;
    this.gasTokens = context.data.swapOptions.gasTokens || [];
    this.feeInfo = context.data.swapOptions.feeInfo || null;
    this.displayAmount = context.data.swapOptions.displayAmount;
    this.hideFeeInfo = context.data.swapOptions.hideFeeInfo;
    this.swapOptions = context.data.swapOptions;
  }

  private getTokenAsset(token: BalanceToken): AssetSelector {
    const blockchain = BLOCKCHAINS[token.blockchain];
    const color = blockchainColor[token.blockchain];

    return {
      secondImage: blockchain.img,
      secondLabel: blockchain.name,
      mainImage: token.image,
      mainLabel: token.symbol,
      secondColor: color
    };
  }

  private getTokenValue(
    token: BalanceToken,
    tokenAmount: BigNumber
  ): { tokenAmount: BigNumber; fiatAmount: string } {
    return {
      tokenAmount: tokenAmount,
      fiatAmount:
        tokenAmount.gt(0) && token.price
          ? tokenAmount.multipliedBy(token.price || 0).toFixed(2)
          : '0'
    };
  }

  public backToForm(): void {
    this.context.completeWith();
  }

  public onImageError($event: Event): void {
    TokensFacadeService.onTokenImageError($event);
  }

  private setLoadingState(): void {
    this._currentStep$.next({
      label: 'Transaction in process',
      action: async () => {},
      disabled: true
    });
  }

  public async handleStep(step: PrivateStep): Promise<void> {
    try {
      this.setLoadingState();

      await step.action();

      const [nextStep, ...steps] = this.steps;

      if (!nextStep) {
        this.context.completeWith();
        return;
      }

      this._currentStep$.next(nextStep);
      this.steps = steps;
    } catch (err) {
      this.errorService.catch(err);
      this.context.completeWith();
    }
  }

  public selectGasToken(token: BalanceToken): void {
    this.privateSwapWindowService.selectGasToken(token);
  }
}
