import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { EMPTY, from, Observable, of, throwError } from 'rxjs';
import { EthLikeWeb3Public } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';

import { catchError, map, switchMap, timeout } from 'rxjs/operators';
import { UseTestingModeService } from '@core/services/use-testing-mode/use-testing-mode.service';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { UndefinedError } from '@core/errors/models/undefined.error';
import { List } from 'immutable';
import { BridgeApiService } from '@core/services/backend/bridge-api/bridge-api.service';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { BridgeTokenPair } from '@features/bridge/models/bridge-token-pair';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { TransactionReceipt } from 'web3-eth';
import { EthLikeWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-private/eth-like-web3-private.service';
import CustomError from '@core/errors/models/custom-error';
import { HttpService } from '@core/services/http/http.service';
import { BRIDGE_PROVIDER } from '@shared/models/bridge/bridge-provider';
import { BridgeTrade } from '@features/bridge/models/bridge-trade';
import { BlockchainsBridgeProvider } from '@features/bridge/services/bridge-service/blockchains-bridge-provider/common/blockchains-bridge-provider';
import { inject } from '@angular/core';
import {
  rubicBridgeContractAddressesNetMode,
  rubicTokenAddressesNetMode
} from '@features/bridge/services/bridge-service/blockchains-bridge-provider/common/rubic-bridge/constants/addresses-net-mode';
import rubicBridgeContractAbi from '@features/bridge/services/bridge-service/blockchains-bridge-provider/common/rubic-bridge/constants/rubic-bridge-contract-abi';
import {
  RubicBridgeConfig,
  RubicBridgeSupportedBlockchains
} from '@features/bridge/services/bridge-service/blockchains-bridge-provider/common/rubic-bridge/models/types';
import {
  FromBackendBlockchain,
  TO_BACKEND_BLOCKCHAINS
} from '@shared/constants/blockchain/backend-blockchains';

interface RubicConfig {
  maxAmount: number;
  swapContractAddress: string;
  rubicTokenAddress: string;
  name: string;
  symbol: string;
  decimals: number;
}

interface RubicApiResponse {
  min_amount: string;
  token_address: string;
  swap_address: string;
  fee: string;
  network: FromBackendBlockchain;
}

interface RubicTrade {
  token: {
    address: string;
    decimals: number;
    symbol: string;
  };
  amount: BigNumber;
  swapContractAddress: string;
}

export abstract class CommonRubicBridgeProvider extends BlockchainsBridgeProvider {
  private readonly apiUrl = 'https://bridge-api.rubic.exchange/api/v1/';

  private readonly contractAbi = rubicBridgeContractAbi;

  // Injected services
  private readonly httpService = inject(HttpService);

  private readonly web3PrivateService = inject(EthLikeWeb3PrivateService);

  private readonly publicBlockchainAdapterService = inject(PublicBlockchainAdapterService);

  private readonly bridgeApiService = inject(BridgeApiService);

  private readonly useTestingMode = inject(UseTestingModeService);

  private readonly walletConnectorService = inject(WalletConnectorService);

  private rubicConfig: Partial<
    Record<
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN | BLOCKCHAIN_NAME.ETHEREUM | BLOCKCHAIN_NAME.POLYGON,
      RubicConfig
    >
  >;

  private readonly contracts: Record<RubicBridgeSupportedBlockchains, number> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: 2,
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 1,
    [BLOCKCHAIN_NAME.POLYGON]: 3
  };

  protected constructor(private readonly defaultConfig: RubicBridgeConfig) {
    super();
    this.setRubicConfig(defaultConfig, 'mainnet');
    this.loadRubicTokenInfo();
    this.initTestingMode();
  }

  private initTestingMode(): void {
    this.useTestingMode.isTestingMode.subscribe(isTestingMode => {
      if (isTestingMode) {
        this.setRubicConfig(this.defaultConfig, 'testnet');
        this.loadRubicTokenInfo();
      }
    });
  }

  private async loadRubicTokenInfo(): Promise<void> {
    this.httpService
      .get('networks/', {}, this.apiUrl)
      .pipe(
        timeout(3000),
        catchError((e: unknown) => {
          console.error(e);
          this._tokenPairs$.next(List([]));
          return EMPTY;
        })
      )
      .subscribe((response: RubicApiResponse[]) => {
        if (!response) {
          this._tokenPairs$.next(List([]));
          return;
        }
        const bridgeTokenPair = this.getTokenPairs(response);

        this._tokenPairs$.next(List([bridgeTokenPair]));
      });
  }

  private getTokenPairs(response: RubicApiResponse[]): BridgeTokenPair {
    const firstContractData = response.find(
      data =>
        data.network.toLowerCase() ===
        TO_BACKEND_BLOCKCHAINS[this.defaultConfig.from.blockchainName]
    );
    const secondContractData = response.find(
      data =>
        data.network.toLowerCase() === TO_BACKEND_BLOCKCHAINS[this.defaultConfig.to.blockchainName]
    );

    const fromBlockchain = this.defaultConfig.from.blockchainName;
    const toBlockchain = this.defaultConfig.to.blockchainName;

    const fromConfig = this.rubicConfig[fromBlockchain];
    const toConfig = this.rubicConfig[toBlockchain];

    return {
      symbol: 'RBC',
      image: '',
      rank: 0,

      tokenByBlockchain: {
        [fromBlockchain]: {
          blockchain: fromBlockchain,
          address: fromConfig.rubicTokenAddress,
          name: fromConfig.name,
          symbol: fromConfig.symbol,
          decimals: fromConfig.decimals,
          minAmount: parseFloat(firstContractData.min_amount),
          maxAmount: fromConfig.maxAmount
        },
        [toBlockchain]: {
          blockchain: toBlockchain,
          address: toConfig.rubicTokenAddress,
          name: toConfig.name,
          symbol: toConfig.symbol,
          decimals: toConfig.decimals,
          minAmount: parseFloat(secondContractData.min_amount),
          maxAmount: toConfig.maxAmount
        }
      },
      fromEthFee: parseFloat(firstContractData.fee),
      toEthFee: parseFloat(secondContractData.fee)
    };
  }

  public getProviderType(): BRIDGE_PROVIDER {
    return BRIDGE_PROVIDER.SWAP_RBC;
  }

  public getFee(tokenPair: BridgeTokenPair, toBlockchain: BLOCKCHAIN_NAME): Observable<number> {
    if (toBlockchain === this.defaultConfig.from.blockchainName) {
      return of(tokenPair.fromEthFee);
    }
    return of(tokenPair.toEthFee);
  }

  public createTrade(bridgeTrade: BridgeTrade): Observable<TransactionReceipt> {
    return new Observable(subscriber => {
      this.createRubicTrade(bridgeTrade)
        .then(receipt => {
          this.bridgeApiService.notifyBridgeBot(
            bridgeTrade,
            receipt.transactionHash,
            this.walletConnectorService.address
          );
          subscriber.next(receipt);
        })
        .catch(err => {
          subscriber.error(err);
        })
        .finally(() => {
          subscriber.complete();
        });
    });
  }

  public needApprove(bridgeTrade: BridgeTrade): Observable<boolean> {
    const { token } = bridgeTrade;
    if (BlockchainsInfo.getBlockchainType(bridgeTrade.fromBlockchain) !== 'ethLike') {
      throw new CustomError('Wrong blockchain error');
    }
    const blockchainAdapter = this.publicBlockchainAdapterService[
      bridgeTrade.fromBlockchain
    ] as EthLikeWeb3Public;
    const tokenFrom = token.tokenByBlockchain[bridgeTrade.fromBlockchain];

    return from(
      blockchainAdapter.getAllowance({
        tokenAddress:
          this.rubicConfig[bridgeTrade.fromBlockchain as RubicBridgeSupportedBlockchains]
            .rubicTokenAddress,
        ownerAddress: this.walletConnectorService.address,
        spenderAddress:
          this.rubicConfig[bridgeTrade.fromBlockchain as RubicBridgeSupportedBlockchains]
            .swapContractAddress
      })
    ).pipe(
      map(allowance => bridgeTrade.amount.multipliedBy(10 ** tokenFrom.decimals).gt(allowance))
    );
  }

  public approve(bridgeTrade: BridgeTrade): Observable<TransactionReceipt> {
    const { token } = bridgeTrade;
    const tokenFrom = token.tokenByBlockchain[bridgeTrade.fromBlockchain];
    const spenderAddress =
      this.rubicConfig[bridgeTrade.fromBlockchain as RubicBridgeSupportedBlockchains]
        .swapContractAddress;

    return this.needApprove(bridgeTrade).pipe(
      switchMap(needApprove => {
        if (!needApprove) {
          console.error('You should check bridge trade allowance before approve');
          return throwError(new UndefinedError());
        }
        return from(
          this.web3PrivateService.approveTokens(tokenFrom.address, spenderAddress, 'infinity', {
            onTransactionHash: bridgeTrade.onTransactionHash
          })
        );
      })
    );
  }

  private async createRubicTrade(bridgeTrade: BridgeTrade): Promise<TransactionReceipt> {
    const { token } = bridgeTrade;
    const blockchainAdapter = this.publicBlockchainAdapterService[bridgeTrade.fromBlockchain];

    const fromDecimals = token.tokenByBlockchain[bridgeTrade.fromBlockchain].decimals;

    const tradeConfig =
      this.rubicConfig[bridgeTrade.fromBlockchain as RubicBridgeSupportedBlockchains];
    const trade: RubicTrade = {
      token: {
        address: tradeConfig.rubicTokenAddress,
        decimals: tradeConfig.decimals,
        symbol: tradeConfig.symbol
      },
      swapContractAddress: tradeConfig.swapContractAddress,
      amount: bridgeTrade.amount.multipliedBy(10 ** fromDecimals)
    };

    const onApprove = bridgeTrade.onTransactionHash;

    if (BlockchainsInfo.getBlockchainType(bridgeTrade.fromBlockchain) !== 'ethLike') {
      throw new CustomError('Wrong blockchain error');
    }
    await this.provideAllowance(trade, blockchainAdapter as EthLikeWeb3Public, onApprove);

    const blockchain = this.contracts[bridgeTrade.toBlockchain as RubicBridgeSupportedBlockchains];

    const onTradeTransactionHash = async (hash: string) => {
      if (bridgeTrade.onTransactionHash) {
        bridgeTrade.onTransactionHash(hash);
      }
      await this.bridgeApiService.postRubicTransaction(
        bridgeTrade.fromBlockchain,
        hash,
        trade.amount.toFixed(),
        this.walletConnectorService.address
      );
    };

    return this.web3PrivateService.executeContractMethod(
      trade.swapContractAddress,
      this.contractAbi,
      'transferToOtherBlockchain',
      [blockchain, trade.amount.toFixed(0), bridgeTrade.toAddress],
      {
        onTransactionHash: onTradeTransactionHash
      }
    );
  }

  private async provideAllowance(
    trade: RubicTrade,
    web3Public: EthLikeWeb3Public,
    onApprove: (hash: string) => void
  ): Promise<void> {
    const allowance = await web3Public.getAllowance({
      tokenAddress: trade.token.address,
      ownerAddress: this.walletConnectorService.address,
      spenderAddress: trade.swapContractAddress
    });
    if (trade.amount.gt(allowance)) {
      const uintInfinity = new BigNumber(2).pow(256).minus(1);
      await this.web3PrivateService.approveTokens(
        trade.token.address,
        trade.swapContractAddress,
        uintInfinity,
        {
          onTransactionHash: onApprove
        }
      );
    }
  }

  private setRubicConfig(config: RubicBridgeConfig, type: 'testnet' | 'mainnet'): void {
    this.rubicConfig = {
      [config.from.blockchainName]: {
        maxAmount: config.from.maxAmount,
        swapContractAddress: rubicBridgeContractAddressesNetMode[type][config.from.blockchainName],
        rubicTokenAddress: rubicTokenAddressesNetMode[type][config.from.blockchainName],
        ...config.from.token
      },
      [config.to.blockchainName]: {
        maxAmount: config.to.maxAmount,
        swapContractAddress: rubicBridgeContractAddressesNetMode[type][config.to.blockchainName],
        rubicTokenAddress: rubicTokenAddressesNetMode[type][config.to.blockchainName],
        ...config.to.token
      }
    };
  }
}
