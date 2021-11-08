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

interface TokenInfo {
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
    blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'ETH',
    amount: new BigNumber(1)
  };

  private toToken: TokenInfo = {
    blockchain: BLOCKCHAIN_NAME.MOONRIVER,
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'MOVR'
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
  private findTokensByAddress(): Observable<{ fromToken: TokenAmount; toToken: TokenAmount }> {
    return this.swapsService.availableTokens.pipe(
      first(tokens => tokens?.size > 0),
      map((tokens: List<TokenAmount>) => ({
        fromToken: tokens.find(
          token =>
            token.address === this.fromToken.address &&
            token.blockchain === this.fromToken.blockchain
        ),
        toToken: tokens.find(
          token =>
            token.address === this.toToken.address && token.blockchain === this.toToken.blockchain
        )
      }))
    );
  }

  /**
   * Navigates to swap page and fill in tokens form.
   */
  public buyToken(): void {
    from(this.router.navigate(['/']))
      .pipe(switchMap(() => this.findTokensByAddress()))
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
