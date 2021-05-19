import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { List } from 'immutable';
import { coingeckoTestTokens } from 'src/test/tokens/coingecko-tokens';
import { FROM_BACKEND_BLOCKCHAINS } from 'src/app/shared/constants/blockchain/BACKEND_BLOCKCHAINS';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { HttpService } from '../../http/http.service';
import { UseTestingModeService } from '../../use-testing-mode/use-testing-mode.service';
import { BackendToken } from './models/BackendToken';

const RBC_ADDRESS = '0xa4eed63db85311e22df4473f87ccfc3dadcfa3e3';

const BRBC_ADDRESS = '0x8e3bcc334657560253b83f08331d85267316e08a';

@Injectable({
  providedIn: 'root'
})
export class TokensService {
  private readonly getTokensUrl = 'tokens/';

  public readonly tokens: BehaviorSubject<List<SwapToken>> = new BehaviorSubject(List([]));

  private userAddress: string;

  constructor(
    private httpService: HttpService,
    private authService: AuthService,
    private web3PublicService: Web3PublicService,
    useTestingModule: UseTestingModeService
  ) {
    this.getTokensList();

    this.authService.getCurrentUser().subscribe(user => {
      this.userAddress = user?.address;
      this.recalculateUsersBalance();
    });

    useTestingModule.isTestingMode.subscribe(isTestingMode => {
      if (isTestingMode) {
        this.tokens.next(List(coingeckoTestTokens));
      }
    });
  }

  private static prepareTokens(tokens: BackendToken[]): SwapToken[] {
    return tokens.map((token: BackendToken) => ({
      ...token,
      blockchain: FROM_BACKEND_BLOCKCHAINS[token.blockchain_network],
      price: token.usd_price
    }));
  }

  private getTokensList(): void {
    this.httpService.get(this.getTokensUrl).subscribe(
      (tokens: BackendToken[]) => {
        let parsedTokens = TokensService.prepareTokens(tokens);
        parsedTokens = this.setCustomRanks(parsedTokens);
        this.tokens.next(List(parsedTokens));
        this.recalculateUsersBalance();
      },
      err => console.error('Error retrieving tokens', err)
    );
  }

  private setCustomRanks(tokens: SwapToken[]): SwapToken[] {
    return tokens.map(token => {
      if (token.blockchain === BLOCKCHAIN_NAME.ETHEREUM) {
        if (token.address === RBC_ADDRESS) {
          return {
            ...token,
            customRank: 1
          };
        }
        if (token.address === NATIVE_TOKEN_ADDRESS) {
          return {
            ...token,
            customRank: 0.99
          };
        }
      } else if (token.blockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN) {
        if (token.address === BRBC_ADDRESS) {
          return {
            ...token,
            customRank: 1
          };
        }
        if (token.address === NATIVE_TOKEN_ADDRESS) {
          return {
            ...token,
            customRank: 0.99
          };
        }
      }
      return {
        ...token,
        customRank: 0
      };
    });
  }

  private recalculateUsersBalance(): void {
    if (this.userAddress && this.tokens.getValue().size) {
      const tokens = this.tokens.getValue();
      const updatedTokens = [];
      const blockchains: BLOCKCHAIN_NAME[] = [...tokens.map(token => token.blockchain).toSet()];
      const balancePromises = [];

      blockchains.forEach(blockchain => {
        let filteredTokens = tokens.filter(token => token.blockchain === blockchain);
        const web3Public: Web3Public = this.web3PublicService[blockchain];

        const nativeToken = filteredTokens.find(token => web3Public.isNativeAddress(token.address));
        if (nativeToken) {
          balancePromises.push(
            web3Public.getBalance(this.userAddress).then(balance => {
              updatedTokens.push({
                ...nativeToken,
                usersBalance: balance.toNumber()
              });
            })
          );
          filteredTokens = filteredTokens.filter(
            token => !web3Public.isNativeAddress(token.address)
          );
        }

        balancePromises.push(
          new Promise(resolve => {
            const batch = web3Public.batchRequest;
            filteredTokens.forEach((token, index) => {
              batch.add(
                web3Public
                  .getTokenBalanceFunction(this.userAddress, token.address)
                  .request({}, (error, data) => {
                    if (error) {
                      console.debug(error, token);
                    } else {
                      const balance = Web3PublicService.tokenWeiToAmount(token, data);
                      updatedTokens.push({
                        ...token,
                        usersBalance: balance.toNumber()
                      });

                      if (index === filteredTokens.size - 1) resolve();
                    }
                  })
              );
            });
            batch.execute();
          })
        );
      });
      Promise.all(balancePromises).then(() => {
        this.tokens.next(List(updatedTokens));
      });
    }
  }
}
