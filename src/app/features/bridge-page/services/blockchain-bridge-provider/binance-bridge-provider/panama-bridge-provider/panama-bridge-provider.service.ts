import { Injectable } from '@angular/core';
import { List } from 'immutable';
import { HttpClient } from '@angular/common/http';
import { from, Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { flatMap } from 'rxjs/internal/operators';
import { BlockchainBridgeProvider } from '../../blockchain-bridge-provider';
import { BlockchainsTokens, BridgeToken } from '../../../../models/BridgeToken';
import { NATIVE_TOKEN_ADDRESS } from '../../../../../../shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { BLOCKCHAIN_NAME } from '../../../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { Web3PrivateService } from '../../../../../../core/services/blockchain/web3-private-service/web3-private.service';
import { OverQueryLimitError } from '../../../../../../shared/models/errors/bridge/OverQueryLimitError';
import { RubicError } from '../../../../../../shared/models/errors/RubicError';
import { BridgeApiService } from '../../../../../../core/services/backend/bridge-api/bridge-api.service';
import { BridgeTrade } from '../../../../models/BridgeTrade';

interface PanamaResponse {
  code: number;
  data: any;
}

interface PanamaToken {
  name: string;
  symbol: string;
  ethSymbol: string;
  bscSymbol: string;
  icon: string;
  minAmount: number;
  maxAmount: number;
  bscContractAddress: string;
  bscContractDecimal: number;
  ethContractAddress: string;
  ethContractDecimal: number;
  ethToBscFee?: number;
  bscToEthFee?: number;
}

@Injectable()
export class PanamaBridgeProviderService extends BlockchainBridgeProvider {
  private readonly apiUrl = 'https://api.binance.org/bridge/api/v2/';

  private readonly PANAMA_SUCCESS_CODE = 20000;

  constructor(
    private httpClient: HttpClient,
    private web3PrivateService: Web3PrivateService,
    private bridgeApiService: BridgeApiService
  ) {
    super();
  }

  private static parsePanamaToken(token: PanamaToken): BridgeToken {
    return {
      symbol: token.symbol,
      image: '',

      blockchainToken: {
        [BLOCKCHAIN_NAME.ETHEREUM]: {
          address: token.ethContractAddress || (token.ethSymbol === 'ETH' && NATIVE_TOKEN_ADDRESS),
          name: token.name,
          symbol: token.ethSymbol,
          decimals: token.ethContractDecimal,

          minAmount: token.minAmount,
          maxAmount: token.maxAmount
        },
        [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
          address: token.bscContractAddress,
          name: token.name,
          symbol: token.bscSymbol,
          decimals: token.bscContractDecimal,

          minAmount: token.minAmount,
          maxAmount: token.maxAmount
        }
      } as BlockchainsTokens,

      fromEthFee: token.ethToBscFee,
      toEthFee: token.bscToEthFee
    };
  }

  public getTokensList(): Observable<List<BridgeToken>> {
    return this.httpClient.get(`${this.apiUrl}tokens`).pipe(
      map((response: PanamaResponse) => {
        if (response.code !== this.PANAMA_SUCCESS_CODE) {
          console.debug(`Error retrieving tokens, code ${response.code}`);
          return List([]);
        }
        return List(
          response.data.tokens
            .filter(token => token.ethContractAddress || token.ethSymbol === 'ETH')
            .map(token => PanamaBridgeProviderService.parsePanamaToken(token))
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
          return throwError(new Error(`Error retrieving tokens, code ${res.code}`));
        }
        return res.data.networks.find(network => network.name === toBlockchain).networkFee;
      }),
      catchError(err => {
        return throwError(err);
      })
    );
  }

  public createTrade(bridgeTrade: BridgeTrade): Observable<string> {
    const body = {
      amount: bridgeTrade.amount.toFixed(),
      fromBlockchain: bridgeTrade.fromBlockchain,
      source: 921,
      symbol: bridgeTrade.token.symbol,
      toAddress: bridgeTrade.toAddress,
      toAddressLabel: '',
      toBlockchain: bridgeTrade.toBlockchain,
      walletAddress: this.web3PrivateService.address,
      walletNetwork: bridgeTrade.toBlockchain
    };

    return this.httpClient.post(`${this.apiUrl}swaps/`, body).pipe(
      flatMap((res: PanamaResponse) => {
        if (res.code !== this.PANAMA_SUCCESS_CODE) {
          console.error(`Bridge POST error, code ${res.code}`);
          return throwError(new OverQueryLimitError());
        }
        const { data } = res;
        return from(this.sendDeposit(data.id, bridgeTrade, data.depositAddress));
      }),
      catchError(err => {
        console.error(`Error bridge post ${err}`);
        return throwError(err instanceof RubicError ? err : new RubicError());
      })
    );
  }

  private async sendDeposit(
    binanceId: string,
    bridgeTrade: BridgeTrade,
    depositAddress: string
  ): Promise<string> {
    const { token } = bridgeTrade;
    const tokenAddress = token.blockchainToken[bridgeTrade.fromBlockchain].address;
    const { decimals } = token.blockchainToken[bridgeTrade.fromBlockchain];

    const amountInWei = bridgeTrade.amount.multipliedBy(10 ** decimals);

    const onTradeTransactionHash = async (hash: string): Promise<void> => {
      if (bridgeTrade.onTransactionHash) {
        bridgeTrade.onTransactionHash(hash);
      }

      await this.bridgeApiService.postPanamaTransaction(
        binanceId,
        token.blockchainToken[BLOCKCHAIN_NAME.ETHEREUM].symbol,
        token.blockchainToken[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].symbol
      );
      this.bridgeApiService.notifyBridgeBot(
        bridgeTrade,
        binanceId,
        this.web3PrivateService.address
      );
    };

    if (bridgeTrade.fromBlockchain === BLOCKCHAIN_NAME.ETHEREUM && token.symbol === 'ETH') {
      await this.web3PrivateService.sendTransaction(depositAddress, amountInWei.toFixed(), {
        onTransactionHash: onTradeTransactionHash,
        inWei: true
      });
    } else {
      const estimatedGas = '120000'; // TODO: хотфикс сломавшегося в метамаске рассчета газа. Estimated gas не подойдет, т.к. в BSC не работает rpc
      await this.web3PrivateService.transferTokens(
        tokenAddress,
        depositAddress,
        amountInWei.toFixed(),
        {
          onTransactionHash: onTradeTransactionHash,
          gas: estimatedGas
        }
      );
    }

    this.bridgeApiService.notifyBridgeBot(bridgeTrade, binanceId, this.web3PrivateService.address);

    return binanceId;
  }
}
