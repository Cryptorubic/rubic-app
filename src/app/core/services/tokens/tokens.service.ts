import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, from, Observable, of, Subject } from 'rxjs';
import { List } from 'immutable';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { coingeckoTestTokens } from 'src/test/tokens/test-tokens';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { TokensApiService } from 'src/app/core/services/backend/tokens-api/tokens-api.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Token } from 'src/app/shared/models/tokens/Token';
import BigNumber from 'bignumber.js';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { map, switchMap, tap } from 'rxjs/operators';
import { CoingeckoApiService } from 'src/app/core/services/external-api/coingecko-api/coingecko-api.service';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';

@Injectable({
  providedIn: 'root'
})
export class TokensService {
  private readonly _tokens: BehaviorSubject<List<TokenAmount>> = new BehaviorSubject(List([]));

  private readonly _tokensRequestParameters = new Subject<Object>();

  get tokens(): Observable<List<TokenAmount>> {
    return this._tokens.asObservable();
  }

  set tokensRequestParameters(parameters: Object) {
    this._tokensRequestParameters.next(parameters);
  }

  private userAddress: string;

  private isTestingMode = false;

  public static areTokensEqual(
    token0: { blockchain: BLOCKCHAIN_NAME; address: string },
    token1: { blockchain: BLOCKCHAIN_NAME; address: string }
  ): boolean {
    return (
      token0?.blockchain === token1?.blockchain &&
      token0?.address.toLowerCase() === token1?.address.toLowerCase()
    );
  }

  constructor(
    private readonly tokensApiService: TokensApiService,
    private readonly authService: AuthService,
    private readonly web3PublicService: Web3PublicService,
    private readonly useTestingMode: UseTestingModeService,
    private readonly coingeckoApiService: CoingeckoApiService
  ) {
    this._tokensRequestParameters
      .pipe(switchMap(params => this.tokensApiService.getTokensList(params)))
      .subscribe(
        tokens => {
          if (!this.isTestingMode) {
            this.setDefaultTokenAmounts(tokens);
            this.calculateUserTokensBalances();
          }
        },
        err => console.error('Error retrieving tokens', err)
      );

    this.authService.getCurrentUser().subscribe(user => {
      this.userAddress = user?.address;
      this.calculateUserTokensBalances();
    });

    useTestingMode.isTestingMode.subscribe(isTestingMode => {
      if (isTestingMode) {
        this.isTestingMode = true;
        this._tokens.next(List(coingeckoTestTokens));
        this.calculateUserTokensBalances();
      }
    });

    this._tokensRequestParameters.next();
  }

  public setTokens(tokens: List<TokenAmount>): void {
    this._tokens.next(tokens);
  }

  private setDefaultTokenAmounts(tokens: List<Token> = this._tokens.getValue()): void {
    this._tokens.next(
      tokens.map(token => ({
        ...token,
        amount: new BigNumber(NaN)
      }))
    );
  }

  public async calculateUserTokensBalances(
    tokens: List<TokenAmount> = this._tokens.getValue()
  ): Promise<void> {
    if (!tokens.size) {
      return;
    }

    if (!this.userAddress) {
      this.setDefaultTokenAmounts(tokens);
      return;
    }

    const blockchains: BLOCKCHAIN_NAME[] = [
      BLOCKCHAIN_NAME.ETHEREUM,
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      BLOCKCHAIN_NAME.POLYGON,
      BLOCKCHAIN_NAME.HARMONY
    ];
    const promises: Promise<BigNumber[]>[] = [];

    blockchains.forEach(blockchain => {
      promises.push(
        this.web3PublicService[blockchain].getTokensBalances(
          this.userAddress,
          tokens
            .filter(token => token.blockchain === blockchain)
            .map(token => token.address)
            .toArray()
        )
      );
    });

    const balancesSettled = await Promise.allSettled(promises);
    const tokensWithBalance: TokenAmount[][] = [];
    blockchains.forEach((blockchain, blockchainIndex) => {
      if (balancesSettled[blockchainIndex].status === 'fulfilled') {
        const balances = (balancesSettled[blockchainIndex] as PromiseFulfilledResult<BigNumber[]>)
          .value;
        tokensWithBalance.push(
          tokens
            .filter(token => token.blockchain === blockchain)
            .map((token, tokenIndex) => ({
              ...token,
              amount: Web3Public.fromWei(balances[tokenIndex], token.decimals) || undefined
            }))
            .toArray()
        );
      }
    });

    tokensWithBalance.push(
      tokens.filter(token => !blockchains.includes(token.blockchain)).toArray()
    );

    if (!this.isTestingMode || (this.isTestingMode && tokens.size < 1000)) {
      this._tokens.next(List(tokensWithBalance.flat()));
    }
  }

  public addToken(address: string, blockchain: BLOCKCHAIN_NAME): Observable<TokenAmount> {
    const web3Public: Web3Public = this.web3PublicService[blockchain];
    const balance$: Observable<BigNumber> = this.userAddress
      ? from(web3Public.getTokenBalance(this.userAddress, address))
      : of(null);

    return forkJoin([web3Public.getTokenInfo(address), balance$]).pipe(
      map(([tokenInfo, amount]) => ({
        blockchain,
        address,
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        decimals: tokenInfo.decimals,
        image: '',
        rank: 1,
        price: null,
        usedInIframe: true,
        amount
      })),
      tap((token: TokenAmount) => this._tokens.next(this._tokens.getValue().push(token)))
    );
  }

  public getNativeCoinPriceInUsd(blockchain: BLOCKCHAIN_NAME): Promise<number> {
    const nativeCoin = this._tokens
      .getValue()
      .find(token =>
        TokensService.areTokensEqual(token, { blockchain, address: NATIVE_TOKEN_ADDRESS })
      );
    return this.coingeckoApiService
      .getNativeCoinPriceInUsdByCoingecko(blockchain)
      .pipe(map(price => price || nativeCoin?.price))
      .toPromise();
  }

  public updateTokenPriceInUsd(token: TokenAmount): void {
    this.coingeckoApiService.getTokenPrice(token).subscribe(tokenPrice => {
      if (tokenPrice) {
        const newToken = {
          ...token,
          price: tokenPrice
        };
        this._tokens.next(
          this._tokens
            .getValue()
            .filter(tokenAmount => !TokensService.areTokensEqual(tokenAmount, token))
            .push(newToken)
        );
      }
    });
  }
}
