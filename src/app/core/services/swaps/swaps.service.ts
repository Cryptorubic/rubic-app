import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { pairwise, startWith } from 'rxjs/operators';
import { TokensService } from '@core/services/tokens/tokens.service';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { SwapFormInput } from 'src/app/core/services/swaps/models/swap-form-controls';
import { isMinimalToken } from '@shared/utils/is-token';
import { compareAssets } from '@features/swaps/shared/utils/compare-assets';
import { QueryParamsService } from '@core/services/query-params/query-params.service';

@Injectable()
export class SwapsService {
  private intervalId: NodeJS.Timeout;

  private readonly _swapProviderType$ = new BehaviorSubject<SWAP_PROVIDER_TYPE>(undefined);

  public readonly swapMode$ = this._swapProviderType$.asObservable();

  get swapMode(): SWAP_PROVIDER_TYPE | null {
    return this._swapProviderType$.getValue();
  }

  set swapMode(swapType: SWAP_PROVIDER_TYPE) {
    this._swapProviderType$.next(swapType);
  }

  constructor(
    private readonly swapFormService: SwapFormService,
    private readonly queryParamsService: QueryParamsService,
    private readonly tokensService: TokensService
  ) {
    this.subscribeOnForm();
  }

  private subscribeOnForm(): void {
    this.swapFormService.inputValue$
      .pipe(startWith(null), pairwise())
      .subscribe(([prevForm, curForm]) => {
        this.setSwapProviderType(curForm);

        if (
          (!compareAssets(prevForm?.fromAsset, curForm.fromAsset) &&
            isMinimalToken(curForm.fromAsset)) ||
          (!TokensService.areTokensEqual(prevForm?.toToken, curForm.toToken) && curForm.toToken)
        ) {
          this.updateTokensPrices(curForm);
        }

        if (
          !compareAssets(prevForm?.fromAsset, curForm.fromAsset) &&
          isMinimalToken(curForm.fromAsset)
        ) {
          this.updateTokenBalance(curForm.fromAsset);
        }
      });
  }

  private setSwapProviderType(form: SwapFormInput): void {
    const { fromAssetType, toBlockchain } = form;

    if (fromAssetType === 'fiat') {
      this.swapMode = SWAP_PROVIDER_TYPE.ONRAMPER;
    } else if (!fromAssetType || !toBlockchain || fromAssetType === toBlockchain) {
      this.swapMode = SWAP_PROVIDER_TYPE.INSTANT_TRADE;
    } else {
      this.swapMode = SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING;
    }
  }

  /**
   * Takes selected tokens from {@param form} and call functions to update their prices.
   * Sets interval to update prices.
   * @param form Input form, which contains selected tokens.
   */
  private updateTokensPrices(form: SwapFormInput): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    const update = () => {
      if (isMinimalToken(form?.fromAsset)) {
        this.tokensService.getAndUpdateTokenPrice(form.fromAsset);
      }
      if (form?.toToken) {
        this.tokensService.getAndUpdateTokenPrice(form.toToken);
      }
    };

    update();
    this.intervalId = setInterval(update, 15_000);
  }

  /**
   * Calls functions to update balance, if needed.
   */
  private updateTokenBalance(fromToken: TokenAmount): void {
    if (!fromToken.amount?.isFinite()) {
      this.tokensService.getAndUpdateTokenBalance(fromToken);
    }
  }
}
