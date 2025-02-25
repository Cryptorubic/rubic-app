import { Injectable } from '@angular/core';
import { isMinimalToken } from '@shared/utils/is-token';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { TokensService } from '@core/services/tokens/tokens.service';
import { debounceTime, filter, pairwise, startWith, switchMap } from 'rxjs/operators';
import { compareTokens } from '@shared/utils/utils';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { SwapFormInput } from '@features/trade/models/swap-form-controls';
import { compareAssets } from '@features/trade/utils/compare-assets';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { forkJoin, of } from 'rxjs';

@Injectable()
export class SwapTokensUpdaterService {
  private intervalId: NodeJS.Timeout;

  constructor(
    private readonly swapsFormService: SwapsFormService,
    private readonly tokensService: TokensService,
    private readonly tokensStoreService: TokensStoreService,
    private readonly walletConnector: WalletConnectorService
  ) {
    this.subscribeOnForm();
    this.subscribeOnTokens();
    this.subscribeOnUserChange();
  }

  private subscribeOnForm(): void {
    this.swapsFormService.inputValue$
      .pipe(startWith(null), pairwise())
      .subscribe(([prevForm, curForm]) => {
        if (
          (!compareAssets(prevForm?.fromToken, curForm.fromToken) &&
            isMinimalToken(curForm.fromToken)) ||
          (!compareTokens(prevForm?.toToken, curForm.toToken) && curForm.toToken)
        ) {
          this.updateTokensPrices(curForm);
        }

        if (
          !compareAssets(prevForm?.fromToken, curForm.fromToken) &&
          isMinimalToken(curForm.fromToken)
        ) {
          this.updateTokenBalance(curForm.fromToken);
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
      if (isMinimalToken(form.fromToken)) {
        this.tokensService.getTokenPrice(form.fromToken);
      }
      if (form.toToken) {
        this.tokensService.getTokenPrice(form.toToken, true);
      }
    };

    update();
    this.intervalId = setInterval(update, 15_000);
  }

  /**
   * Calls functions to update balance, if needed.
   */
  private updateTokenBalance(fromToken: TokenAmount): void {
    if (fromToken?.amount && !fromToken.amount.isFinite()) {
      this.tokensService.getAndUpdateTokenBalance(fromToken);
    }
  }

  private subscribeOnTokens(): void {
    this.tokensStoreService.tokens$.pipe(debounceTime(50), filter(Boolean)).subscribe(tokens => {
      const form = this.swapsFormService.inputValue;
      const fromToken =
        isMinimalToken(form.fromToken) &&
        tokens.find(token => compareTokens(token, form.fromToken));
      const toToken = form.toToken && tokens.find(token => compareTokens(token, form.toToken));

      this.swapsFormService.inputControl.patchValue(
        {
          ...(fromToken && { fromAsset: fromToken }),
          ...(toToken && { toToken })
        },
        { emitEvent: false }
      );
    });
  }

  private subscribeOnUserChange(): void {
    this.walletConnector.addressChange$
      .pipe(
        switchMap(() => {
          const { fromToken, toToken } = this.swapsFormService.inputValue;

          if (!fromToken && !toToken) {
            return of(null);
          }

          return forkJoin([
            ...(fromToken ? [this.tokensService.getAndUpdateTokenBalance(fromToken)] : []),
            ...(toToken ? [this.tokensService.getAndUpdateTokenBalance(toToken)] : [])
          ]);
        })
      )
      .subscribe();
  }
}
