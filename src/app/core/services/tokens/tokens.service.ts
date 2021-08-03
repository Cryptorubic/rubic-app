import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, from, Observable, of } from 'rxjs';
import { List } from 'immutable';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { coingeckoTestTokens } from 'src/test/tokens/coingecko-tokens';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { TokensApiService } from 'src/app/core/services/backend/tokens-api/tokens-api.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { Token } from 'src/app/shared/models/tokens/Token';
import BigNumber from 'bignumber.js';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { map, tap } from 'rxjs/operators';

const RBC_ADDRESS = '0xa4eed63db85311e22df4473f87ccfc3dadcfa3e3';

const BRBC_ADDRESS = '0x8e3bcc334657560253b83f08331d85267316e08a';

@Injectable({
  providedIn: 'root'
})
export class TokensService {
  private readonly _tokens: BehaviorSubject<List<TokenAmount>> = new BehaviorSubject(List([]));

  get tokens(): Observable<List<TokenAmount>> {
    return this._tokens.asObservable();
  }

  private userAddress: string;

  private isTestingMode = false;

  constructor(
    private readonly tokensApiService: TokensApiService,
    private readonly authService: AuthService,
    private readonly web3PublicService: Web3PublicService,
    private readonly useTestingMode: UseTestingModeService
  ) {
    this.tokensApiService.getTokensList().subscribe(
      tokens => {
        if (!this.isTestingMode) {
          this.setDefaultTokenAmounts(this.setCustomRanks(tokens));
          this.recalculateUsersBalance();
        }
      },
      err => console.error('Error retrieving tokens', err)
    );

    this.authService.getCurrentUser().subscribe(user => {
      this.userAddress = user?.address;
      this.recalculateUsersBalance();
    });

    useTestingMode.isTestingMode.subscribe(isTestingMode => {
      if (isTestingMode) {
        this.isTestingMode = true;
        this._tokens.next(List(coingeckoTestTokens));
        this.recalculateUsersBalance();
      }
    });
  }

  public setTokens(tokens: List<TokenAmount>): void {
    this._tokens.next(tokens);
  }

  private setCustomRanks(tokens: List<Token>): List<Token> {
    return tokens.map(token => {
      if (token.blockchain === BLOCKCHAIN_NAME.ETHEREUM) {
        if (token.address === RBC_ADDRESS) {
          return {
            ...token,
            rank: 1
          };
        }
        if (token.address === NATIVE_TOKEN_ADDRESS) {
          return {
            ...token,
            rank: 0.99
          };
        }
      } else if (token.blockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN) {
        if (token.address === BRBC_ADDRESS) {
          return {
            ...token,
            rank: 1
          };
        }
        if (token.address === NATIVE_TOKEN_ADDRESS) {
          return {
            ...token,
            rank: 0.99
          };
        }
      }
      return token;
    });
  }

  private setDefaultTokenAmounts(tokens: List<Token> = this._tokens.getValue()): void {
    this._tokens.next(
      tokens.map(token => ({
        ...token,
        amount: new BigNumber(NaN)
      }))
    );
  }

  public async recalculateUsersBalance(
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
      BLOCKCHAIN_NAME.POLYGON
    ];
    const promises = [];

    const splitAndMergeRequests = (
      tokensAddresses: string[],
      blockchain: BLOCKCHAIN_NAME,
      parallelRequestsNumber: number
    ) => {
      const chunkSize = Math.ceil(tokensAddresses.length / parallelRequestsNumber);
      return Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        [...new Array(parallelRequestsNumber)].map((elem, index) =>
          this.web3PublicService[blockchain].getTokensBalances(
            this.userAddress,
            tokensAddresses.slice(index * chunkSize, (index + 1) * chunkSize)
          )
        )
      );
    };

    blockchains.forEach(blockchain => {
      promises.push(
        splitAndMergeRequests(
          tokens
            .filter(token => token.blockchain === blockchain)
            .map(token => token.address)
            .toArray(),
          blockchain,
          30
        )
      );
    });

    const getRelativeBalance = (token: Token, weiBalance: BigNumber): BigNumber =>
      weiBalance.div(10 ** token.decimals);

    const balances = (await Promise.all(promises)).map(elem => elem.flat());
    const tokensWithBalance: TokenAmount[][] = [];
    blockchains.forEach((blockchain, blockchainIndex) =>
      tokensWithBalance.push(
        tokens
          .filter(token => token.blockchain === blockchain)
          .map((token, tokenIndex) => ({
            ...token,
            amount: getRelativeBalance(token, balances[blockchainIndex][tokenIndex]) || undefined
          }))
          .toArray()
      )
    );

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
}
