import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { List } from 'immutable';
import { FROM_BACKEND_BLOCKCHAINS } from 'src/app/shared/constants/blockchain/BACKEND_BLOCKCHAINS';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import BigNumber from 'bignumber.js';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { IToken } from 'src/app/shared/models/tokens/IToken';
import { coingeckoTestTokens } from 'src/test/tokens/coingecko-tokens';
import { HttpService } from '../../http/http.service';
import { UseTestingModeService } from '../../use-testing-mode/use-testing-mode.service';
import { BackendToken } from './models/BackendToken';
import { ProviderConnectorService } from '../../blockchain/provider-connector/provider-connector.service';

const RBC_ADDRESS = '0xa4eed63db85311e22df4473f87ccfc3dadcfa3e3';

const BRBC_ADDRESS = '0x8e3bcc334657560253b83f08331d85267316e08a';

@Injectable({
  providedIn: 'root'
})
export class TokensService {
  private readonly getTokensUrl = 'tokens/';

  private readonly _tokens: BehaviorSubject<List<TokenAmount>> = new BehaviorSubject(List([]));

  get tokens(): Observable<List<TokenAmount>> {
    return this._tokens.asObservable();
  }

  private userAddress: string;

  private isTestingMode = false;

  constructor(
    private httpService: HttpService,
    private web3PublicService: Web3PublicService,
    useTestingModule: UseTestingModeService,
    private readonly providerConnectorService: ProviderConnectorService
  ) {
    this.getTokensList();

    this.providerConnectorService.$addressChange.subscribe(address => {
      this.userAddress = address;
      this.recalculateUsersBalance();
    });

    /* this.authService.getCurrentUser().subscribe(user => {
      this.userAddress = user?.address;
      this.recalculateUsersBalance();
    }); */

    useTestingModule.isTestingMode.subscribe(isTestingMode => {
      if (isTestingMode) {
        this.isTestingMode = true;
        this._tokens.next(List(coingeckoTestTokens));
        this.recalculateUsersBalance();
      }
    });
  }

  private static prepareTokens(tokens: BackendToken[]): List<TokenAmount> {
    return List(
      tokens
        .map((token: BackendToken) => ({
          ...token,
          blockchain: FROM_BACKEND_BLOCKCHAINS[token.blockchain_network],
          price: token.usd_price,
          usedInIframe: token.used_in_iframe,
          amount: new BigNumber(0)
        }))
        .filter(token => token.address && token.blockchain)
    );
  }

  private getTokensList(): void {
    this.httpService.get(this.getTokensUrl).subscribe(
      (tokens: BackendToken[]) => {
        if (!this.isTestingMode) {
          let parsedTokens = TokensService.prepareTokens(tokens);
          parsedTokens = this.setCustomRanks(parsedTokens);
          this._tokens.next(parsedTokens);

          this.recalculateUsersBalance(List(parsedTokens));
        }
      },
      err => console.error('Error retrieving tokens', err)
    );
  }

  private setCustomRanks(tokens: List<TokenAmount>): List<TokenAmount> {
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

  private async recalculateUsersBalance(
    tokens: List<TokenAmount> = this._tokens.getValue()
  ): Promise<void> {
    if (this.userAddress && tokens.size) {
      const blockchains: BLOCKCHAIN_NAME[] = [
        BLOCKCHAIN_NAME.ETHEREUM,
        BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
        BLOCKCHAIN_NAME.POLYGON
      ];
      const promises = [];

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

      const getRelativeBalance = (token: IToken, weiBalance: BigNumber): BigNumber =>
        weiBalance.div(10 ** token.decimals);

      const balances = await Promise.all(promises);
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
  }
}
