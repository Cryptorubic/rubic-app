import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { first, map, switchMap } from 'rxjs/operators';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Router } from '@angular/router';
import { SwapsService } from 'src/app/features/swaps/services/swaps-service/swaps.service';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { TuiAppearance } from '@taiga-ui/core';
import { List } from 'immutable';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { from } from 'rxjs';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-buy-token',
  templateUrl: './buy-token.component.html',
  styleUrls: ['./buy-token.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuyTokenComponent {
  @Input() appereance: TuiAppearance = TuiAppearance.Outline;

  private fromBlockchain = BLOCKCHAIN_NAME.ETHEREUM;

  private toBlockchain = BLOCKCHAIN_NAME.ETHEREUM;

  private fromTokenAddress = '0x0000000000000000000000000000000000000000';

  private toTokenAddress = '0xa4eed63db85311e22df4473f87ccfc3dadcfa3e3';

  constructor(
    private readonly router: Router,
    private readonly swapsService: SwapsService,
    private readonly swapFormService: SwapFormService
  ) {}

  /**
   * Finds tokens by address.
   * @return Observable from and to tokens.
   */
  private findTokensByAddress() {
    return this.swapsService.availableTokens.pipe(
      first(tokens => tokens?.size > 0),
      map((tokens: List<TokenAmount>) => ({
        fromToken: tokens.find(
          token =>
            token.address === this.fromTokenAddress && token.blockchain === this.fromBlockchain
        ),
        toToken: tokens.find(
          token => token.address === this.toTokenAddress && token.blockchain === this.toBlockchain
        )
      }))
    );
  }

  /**
   * Navigate to IT Ethereum and fill swap form from ETH to ALGB.
   */
  public buyToken() {
    from(this.router.navigate(['/']))
      .pipe(switchMap(() => this.findTokensByAddress()))
      .subscribe(({ fromToken, toToken }) => {
        this.swapFormService.input.patchValue({
          fromToken,
          toToken,
          fromBlockchain: BLOCKCHAIN_NAME.ETHEREUM,
          toBlockchain: BLOCKCHAIN_NAME.ETHEREUM,
          fromAmount: new BigNumber(1)
        });
      });
  }

  // this.router.navigate(['/']).then(() => {
  //   this.swapsService.availableTokens
  //     .pipe(first(tokens => tokens?.size > 0))
  //     .subscribe(tokens => {
  //       const ETH = tokens.find(
  //         token => token.symbol === 'ETH' && token.blockchain === BLOCKCHAIN_NAME.ETHEREUM
  //       );
  //
  //       const RBC = tokens.find(
  //         token => token.symbol === 'RBC' && token.blockchain === BLOCKCHAIN_NAME.ETHEREUM
  //       );
  //
  //       this.swapFormService.input.patchValue({
  //         fromToken: ETH,
  //         toToken: RBC,
  //         fromBlockchain: BLOCKCHAIN_NAME.ETHEREUM,
  //         toBlockchain: BLOCKCHAIN_NAME.ETHEREUM,
  //         fromAmount: new BigNumber(1)
  //       });
  //     });
  // });
}
