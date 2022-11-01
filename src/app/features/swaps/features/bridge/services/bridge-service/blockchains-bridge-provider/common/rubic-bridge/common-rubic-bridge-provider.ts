import BigNumber from 'bignumber.js';
import {
  BLOCKCHAIN_NAME,
  BlockchainName,
  Web3Pure,
  Injector,
  EvmBlockchainName,
  CHAIN_TYPE
} from 'rubic-sdk';
import { EMPTY, forkJoin, from, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { UndefinedError } from '@core/errors/models/undefined.error';
import { List } from 'immutable';
import { BridgeApiService } from '@core/services/backend/bridge-api/bridge-api.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { BridgeTokenPair } from '@features/swaps/features/bridge/models/bridge-token-pair';
import { TransactionReceipt } from 'web3-eth';
import { RUBIC_BRIDGE_PROVIDER } from '@features/swaps/shared/models/trade-provider/bridge-provider';
import { BridgeTrade } from '@features/swaps/features/bridge/models/bridge-trade';
import { BlockchainsBridgeProvider } from '@features/swaps/features/bridge/services/bridge-service/blockchains-bridge-provider/common/blockchains-bridge-provider';
import { inject } from '@angular/core';
import rubicBridgeContractAbi from '@features/swaps/features/bridge/services/bridge-service/blockchains-bridge-provider/common/rubic-bridge/constants/rubic-bridge-contract-abi';
import {
  RubicBridgeConfig,
  RubicBridgeSupportedBlockchains
} from '@features/swaps/features/bridge/services/bridge-service/blockchains-bridge-provider/common/rubic-bridge/models/types';
import {
  RUBIC_BRIDGE_CONTRACT_ADDRESS,
  RUBIC_TOKEN_ADDRESS
} from '@features/swaps/features/bridge/services/bridge-service/blockchains-bridge-provider/common/rubic-bridge/constants/addresses';
import { BRIDGE_BLOCKCHAIN_NUM } from './constants/bridge-blockchain-num';

interface RubicConfig {
  maxAmount: number;
  swapContractAddress: string;
  rubicTokenAddress: string;
  name: string;
  symbol: string;
  decimals: number;
}

interface RubicTrade {
  fromBlockchain: BlockchainName;
  token: {
    address: string;
    decimals: number;
    symbol: string;
  };
  amount: BigNumber;
  swapContractAddress: string;
}

export abstract class CommonRubicBridgeProvider extends BlockchainsBridgeProvider {
  private readonly contractAbi = rubicBridgeContractAbi;

  // Injected services
  private readonly bridgeApiService = inject(BridgeApiService);

  private readonly walletConnectorService = inject(WalletConnectorService);

  private rubicConfig: Partial<Record<RubicBridgeSupportedBlockchains, RubicConfig>>;

  private readonly contracts: Record<RubicBridgeSupportedBlockchains, number> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: 2,
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 1,
    [BLOCKCHAIN_NAME.POLYGON]: 3
  };

  protected constructor(private readonly defaultConfig: RubicBridgeConfig) {
    super();
    this.setRubicConfig(defaultConfig);
    this.loadRubicTokenInfo();
  }

  private async loadRubicTokenInfo(): Promise<void> {
    forkJoin([
      this.getMinTokenAmount(this.defaultConfig.from.blockchainName),
      this.getMinTokenAmount(this.defaultConfig.to.blockchainName)
    ])
      .pipe(
        catchError((e: unknown) => {
          console.error(e);
          this._tokenPairs$.next(List([]));
          return EMPTY;
        })
      )
      .subscribe(([fromMinTokenAmount, toMinTokenAmount]) => {
        if (!fromMinTokenAmount || !toMinTokenAmount) {
          this._tokenPairs$.next(List([]));
          return;
        }

        const bridgeTokenPair = this.getTokenPairs(fromMinTokenAmount, toMinTokenAmount);

        this._tokenPairs$.next(List([bridgeTokenPair]));
      });
  }

  private async getMinTokenAmount(blockchain: RubicBridgeSupportedBlockchains): Promise<number> {
    const minSwapAmountInWei = await Injector.web3PublicService
      .getWeb3Public(blockchain)
      .callContractMethod(
        RUBIC_BRIDGE_CONTRACT_ADDRESS[blockchain],
        rubicBridgeContractAbi,
        'minTokenAmount'
      );

    return Web3Pure.fromWei(minSwapAmountInWei).toNumber();
  }

  private getTokenPairs(fromMinTokenAmount: number, toMinTokenAmount: number): BridgeTokenPair {
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
          minAmount: fromMinTokenAmount,
          maxAmount: fromConfig.maxAmount
        },
        [toBlockchain]: {
          blockchain: toBlockchain,
          address: toConfig.rubicTokenAddress,
          name: toConfig.name,
          symbol: toConfig.symbol,
          decimals: toConfig.decimals,
          minAmount: toMinTokenAmount,
          maxAmount: toConfig.maxAmount
        }
      }
    };
  }

  public getProviderType(): RUBIC_BRIDGE_PROVIDER {
    return RUBIC_BRIDGE_PROVIDER.SWAP_RBC;
  }

  public getFee(
    fromBlockchain: RubicBridgeSupportedBlockchains,
    toBlockchain: RubicBridgeSupportedBlockchains
  ): Observable<number> {
    return from(
      Injector.web3PublicService
        .getWeb3Public(fromBlockchain)
        .callContractMethod(
          RUBIC_BRIDGE_CONTRACT_ADDRESS[fromBlockchain],
          rubicBridgeContractAbi,
          'feeAmountOfBlockchain',
          [BRIDGE_BLOCKCHAIN_NUM[toBlockchain]]
        )
    ).pipe(map((fee: string) => Web3Pure.fromWei(fee).toNumber()));
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
    const tokenFrom = token.tokenByBlockchain[bridgeTrade.fromBlockchain];

    return from(
      Injector.web3PublicService
        .getWeb3Public(bridgeTrade.fromBlockchain as EvmBlockchainName)
        .getAllowance(
          this.rubicConfig[bridgeTrade.fromBlockchain as RubicBridgeSupportedBlockchains]
            .rubicTokenAddress,
          this.walletConnectorService.address,
          this.rubicConfig[bridgeTrade.fromBlockchain as RubicBridgeSupportedBlockchains]
            .swapContractAddress
        )
    ).pipe(
      map((allowance: BigNumber) =>
        bridgeTrade.amount.multipliedBy(10 ** tokenFrom.decimals).gt(allowance)
      )
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
        const request$: Promise<TransactionReceipt> = Injector.web3PrivateService
          .getWeb3Private(CHAIN_TYPE.EVM)
          .approveTokens(tokenFrom.address, spenderAddress, 'infinity', {
            onTransactionHash: bridgeTrade.onTransactionHash
          });
        return from(request$);
      })
    );
  }

  private async createRubicTrade(bridgeTrade: BridgeTrade): Promise<TransactionReceipt> {
    const { token } = bridgeTrade;
    const fromDecimals = token.tokenByBlockchain[bridgeTrade.fromBlockchain].decimals;

    const tradeConfig =
      this.rubicConfig[bridgeTrade.fromBlockchain as RubicBridgeSupportedBlockchains];
    const trade: RubicTrade = {
      fromBlockchain: bridgeTrade.fromBlockchain,
      token: {
        address: tradeConfig.rubicTokenAddress,
        decimals: tradeConfig.decimals,
        symbol: tradeConfig.symbol
      },
      swapContractAddress: tradeConfig.swapContractAddress,
      amount: bridgeTrade.amount.multipliedBy(10 ** fromDecimals)
    };

    await this.provideAllowance(trade, bridgeTrade.onTransactionHash);

    const blockchain = this.contracts[bridgeTrade.toBlockchain as RubicBridgeSupportedBlockchains];

    const onTradeTransactionHash = async (hash: string) => {
      if (bridgeTrade.onTransactionHash) {
        bridgeTrade.onTransactionHash(hash, bridgeTrade);
      }
      await this.bridgeApiService.postRubicTransaction(
        bridgeTrade.fromBlockchain,
        hash,
        trade.amount.toFixed(),
        this.walletConnectorService.address
      );
    };

    return Injector.web3PrivateService
      .getWeb3Private(CHAIN_TYPE.EVM)
      .executeContractMethod(
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
    onApprove: (hash: string) => void
  ): Promise<void> {
    const allowance = await Injector.web3PublicService
      .getWeb3Public(trade.fromBlockchain as EvmBlockchainName)
      .getAllowance(
        trade.token.address,
        this.walletConnectorService.address,
        trade.swapContractAddress
      );
    if (trade.amount.gt(allowance)) {
      const uintInfinity = new BigNumber(2).pow(256).minus(1);
      await Injector.web3PrivateService
        .getWeb3Private(CHAIN_TYPE.EVM)
        .approveTokens(trade.token.address, trade.swapContractAddress, uintInfinity, {
          onTransactionHash: onApprove
        });
    }
  }

  private setRubicConfig(config: RubicBridgeConfig): void {
    this.rubicConfig = {
      [config.from.blockchainName]: {
        maxAmount: config.from.maxAmount,
        swapContractAddress: RUBIC_BRIDGE_CONTRACT_ADDRESS[config.from.blockchainName],
        rubicTokenAddress: RUBIC_TOKEN_ADDRESS[config.from.blockchainName],
        ...config.from.token
      },
      [config.to.blockchainName]: {
        maxAmount: config.to.maxAmount,
        swapContractAddress: RUBIC_BRIDGE_CONTRACT_ADDRESS[config.to.blockchainName],
        rubicTokenAddress: RUBIC_TOKEN_ADDRESS[config.to.blockchainName],
        ...config.to.token
      }
    };
  }
}
