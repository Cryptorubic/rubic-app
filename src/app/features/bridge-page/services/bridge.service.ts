import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of, throwError } from 'rxjs';
import { List } from 'immutable';
import { HttpClient } from '@angular/common/http';
import BigNumber from 'bignumber.js';
import { catchError, flatMap, map } from 'rxjs/operators';
import { Web3PrivateService } from '../../../core/services/blockchain/web3-private-service/web3-private.service';
import { BridgeTransaction } from './BridgeTransaction';
import { NetworkError } from '../../../shared/models/errors/provider/NetworkError';
import { RubicError } from '../../../shared/models/errors/RubicError';
import { OverQueryLimitError } from '../../../shared/models/errors/bridge/OverQueryLimitError';
import { BridgeApiService } from '../../../core/services/backend/bridge-api/bridge-api.service';
import { MetamaskError } from '../../../shared/models/errors/provider/MetamaskError';
import { AccountError } from '../../../shared/models/errors/provider/AccountError';
import { BridgeToken } from '../models/BridgeToken';
import { BridgeTableTransaction } from '../models/BridgeTableTransaction';
import { TokensService } from '../../../core/services/backend/tokens-service/tokens.service';
import SwapToken from '../../../shared/models/tokens/SwapToken';
import { BLOCKCHAIN_NAME } from '../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { RubicBridgeService } from './rubic-bridge-service/rubic-bridge.service';
import { UseTestingModeService } from '../../../core/services/use-testing-mode/use-testing-mode.service';
import { bridgeTestTokens } from '../../../../test/tokens/bridge-tokens';
import { TranslateService } from '@ngx-translate/core';

interface BinanceResponse {
  code: number;
  data: any;
}

@Injectable()
export class BridgeService {
  static RubicMaxAmount = 50000;

  private apiUrl = 'https://api.binance.org/bridge/api/v2/';

  private gasPriceUrl = 'https://swap.rubic.exchange/api/v1/gas/';

  private rubicApiUrl = 'https://swap.rubic.exchange/api/v1/dex/Rubic/';

  private _tokens: BehaviorSubject<List<BridgeToken>> = new BehaviorSubject(List([]));

  private _transactions: BehaviorSubject<List<BridgeTableTransaction>> = new BehaviorSubject(
    List([])
  );

  public walletAddress: Observable<string>;

  public readonly tokens: Observable<List<BridgeToken>> = this._tokens.asObservable();

  public readonly transactions: Observable<
    List<BridgeTableTransaction>
  > = this._transactions.asObservable();

  constructor(
    private tokensService: TokensService,
    private httpClient: HttpClient,
    private web3Private: Web3PrivateService,
    private backendApiService: BridgeApiService,
    private rubicBridgeService: RubicBridgeService,
    private useTestingMode: UseTestingModeService,
    private readonly translateService: TranslateService
  ) {
    this.getTokensList();
    this.updateTransactionsList();
    this.walletAddress = web3Private.onAddressChanges;

    this.walletAddress.subscribe(() => {
      this.updateTransactionsList();
    });

    useTestingMode.isTestingMode.subscribe(value => {
      if (value) {
        this._tokens.next(bridgeTestTokens);
      }
    });
  }

  private async getTokensList(): Promise<void> {
    const binanceResponse: BinanceResponse = (await this.httpClient
      .get(`${this.apiUrl}tokens`)
      .toPromise()) as BinanceResponse;

    if (binanceResponse.code !== 20000) {
      console.log(`Error retrieving tokens, code ${binanceResponse.code}`);
      this._tokens.next(List([]));
      return;
    }
    const rubicToken: BridgeToken = await this.loadRubicTokenInfo();
    this.tokensService.tokens.subscribe(tokens => {
      const tokensWithImg = this.getTokensWithImages(
        List([rubicToken].concat(binanceResponse.data.tokens)),
        tokens
      );
      this._tokens.next(tokensWithImg);
    });
  }

  private loadRubicTokenInfo(): Promise<BridgeToken> {
    return this.httpClient
      .get(this.rubicApiUrl)
      .pipe(
        map((response: any) => ({
          name: 'Rubic',
          symbol: 'RBC',
          ethSymbol: response.tokens[0].symbol,
          bscSymbol: response.tokens[1].symbol,
          icon: '',
          minAmount: response.min_swap_amount,
          maxAmount: BridgeService.RubicMaxAmount,
          bscContractAddress: response.tokens[1].token_address,
          bscContractDecimal: response.tokens[1].decimals,
          ethContractAddress: response.tokens[0].token_address,
          ethContractDecimal: response.tokens[0].decimals,
          ethToBscFee: response.tokens[1].fee,
          bscToEthFee: response.tokens[0].fee
        }))
      )
      .toPromise();
  }

  private getTokensWithImages(
    tokens: List<BridgeToken>,
    swapTokens: List<SwapToken>
  ): List<BridgeToken> {
    return tokens
      .filter(token => token.ethContractAddress || token.symbol === 'ETH')
      .map(token => {
        const tokenInfo = swapTokens
          .filter(item => item.blockchain === BLOCKCHAIN_NAME.ETHEREUM)
          .find(item =>
            token.ethContractAddress
              ? item.address.toLowerCase() === token.ethContractAddress.toLowerCase()
              : item.symbol === 'ETH'
          );
        token.icon = (tokenInfo && tokenInfo.image) || '/assets/images/icons/coins/empty.svg';
        return token;
      });
  }

