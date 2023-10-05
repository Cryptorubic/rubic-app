import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { first, map, switchMap } from 'rxjs/operators';
import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';
import { Router } from '@angular/router';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { List } from 'immutable';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { from, Observable } from 'rxjs';
import BigNumber from 'bignumber.js';
import { NATIVE_TOKEN_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import { compareTokens } from '@shared/utils/utils';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { ThemeService } from '@core/services/theme/theme.service';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';

export interface TokenInfo {
  blockchain: BlockchainName;
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
  /**
   * Banner type. Component Renders different texts based on type.
   */
  @Input() tokensType: 'default' | 'custom';

  private readonly customTokens: TokenPair;

  private readonly defaultTokens: TokenPair;

  public readonly theme$ = this.themeService.theme$;

  public readonly rubicIcon = {
    light: 'assets/images/icons/header/rubic.svg',
    dark: 'assets/images/icons/header/rubic-light.svg'
  };

  constructor(
    private readonly router: Router,
    private readonly swapFormService: SwapFormService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly themeService: ThemeService,
    private readonly tokensStoreService: TokensStoreService
  ) {
    this.tokensType = 'default';
    this.customTokens = {
      from: {
        blockchain: BLOCKCHAIN_NAME.FANTOM,
        address: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
        symbol: 'USDC',
        amount: new BigNumber(100)
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
        address: '0x3330BFb7332cA23cd071631837dC289B09C33333',
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

    return this.tokensStoreService.tokens$.pipe(
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
    this.gtmService.reloadGtmSession();
    from(this.router.navigate(['/']))
      .pipe(switchMap(() => this.findTokensByAddress(searchedTokens)))
      .subscribe(({ fromToken, toToken }) => {
        this.swapFormService.inputControl.patchValue({
          fromAsset: fromToken,
          toToken,
          fromAssetType: fromToken.blockchain,
          toBlockchain: toToken.blockchain,
          fromAmount:
            this.tokensType === 'default'
              ? this.defaultTokens.from.amount
              : this.customTokens.from.amount
        });
      });
  }
}
