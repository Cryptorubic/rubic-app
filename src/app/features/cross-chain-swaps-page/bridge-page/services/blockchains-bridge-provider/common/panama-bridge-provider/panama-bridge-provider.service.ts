import { Injectable } from '@angular/core';
import { List } from 'immutable';
import { HttpClient } from '@angular/common/http';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { from, Observable, of } from 'rxjs';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { BridgeApiService } from 'src/app/core/services/backend/bridge-api/bridge-api.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { OverQueryLimitError } from 'src/app/shared/models/errors/bridge/OverQueryLimitError';
import { RubicError } from 'src/app/shared/models/errors/RubicError';
import { BridgeToken } from 'src/app/features/cross-chain-swaps-page/bridge-page/models/BridgeToken';
import { BridgeTrade } from 'src/app/features/cross-chain-swaps-page/bridge-page/models/BridgeTrade';
import { TransactionReceipt } from 'web3-eth';
import { PanamaToken } from './models/PanamaToken';
import { ErrorsService } from '../../../../../../../core/services/errors/errors.service';
import { ProviderConnectorService } from '../../../../../../../core/services/blockchain/provider-connector/provider-connector.service';
import { RetrievingTokensError } from '../../../../../../../shared/models/errors/provider/RetrievingTokensError';

interface PanamaResponse {
  code: number;
  data: any;
}

@Injectable()
export class PanamaBridgeProviderService {
  private readonly apiUrl = 'https://api.binance.org/bridge/api/v2/';

  private readonly PANAMA_SUCCESS_CODE = 20000;

  constructor(
    private httpClient: HttpClient,
    private web3PrivateService: Web3PrivateService,
    private bridgeApiService: BridgeApiService,
    private readonly errorsService: ErrorsService,
    private readonly providerConnectorService: ProviderConnectorService
  ) {}

  public getTokensList(): Observable<List<PanamaToken>> {
    return this.httpClient.get(`${this.apiUrl}tokens`).pipe(
      map((response: PanamaResponse) => {
        if (response.code !== this.PANAMA_SUCCESS_CODE) {
          this.errorsService.throw(
            new RetrievingTokensError(`Error retrieving tokens, code ${response.code}`)
          );
          return List([]);
        }
        return List(
          response.data.tokens.filter(
            token => token.ethContractAddress || token.ethSymbol === 'ETH'
          )
        );
      })
    );
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

  public createTrade(
    bridgeTrade: BridgeTrade,
    updateTransactionsList: () => Promise<void>
  ): Observable<TransactionReceipt> {
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
        return from(
          this.sendDeposit(data.id, bridgeTrade, data.depositAddress, updateTransactionsList)
        );
      }),
      catchError(err => {
        return this.errorsService.$throw(
          err instanceof RubicError ? err : new RubicError(),
          `Error bridge post: ${err}`
        );
      })
    );
  }

  private async sendDeposit(
    binanceId: string,
    bridgeTrade: BridgeTrade,
    depositAddress: string,
    updateTransactionsList: () => Promise<void>
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
      await updateTransactionsList();
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
