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

export interface TokenInfo {
  blockchain: BLOCKCHAIN_NAME;
  address: string;
  symbol: string;
  amount?: BigNumber;
}

@Component({
  selector: 'app-buy-token',
  templateUrl: './buy-token.component.html',
  styleUrls: ['./buy-token.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuyTokenComponent {
  @Input() appereance: TuiAppearance = TuiAppearance.Outline;

  private fromToken: Required<TokenInfo> = {
    blockchain: BLOCKCHAIN_NAME.ETHEREUM,
    address: NATIVE_TOKEN_ADDRESS,
    symbol: 'ETH',
    amount: new BigNumber(1)
  };

  private toToken: TokenInfo = {
    blockchain: BLOCKCHAIN_NAME.ETHEREUM,
    address: '0xa4eed63db85311e22df4473f87ccfc3dadcfa3e3',
    symbol: 'RBC'
  };

  constructor(
    private readonly router: Router,
    private readonly swapsService: SwapsService,
    private readonly swapFormService: SwapFormService
  ) {}

  /**
   * Finds tokens by address.
   * @return Observable from and to tokens.
   */
  private findTokensByAddress(searchedTokens?: {
    from: TokenInfo;
    to: TokenInfo;
  }): Observable<{ fromToken: TokenAmount; toToken: TokenAmount }> {
    const fromToken = searchedTokens?.from || this.fromToken;
    const toToken = searchedTokens?.to || this.toToken;

    return this.swapsService.availableTokens$.pipe(
      first(tokens => tokens?.size > 0),
      map((tokens: List<TokenAmount>) => ({
        fromToken: tokens.find(
          token => token.address === fromToken.address && token.blockchain === fromToken.blockchain
        ),
        toToken: tokens.find(
          token => token.address === toToken.address && token.blockchain === toToken.blockchain
        )
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
          fromAmount: this.fromToken.amount
        });
      });
  }
}
