import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { from, Observable, of, Subject } from 'rxjs';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { BridgeApiService } from 'src/app/core/services/backend/bridge-api/bridge-api.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { OverQueryLimitError } from 'src/app/shared/models/errors/bridge/OverQueryLimitError';
import { RubicError } from 'src/app/shared/models/errors/RubicError';
import { TransactionReceipt } from 'web3-eth';
import { ErrorsOldService } from 'src/app/core/services/errors-old/errors-old.service';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { RetrievingTokensError } from 'src/app/shared/models/errors/provider/RetrievingTokensError';
import { BridgeToken } from 'src/app/features/bridge/models/BridgeToken';
import { BridgeTrade } from 'src/app/features/bridge/models/BridgeTrade';
import { List } from 'immutable';
import { BRIDGE_PROVIDER } from 'src/app/shared/models/bridge/BRIDGE_PROVIDER';
import { PanamaToken } from './models/PanamaToken';

interface PanamaResponse {
  code: number;
  data: {
    tokens: PanamaToken[];
    networks: {
      name: BLOCKCHAIN_NAME;
      networkFee: number;
    }[];
    id: string;
    depositAddress: string;
  };
}

@Injectable()
export class PanamaBridgeProviderService {
  private readonly apiUrl = 'https://api.binance.org/bridge/api/v2/';

  private readonly PANAMA_SUCCESS_CODE = 20000;

  private tokens$ = new Subject<List<PanamaToken>>();

  public get tokens(): Observable<List<PanamaToken>> {
    return this.tokens$.asObservable();
  }

  constructor(
    private readonly httpClient: HttpClient,
    private readonly web3PrivateService: Web3PrivateService,
    private readonly bridgeApiService: BridgeApiService,
    private readonly errorsService: ErrorsOldService,
    private readonly providerConnectorService: ProviderConnectorService
  ) {
    this.setTokensList();
  }

  private setTokensList(): void {
    this.httpClient
      .get(`${this.apiUrl}tokens`)
      .pipe(
        map((response: PanamaResponse) => {
          if (response.code !== this.PANAMA_SUCCESS_CODE) {
            console.debug('Error retrieving panama tokens', response);
            return List([]);
          }
          return List(
            response.data.tokens.filter(
              token => token.ethContractAddress || token.ethSymbol === 'ETH'
            )
          );
        })
      )
      .subscribe(tokens => this.tokens$.next(tokens));
  }

  public getProviderType(): BRIDGE_PROVIDER {
    return BRIDGE_PROVIDER.PANAMA;
  }

  public getFee(token: BridgeToken, toBlockchain: BLOCKCHAIN_NAME): Observable<number> {
    if (token.toEthFee && token.fromEthFee) {
      if (toBlockchain === BLOCKCHAIN_NAME.ETHEREUM) {
        return of(token.toEthFee);
      }
      return of(token.fromEthFee);
    }
    return this.httpClient.get(`${this.apiUrl}tokens/${token.symbol}/networks`).pipe(
      map((res: PanamaResponse) => {
        if (res.code !== this.PANAMA_SUCCESS_CODE) {
          this.errorsService.throw(
            new RetrievingTokensError(`Error retrieving tokens, code ${res.code}`)
          );
        }
        return res.data.networks.find(network => network.name === toBlockchain).networkFee;
      }),
      catchError(err => {
        return this.errorsService.$throw(err);
      })
    );
  }

  public createTrade(bridgeTrade: BridgeTrade): Observable<TransactionReceipt> {
    const body = {
      amount: bridgeTrade.amount.toFixed(),
      fromNetwork: bridgeTrade.fromBlockchain,
      source: 921,
      symbol: bridgeTrade.token.symbol,
      toAddress: bridgeTrade.toAddress,
      toAddressLabel: '',
      toNetwork: bridgeTrade.toBlockchain,
      walletAddress: this.providerConnectorService.address,
      walletNetwork: bridgeTrade.fromBlockchain
    };

    return this.httpClient.post(`${this.apiUrl}swaps`, body).pipe(
      mergeMap((res: PanamaResponse) => {
        if (res.code !== this.PANAMA_SUCCESS_CODE) {
          console.error(`Bridge POST error, code ${res.code}`);
          return this.errorsService.$throw(new OverQueryLimitError());
        }
        const { data } = res;
        return from(this.sendDeposit(data.id, bridgeTrade, data.depositAddress));
      }),
      catchError(err => {
        return this.errorsService.$throw(
          err instanceof RubicError ? err : new RubicError(),
          `Error bridge post: ${err}`
        );
      })
    );
  }

  public needApprove(): Observable<boolean> {
    return of(false);
  }

  public approve(): Observable<TransactionReceipt> {
    return null;
  }

  private async sendDeposit(
    binanceId: string,
    bridgeTrade: BridgeTrade,
    depositAddress: string
  ): Promise<TransactionReceipt> {
    const { token } = bridgeTrade;
    const tokenAddress = token.blockchainToken[bridgeTrade.fromBlockchain].address;
    const { decimals } = token.blockchainToken[bridgeTrade.fromBlockchain];

    const amountInWei = bridgeTrade.amount.multipliedBy(10 ** decimals);

    const onTradeTransactionHash = async (hash: string) => {
      if (bridgeTrade.onTransactionHash) {
        bridgeTrade.onTransactionHash(hash);
      }
      await this.bridgeApiService.postPanamaTransaction(
        binanceId,
        token.blockchainToken[bridgeTrade.fromBlockchain].symbol,
        token.blockchainToken[bridgeTrade.toBlockchain].symbol
      );
    };

    let receipt;

    if (bridgeTrade.fromBlockchain === BLOCKCHAIN_NAME.ETHEREUM && token.symbol === 'ETH') {
      receipt = await this.web3PrivateService.sendTransaction(
        depositAddress,
        amountInWei.toFixed(),
        {
          onTransactionHash: onTradeTransactionHash,
          inWei: true
        }
      );
    } else {
      const estimatedGas = '120000'; // TODO: хотфикс сломавшегося в метамаске рассчета газа. Estimated gas не подойдет, т.к. в BSC не работает rpc
      receipt = await this.web3PrivateService.transferTokens(
        tokenAddress,
        depositAddress,
        amountInWei.toFixed(),
        {
          onTransactionHash: onTradeTransactionHash,
          gas: estimatedGas
        }
      );
    }
    this.bridgeApiService.notifyBridgeBot(
      bridgeTrade,
      binanceId,
      this.providerConnectorService.address
    );
    return receipt;
  }
}
