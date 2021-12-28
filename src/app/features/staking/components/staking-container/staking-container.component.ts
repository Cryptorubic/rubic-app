import { ChangeDetectionStrategy, Component, Inject, OnInit, Self } from '@angular/core';
import { Router } from '@angular/router';
import { QueryParamsService } from '@app/core/services/query-params/query-params.service';
import { StakingService } from '@features/staking/services/staking.service';
import { map, takeUntil } from 'rxjs/operators';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import { AuthService } from '@core/services/auth/auth.service';
import { Token } from '@shared/models/tokens/Token';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import { SwapFormInput } from '@features/swaps/models/SwapForm';
import { SwapFormService } from '@features/swaps/services/swaps-form-service/swap-form.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { TokenAmount } from '@shared/models/tokens/TokenAmount';
import { NATIVE_TOKEN_ADDRESS } from '@shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { compareTokens } from '@shared/utils/utils';
import BigNumber from 'bignumber.js';
import { environment } from 'src/environments/environment';
import { TuiDestroyService } from '@taiga-ui/cdk';

enum STAKING_NAV_ENUM {
  STAKE = 0,
  WITHDRAW = 1
}

@Component({
  selector: 'app-staking-container',
  templateUrl: './staking-container.component.html',
  styleUrls: ['./staking-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class StakingContainerComponent implements OnInit {
  public activeItemIndex = STAKING_NAV_ENUM.STAKE;

  public readonly isLoggedIn$ = this.authService.getCurrentUser();

  public readonly refillTime$ = this.stakingService.refillTime$.pipe(
    map(refillTime => {
      if (!refillTime) {
        return 0;
      }
      const date = new Date(Number(refillTime));
      return { hours: date.getHours(), minutes: date.getMinutes() };
    })
  );

  constructor(
    private readonly router: Router,
    private readonly queryParamsService: QueryParamsService,
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
      address: environment.staking.stakingContractAddress,
      decimals: 18,
      image: `${this.window.location.origin}/assets/images/icons/staking/brbc.svg`,
      rank: 0,
      price: 0,
      usedInIframe: false,
      name: 'Rubic Staking Token'
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