  public getFee(tokenSymbol: string, networkName: BLOCKCHAIN_NAME): Observable<number> {
    const token = this._tokens.getValue().find(item => item.symbol === tokenSymbol);
    if (token?.ethToBscFee && token?.bscToEthFee) {
      if (networkName === BLOCKCHAIN_NAME.ETHEREUM) {
        return of(token.bscToEthFee);
      }
      return of(token.ethToBscFee);
    }
    return this.httpClient.get(`${this.apiUrl}tokens/${tokenSymbol}/networks`).pipe(
      // eslint-disable-next-line consistent-return
      map((res: BinanceResponse) => {
        if (res.code !== 20000) {
          console.log(`Error retrieving fee, code ${res.code}`);
        } else {
          return res.data.networks.find(network => network.name === networkName).networkFee;
        }
      }),
      catchError(err => {
        console.log('Error retrieving fee', err);
        return throwError(err);
      })
    );
  }

  public checkIfEthereumGasPriceIsHigh(): Observable<boolean> {
    return this.httpClient
      .get(`${this.gasPriceUrl}Ethereum`)
      .pipe(map((res: { status: string }) => res.status === 'HIGH'));
  }

  public createTrade(
    token: BridgeToken,
    fromNetwork: BLOCKCHAIN_NAME,
    toNetwork: string,
    amount: BigNumber,
    toAddress: string,
    onTransactionHash?: (hash: string) => void
  ): Observable<string> {
    if (!this.web3Private.isProviderActive) {
      return throwError(new MetamaskError(this.translateService));
    }

    if (!this.web3Private.address) {
      return throwError(new AccountError(this.translateService));
    }

    if (
      this.web3Private.network?.name !== fromNetwork &&
      (this.web3Private.network?.name !== `${fromNetwork}_TESTNET` ||
        !this.useTestingMode.isTestingMode.getValue())
    ) {
      return throwError(new NetworkError(fromNetwork, this.translateService));
    }

    if (token.symbol === 'RBC') {
      const onTxHash = async hash => {
        if (onTransactionHash) {
          onTransactionHash(hash);
        }
        await this.backendApiService.postRubicTransaction(
          fromNetwork,
          hash,
          amount.toFixed(2),
          this.web3Private.address
        );
        await this.updateTransactionsList();
      };

      return new Observable(subscriber => {
        this.rubicBridgeService
          .createTrade(token, fromNetwork, amount, toAddress, onTransactionHash, onTxHash)
          .then(async txHash => {
            const tx: BridgeTransaction = {
              binanceId: txHash,
              amount,
              network: fromNetwork,
              token: {
                symbol: token.symbol,
                ethSymbol: token.ethSymbol
              } as BridgeToken
            } as BridgeTransaction;

            this.updateTransactionsList();
            this.backendApiService.notifyBridgeBot(tx, this.web3Private.address);
            subscriber.next(txHash);
          })
          .catch(err => {
            subscriber.error(err);
          });
      });
    }

    // eslint-disable-next-line prettier/prettier
    return this.createTradeWithBinanceApi(
      token,
      fromNetwork,
      toNetwork,
      amount,
      toAddress,
      onTransactionHash
    );
  }

  private createTradeWithBinanceApi(
    token: BridgeToken,
    fromNetwork: BLOCKCHAIN_NAME,
    toNetwork: string,
    amount: BigNumber,
    toAddress: string,
    onTransactionHash?: (hash: string) => void
  ): Observable<string> {
    const body = {
      amount: amount.toFixed(),
      fromNetwork,
      source: 921,
      symbol: token.symbol,
      toAddress,
      toAddressLabel: '',
      toNetwork,
      walletAddress: this.web3Private.address,
      walletNetwork: toNetwork
    };

    return this.httpClient.post(`${this.apiUrl}swaps/`, body).pipe(
      flatMap((res: BinanceResponse) => {
        if (res.code !== 20000) {
          console.log(`Bridge POST error, code ${res.code}`);
          return throwError(new OverQueryLimitError(this.translateService));
        }
        const { data } = res;
        const tx = new BridgeTransaction(
          data.id,
          fromNetwork,
          token,
          data.status,
          data.depositAddress,
          amount,
          data.toAddress,
          this.web3Private
        );
        return from(this.sendDeposit(tx, onTransactionHash));
      }),
      catchError(err => {
        console.error(`Error bridge post ${err}`);
        return throwError(err instanceof RubicError ? err : new RubicError(this.translateService));
      })
    );
  }

  private async sendDeposit(
    tx: BridgeTransaction,
    onTransactionHash?: (hash: string) => void
  ): Promise<string> {
    const onTxHash = async (hash: string): Promise<void> => {
      if (onTransactionHash && typeof onTransactionHash === 'function') {
        onTransactionHash(hash);
      }

      await this.sendTransactionInfo(tx);
      await this.updateTransactionsList();
      this.backendApiService.notifyBridgeBot(tx, this.web3Private.address);
    };
    try {
      await tx.sendDeposit(onTxHash);
    } catch(err) {
      throw new RubicError(this.translateService, `The ${tx.network} network is not supported`);
    }

    return tx.binanceId;
  }

  public async updateTransactionsList(): Promise<void> {
    if (this.web3Private.address) {
      const txArray = await this.backendApiService.getTransactions(
        this.web3Private.address.toLowerCase()
      );
      this._transactions.next(List(txArray));
    }
  }

  private async sendTransactionInfo(tx: BridgeTransaction): Promise<void> {
    return this.backendApiService.postTransaction(
      tx.binanceId,
      tx.token.ethSymbol,
      tx.token.bscSymbol
    );
  }
}
