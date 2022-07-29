import { ChangeDetectionStrategy, Component, Inject, OnInit, Self } from '@angular/core';
import { Router } from '@angular/router';
import { StakingService } from '@features/staking/services/staking.service';
import { map, takeUntil } from 'rxjs/operators';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { BLOCKCHAIN_NAME } from 'rubic-sdk';
import { AuthService } from '@core/services/auth/auth.service';
import { Token } from '@shared/models/tokens/token';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import { SwapFormInput } from '@features/swaps/features/main-form/models/swap-form';
import { SwapFormService } from '@features/swaps/features/main-form/services/swap-form-service/swap-form.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { compareTokens } from '@shared/utils/utils';
import BigNumber from 'bignumber.js';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { NATIVE_TOKEN_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import { TuiDestroyService } from '@taiga-ui/cdk';

enum STAKING_NAV_ENUM {
  STAKE = 0,
  WITHDRAW = 1
}

/**
 * Container component contains tab-switcher between staking and withdraw forms
 * and some additional functionality: can add BRBC to users wallet, navigate user
 * to swaps to get BRBC.
 */
@Component({
  selector: 'app-staking-container',
  templateUrl: './staking-container.component.html',
  styleUrls: ['./staking-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class StakingContainerComponent implements OnInit {
  public activeItemIndex = STAKING_NAV_ENUM.STAKE;

  public readonly isLoggedIn$ = this.authService
    .getCurrentUser()
    .pipe(map(user => Boolean(user?.address)));

  constructor(
    private readonly router: Router,
    private readonly stakingService: StakingService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly authService: AuthService,
    private readonly swapFormService: SwapFormService,
    private readonly tokensService: TokensService,
    @Self() private readonly destroy$: TuiDestroyService,
    @Inject(WINDOW) private readonly window: RubicWindow
  ) {}

  public ngOnInit(): void {
    this.stakingService.watchBRBCUsdPrice().pipe(takeUntil(this.destroy$)).subscribe();
  }

  public async navigateToSwaps(): Promise<void> {
    const form = this.swapFormService.commonTrade.controls.input;
    const { from, to } = this.getTokens();
    const params = {
      fromBlockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      toBlockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      fromToken: from,
      toToken: to,
      fromAmount: new BigNumber(1)
    } as SwapFormInput;
    form.patchValue(params);
    await this.router.navigate(['/'], {
      queryParams: {
        fromChain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
        toChain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
        amount: '1',
        from: from,
        to: to
      },
      queryParamsHandling: 'merge'
    });

    await this.router.navigate(['/']);
  }

  public async addTokensToWallet(): Promise<void> {
    const xBRBC: Token = {
      symbol: 'xBRBC',
      blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      address: this.stakingService.stakingContractAddress,
      decimals: 18,
      image: `${this.window.location.origin}/assets/images/icons/staking/brbc.svg`,
      rank: 0,
      price: 0,
      usedInIframe: false,
      name: 'Rubic Staking Token',
      hasDirectPair: true
    };
    await this.walletConnectorService.addToken(xBRBC);
  }

  private getTokens(): { from: TokenAmount; to: TokenAmount } {
    const fromToken = {
      address: NATIVE_TOKEN_ADDRESS,
      blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
    };
    const toToken = {
      address: '0x8e3bcc334657560253b83f08331d85267316e08a',
      blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
    };
    const from = this.tokensService.tokens.find(token => compareTokens(fromToken, token));
    const to = this.tokensService.tokens.find(token => compareTokens(toToken, token));

    return { from, to };
  }
}
