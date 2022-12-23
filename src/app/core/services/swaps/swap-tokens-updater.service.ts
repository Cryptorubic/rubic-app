import { Injectable } from '@angular/core';
import { SwapFormInput } from '@core/services/swaps/models/swap-form-controls';
import { isMinimalToken } from '@shared/utils/is-token';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { filter, pairwise, startWith } from 'rxjs/operators';
import { compareAssets } from '@features/swaps/shared/utils/compare-assets';
import { compareTokens } from '@shared/utils/utils';
import { MinimalToken } from '@shared/models/tokens/minimal-token';

@Injectable()
export class SwapTokensUpdaterService {
  private intervalId: NodeJS.Timeout;

  constructor(
    private readonly swapFormService: SwapFormService,
    private readonly tokensService: TokensService
  ) {
    this.subscribeOnForm();
    this.subscribeOnTokens();
  }

  private subscribeOnForm(): void {
    this.swapFormService.inputValue$
      .pipe(startWith(null), pairwise())
      .subscribe(([prevForm, curForm]) => {
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
      if (isMinimalToken(form.fromAsset)) {
        this.tokensService.getAndUpdateTokenPrice(form.fromAsset);
      }
      if (form.toToken) {
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
    if (!fromToken.amount.isFinite()) {
      this.tokensService.getAndUpdateTokenBalance(fromToken);
    }
  }

  private subscribeOnTokens(): void {
    this.tokensService.tokens$.pipe(filter(Boolean)).subscribe(tokens => {
      const form = this.swapFormService.inputValue;
      const fromToken =
        isMinimalToken(form.fromAsset) &&
        tokens.find(token => compareTokens(token, form.fromAsset as MinimalToken));
      const toToken = form.toToken && tokens.find(token => compareTokens(token, form.toToken));

      this.swapFormService.inputControl.patchValue({
        ...(fromToken && { fromAsset: fromToken }),
        ...(toToken && { toToken })
      });
    });
  }
}
