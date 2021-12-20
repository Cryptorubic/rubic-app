import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import { EMPTY, from, Observable, of, throwError } from 'rxjs';
import { EthLikeWeb3Public } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';

import { catchError, map, switchMap, timeout } from 'rxjs/operators';
import { UseTestingModeService } from '@core/services/use-testing-mode/use-testing-mode.service';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { ErrorsService } from '@core/errors/errors.service';
import { UndefinedError } from '@core/errors/models/undefined.error';
import { List } from 'immutable';
import { BridgeApiService } from '@core/services/backend/bridge-api/bridge-api.service';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { BridgeTokenPair } from '@features/bridge/models/BridgeTokenPair';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { TransactionReceipt } from 'web3-eth';
import rubicBridgeContractAbi from '@features/bridge/services/bridge-service/blockchains-bridge-provider/common/rubic-bridge/constants/rubic-bridge-contract-abi';
import { EthLikeWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-private/eth-like-web3-private.service';
import CustomError from '@core/errors/models/custom-error';
import { HttpService } from '@core/services/http/http.service';
import { BRIDGE_PROVIDER } from '@shared/models/bridge/BRIDGE_PROVIDER';
import { WrongToken } from '@core/errors/models/provider/WrongToken';
import { BridgeTrade } from '@features/bridge/models/BridgeTrade';
import { BlockchainsBridgeProvider } from '@features/bridge/services/bridge-service/blockchains-bridge-provider/common/blockchains-bridge-provider';
import { inject } from '@angular/core';
import { RubicBridgeConfig } from '@features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-binance-bridge-provider/rubic-bridge-provider/ethereum-binance-rubic-bridge-provider.service';
import {
  rubicBridgeContractAddressesNetMode,
  rubicTokenAddressesNetMode
} from '@features/bridge/services/bridge-service/blockchains-bridge-provider/common/rubic-bridge/constants/addresses-net-mode';

type Blockchains = 'eth' | 'nonEth';

type BlockchainsRubicConfig = Record<Blockchains, RubicConfig>;

interface RubicConfig {
  maxAmount: number;
  swapContractAddress: string;
  rubicTokenAddress: string;
  name?: string;
  symbol?: string;
  decimals?: number;
}

type Networks = 'Ethereum' | 'Binance-Smart-Chain';

interface RubicApiResponse {
  min_amount: string;
  token_address: string;
  swap_address: string;
  fee: string;
  network: Networks;
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
  private static getBlockchainByName(fromBlockchain: BLOCKCHAIN_NAME): Blockchains {
    return fromBlockchain === BLOCKCHAIN_NAME.ETHEREUM ? 'eth' : 'nonEth';
  }

  private readonly apiUrl = 'https://bridge-api.rubic.exchange/api/v1/';

  private readonly contractAbi = rubicBridgeContractAbi;

  // Injected services
  private readonly httpService = inject(HttpService);

  private readonly web3PrivateService = inject(EthLikeWeb3PrivateService);

  private readonly publicBlockchainAdapterService = inject(PublicBlockchainAdapterService);

  private readonly bridgeApiService = inject(BridgeApiService);

  private readonly useTestingMode = inject(UseTestingModeService);

  private readonly walletConnectorService = inject(WalletConnectorService);

  private readonly errorService = inject(ErrorsService);

  private rubicConfig: BlockchainsRubicConfig;

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

        const ethContractData = response.find(data => data.network === 'Ethereum');
        const nonEthContractData = response.find(
          data => data.network === this.defaultConfig.apiBlockchainName
        );

        const bridgeTokenPair: BridgeTokenPair = {
          symbol: 'RBC',
          image: '',
          rank: 0,

          tokenByBlockchain: {
            [BLOCKCHAIN_NAME.ETHEREUM]: {
              blockchain: BLOCKCHAIN_NAME.ETHEREUM,
              address: this.rubicConfig.eth.rubicTokenAddress,
              name: 'Rubic',
              symbol: 'RBC',
              decimals: 18,
              minAmount: parseFloat(ethContractData.min_amount),
              maxAmount: this.rubicConfig.eth.maxAmount
            },
            [this.defaultConfig.blockchainName]: {
              blockchain: this.defaultConfig.blockchainName,
              address: this.rubicConfig.nonEth.rubicTokenAddress,
              name: this.rubicConfig.nonEth.name,
              symbol: this.rubicConfig.nonEth.symbol,
              decimals: this.rubicConfig.nonEth.decimals,
              minAmount: parseFloat(nonEthContractData.min_amount),
              maxAmount: this.rubicConfig.nonEth.maxAmount
            }
          },

          fromEthFee: parseFloat(nonEthContractData.fee),
          toEthFee: parseFloat(ethContractData.fee)
        };
        this._tokenPairs$.next(List([bridgeTokenPair]));
      });
  }

  public getProviderType(): BRIDGE_PROVIDER {
    return BRIDGE_PROVIDER.SWAP_RBC;
  }

  public getFee(tokenPair: BridgeTokenPair, toBlockchain: BLOCKCHAIN_NAME): Observable<number> {
    if (toBlockchain === BLOCKCHAIN_NAME.ETHEREUM) {
      return of(tokenPair.toEthFee);
    }
    return of(tokenPair.fromEthFee);
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

    if (token.symbol !== 'RBC') {
      return throwError(new WrongToken());
    }

    const blockchain = CommonRubicBridgeProvider.getBlockchainByName(bridgeTrade.fromBlockchain);

    return from(
      blockchainAdapter.getAllowance({
        tokenAddress: this.rubicConfig[blockchain].rubicTokenAddress,
        ownerAddress: this.walletConnectorService.address,
        spenderAddress: this.rubicConfig[blockchain].swapContractAddress
      })
    ).pipe(
      map(allowance => bridgeTrade.amount.multipliedBy(10 ** tokenFrom.decimals).gt(allowance))
    );
  }

  public approve(bridgeTrade: BridgeTrade): Observable<TransactionReceipt> {
    const { token } = bridgeTrade;
    const tokenFrom = token.tokenByBlockchain[bridgeTrade.fromBlockchain];
    const blockchain = CommonRubicBridgeProvider.getBlockchainByName(bridgeTrade.fromBlockchain);
    const spenderAddress = this.rubicConfig[blockchain].swapContractAddress;

    if (token.symbol !== 'RBC') {
      this.errorService.throw(new WrongToken());
    }

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
    const network = CommonRubicBridgeProvider.getBlockchainByName(bridgeTrade.fromBlockchain);

    if (token.symbol !== 'RBC') {
      throw new WrongToken();
    }

    const blockchainAdapter = this.publicBlockchainAdapterService[bridgeTrade.fromBlockchain];
    const trade: RubicTrade = {
      token: {
        address: this.rubicConfig[network].rubicTokenAddress,
        decimals: token.tokenByBlockchain[bridgeTrade.fromBlockchain].decimals
      }
    } as RubicTrade;

    trade.token.symbol =
      bridgeTrade.fromBlockchain === BLOCKCHAIN_NAME.ETHEREUM
        ? 'RBC'
        : this.rubicConfig.nonEth.symbol;

    trade.swapContractAddress = this.rubicConfig[network].swapContractAddress;

    trade.amount = bridgeTrade.amount.multipliedBy(10 ** trade.token.decimals);

    const onApprove = bridgeTrade.onTransactionHash;
    if (BlockchainsInfo.getBlockchainType(bridgeTrade.fromBlockchain) !== 'ethLike') {
      throw new CustomError('Wrong blockchain error');
    }
    await this.provideAllowance(trade, blockchainAdapter as EthLikeWeb3Public, onApprove);

    const blockchain = bridgeTrade.fromBlockchain === BLOCKCHAIN_NAME.ETHEREUM ? 1 : 2;

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
      eth: {
        maxAmount: config.maxAmountEth,
        swapContractAddress: rubicBridgeContractAddressesNetMode[type][BLOCKCHAIN_NAME.ETHEREUM],
        rubicTokenAddress: rubicTokenAddressesNetMode[type][BLOCKCHAIN_NAME.ETHEREUM]
      },
      nonEth: {
        maxAmount: config.maxAmountNonEth,
        swapContractAddress: rubicBridgeContractAddressesNetMode[type][config.blockchainName],
        rubicTokenAddress: rubicTokenAddressesNetMode[type][config.blockchainName],
        ...config.nonEthToken
      }
    };
  }
}
