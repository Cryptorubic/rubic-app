import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { first, map, switchMap } from 'rxjs/operators';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Router } from '@angular/router';
import { SwapsService } from 'src/app/features/swaps/services/swaps-service/swaps.service';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { TuiAppearance } from '@taiga-ui/core';
import { List } from 'immutable';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { from, Observable } from 'rxjs';
import BigNumber from 'bignumber.js';
import { NATIVE_TOKEN_ADDRESS } from '@shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { compareTokens } from '@shared/utils/utils';

export interface TokenInfo {
  blockchain: BLOCKCHAIN_NAME;
  address: string;
  symbol: string;
  amount?: BigNumber;
}

interface TokenPair {
  from: Required<TokenInfo>;
  to: TokenInfo;
}

@Component({
  selector: 'app-buy-token',
  templateUrl: './buy-token.component.html',
  styleUrls: ['./buy-token.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuyTokenComponent {
  @Input() appereance: TuiAppearance = TuiAppearance.Outline;

  /**
   * Banner type. Component Renders different texts based on type.
   */
  @Input() tokensType: 'default' | 'custom';

  private readonly customTokens: TokenPair;

  private readonly defaultTokens: TokenPair;

  constructor(
    private readonly router: Router,
    private readonly swapsService: SwapsService,
    private readonly swapFormService: SwapFormService
  ) {
    this.tokensType = 'default';
    this.customTokens = {
      from: {
        blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
        address: NATIVE_TOKEN_ADDRESS,
        symbol: 'BNB',
        amount: new BigNumber(1)
      },
      to: {
        blockchain: BLOCKCHAIN_NAME.FANTOM,
        address: NATIVE_TOKEN_ADDRESS,
        symbol: 'FTM'
      }
    };
    this.defaultTokens = {
      from: {
        blockchain: BLOCKCHAIN_NAME.ETHEREUM,
        address: NATIVE_TOKEN_ADDRESS,
        symbol: 'ETH',
        amount: new BigNumber(1)
      },
      to: {
        blockchain: BLOCKCHAIN_NAME.ETHEREUM,
        address: '0xa4eed63db85311e22df4473f87ccfc3dadcfa3e3',
        symbol: 'RBC'
      }
    };
  }

  /**
   * Finds tokens by address.
   * @return Observable from and to tokens.
   */
  private findTokensByAddress(searchedTokens?: {
    from: TokenInfo;
    to: TokenInfo;
  }): Observable<{ fromToken: TokenAmount; toToken: TokenAmount }> {
    const fromToken =
      searchedTokens?.from || this.tokensType === 'default'
        ? this.defaultTokens.from
        : this.customTokens.from;
    const toToken =
      searchedTokens?.to || this.tokensType === 'default'
        ? this.defaultTokens.to
        : this.customTokens.to;

    return this.swapsService.availableTokens$.pipe(
      first(tokens => tokens?.size > 0),
      map((tokens: List<TokenAmount>) => ({
        fromToken: tokens.find(token => compareTokens(token, fromToken)),
        toToken: tokens.find(token => compareTokens(token, toToken))
      }))
    );
  }

  /**
   * Navigates to swap page and fill in tokens form.
   */
  public buyToken(searchedTokens?: { from: TokenInfo; to: TokenInfo }): void {
    from(this.router.navigate(['/']))
      .pipe(switchMap(() => this.findTokensByAddress(searchedTokens)))
      .subscribe(({ fromToken, toToken }) => {
        this.swapFormService.input.patchValue({
          fromToken,
          toToken,
          fromBlockchain: fromToken.blockchain,
          toBlockchain: toToken.blockchain,
          fromAmount:
            this.tokensType === 'default'
              ? this.defaultTokens.from.amount
              : this.customTokens.from.amount
        });
      });
  }
}
