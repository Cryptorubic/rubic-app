import { ProviderData } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/models/provider-data';
import { crossChainContractAddresses } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/constants/cross-chain-contract-addresses';
import { SupportedCrossChainBlockchain } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/supported-cross-chain-blockchain';
import { transitTokens } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/constants/transit-tokens';
import { AbiItem } from 'web3-utils';
import { tuiPure } from '@taiga-ui/cdk';
import { crossChainContractAbiV2 } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/constants/contract-abi/cross-chain-contract-abi-v2';
import { crossChainContractAbiV3 } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/constants/contract-abi/cross-chain-contract-abi-v3';
import { EthLikeWeb3Public } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import { UniSwapV3QuoterController } from '@features/instant-trade/services/instant-trade-service/providers/common/uniswap-v3/utils/quoter-controller/uni-swap-v3-quoter-controller';
import { UniswapV3InstantTrade } from '@features/instant-trade/services/instant-trade-service/providers/common/uniswap-v3/models/uniswap-v3-instant-trade';
import { AlgebraQuoterController } from '@features/instant-trade/services/instant-trade-service/providers/polygon/algebra-service/utils/quoter-controller/algebra-quoter-controller';
import { AlgebraService } from '@features/instant-trade/services/instant-trade-service/providers/polygon/algebra-service/algebra.service';
import InstantTrade from '@features/instant-trade/models/instant-trade';
import InstantTradeToken from '@features/instant-trade/models/instant-trade-token';
import { ItProvider } from '@features/instant-trade/services/instant-trade-service/models/it-provider';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { SolanaWeb3Public } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-public';
import { CommonUniswapV3AlgebraService } from '@features/instant-trade/services/instant-trade-service/providers/common/uniswap-v3-algebra/common-service/common-uniswap-v3-algebra.service';
import { CommonUniswapV3Service } from '@features/instant-trade/services/instant-trade-service/providers/common/uniswap-v3/common-uniswap-v3.service';
import { crossChainContractAbiInch } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/constants/contract-abi/cross-chain-contract-abi-inch';
import { OneinchProviderAbstract } from '@features/instant-trade/services/instant-trade-service/providers/common/oneinch/abstract-provider/oneinch-provider.abstract';
import { compareAddresses } from '@shared/utils/utils';
import { BlockchainNumber } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/models/blockchain-number';
import BigNumber from 'bignumber.js';

enum TO_OTHER_BLOCKCHAIN_SWAP_METHOD {
  SWAP_TOKENS = 'swapTokensToOtherBlockchain',
  SWAP_CRYPTO = 'swapCryptoToOtherBlockchain'
}

enum TO_USER_SWAP_METHOD {
  SWAP_TOKENS = 'swapTokensToUserWithFee',
  SWAP_CRYPTO = 'swapCryptoToUserWithFee'
}

export abstract class ContractData {
  @tuiPure
  public get address(): string {
    return crossChainContractAddresses[this.blockchain];
  }

  @tuiPure
  public get transitToken(): InstantTradeToken {
    return transitTokens[this.blockchain];
  }

  protected constructor(
    public readonly blockchain: SupportedCrossChainBlockchain,
    public readonly providersData: ProviderData[],
    public readonly numOfBlockchain: BlockchainNumber
  ) {}

  public abstract minTokenAmount(): Promise<string>;

  public abstract maxTokenAmount(): Promise<string>;

  public abstract feeAmountOfBlockchain(numOfFromBlockchain: number): Promise<string>;

  public abstract blockchainCryptoFee(toBlockchainInContract: number): Promise<BigNumber>;

  public abstract isPaused(): Promise<boolean>;

  public getProvider(providerIndex: number): ItProvider {
    return this.providersData[providerIndex].provider;
  }

  /**
   * Returns true, if provider is of `uniswap v3` or `algebra` type.
   */
  protected isProviderV3OrAlgebra(providerIndex: number): boolean {
    return this.getProvider(providerIndex) instanceof CommonUniswapV3AlgebraService;
  }

  /**
   * Returns true, if provider is of `uniswap v3` type.
   */
  public isProviderUniV3(providerIndex: number): boolean {
    return this.getProvider(providerIndex) instanceof CommonUniswapV3Service;
  }

  /**
   * Returns true, if provider is of `1inch` type.
   */
  protected isProviderOneinch(providerIndex: number): boolean {
    return this.getProvider(providerIndex) instanceof OneinchProviderAbstract;
  }

  /**
   * Returns method's name and contract abi to call in source network.
   */
  public getMethodNameAndContractAbi(
    providerIndex: number,
    isFromTokenNative: boolean
  ): {
    methodName: string;
    contractAbi: AbiItem[];
  } {
    let methodName: string = isFromTokenNative
      ? TO_OTHER_BLOCKCHAIN_SWAP_METHOD.SWAP_CRYPTO
      : TO_OTHER_BLOCKCHAIN_SWAP_METHOD.SWAP_TOKENS;
    let contractAbiMethod = {
      ...crossChainContractAbiV2.find(method => method.name === methodName)
    };

    if (this.isProviderV3OrAlgebra(providerIndex)) {
      contractAbiMethod = {
        ...crossChainContractAbiV3.find(method => method.name.startsWith(methodName))
      };
    }

    if (this.isProviderOneinch(providerIndex)) {
      contractAbiMethod = {
        ...crossChainContractAbiInch.find(method => method.name.startsWith(methodName))
      };
    }

    methodName = methodName + this.providersData[providerIndex].methodSuffix;
    contractAbiMethod.name = methodName;

    return {
      methodName,
      contractAbi: [contractAbiMethod]
    };
  }

  /**
   * Returns `first path` method argument, converted from instant-trade data and chosen provider.
   * Must be called on source contract.
   */
  public getFirstPath(providerIndex: number, instantTrade: InstantTrade): string | string[] {
    if (!instantTrade) {
      return [this.transitToken.address];
    }

    if (this.isProviderOneinch(providerIndex)) {
      return instantTrade.path[0].address;
    }

    const provider = this.getProvider(providerIndex);

    if (provider instanceof CommonUniswapV3Service) {
      const route = (instantTrade as UniswapV3InstantTrade).route;

      return UniSwapV3QuoterController.getEncodedPoolsPath(
        route.poolsPath,
        route.initialTokenAddress
      );
    }

    if (provider instanceof AlgebraService) {
      return AlgebraQuoterController.getEncodedPath(instantTrade.path);
    }

    return instantTrade.path.map(token => token.address);
  }

  /**
   * Returns `second path` method argument, converted from instant-trade data and chosen provider.
   * Must be called on target contract.
   */
  public getSecondPath(
    instantTrade: InstantTrade,
    providerIndex?: number,
    fromBlockchain?: BLOCKCHAIN_NAME
  ): string[] {
    const toBlockchainAdapter =
      this.blockchain === BLOCKCHAIN_NAME.SOLANA ? SolanaWeb3Public : EthLikeWeb3Public;
    if (!instantTrade) {
      return fromBlockchain === BLOCKCHAIN_NAME.SOLANA
        ? [this.transitToken.address]
        : [toBlockchainAdapter.addressToBytes32(this.transitToken.address)];
    }

    const provider = this.getProvider(providerIndex);

    if (provider instanceof CommonUniswapV3Service) {
      const route = (instantTrade as UniswapV3InstantTrade).route;
      const path =
        fromBlockchain === BLOCKCHAIN_NAME.SOLANA
          ? [route.initialTokenAddress]
          : [EthLikeWeb3Public.addressToBytes32(route.initialTokenAddress)];

      let lastTokenAddress = route.initialTokenAddress;

      route.poolsPath.forEach(pool => {
        const newToken = compareAddresses(pool.token0.address, lastTokenAddress)
          ? pool.token1
          : pool.token0;
        lastTokenAddress = newToken.address;

        path.push(
          fromBlockchain === BLOCKCHAIN_NAME.SOLANA
            ? lastTokenAddress
            : '0x' +
                pool.fee.toString(16).padStart(6, '0').padEnd(24, '0') +
                lastTokenAddress.slice(2).toLowerCase()
        );
      });

      return path;
    }

    return fromBlockchain === BLOCKCHAIN_NAME.SOLANA
      ? instantTrade.path.map(token => token.address)
      : instantTrade.path.map(token => toBlockchainAdapter.addressToBytes32(token.address));
  }

  /**
   * Returns `signature` method argument, that is `swapToUserWithFee` function name.
   * Must be called on target contract.
   */
  public getSwapToUserMethodName(providerIndex: number, isToTokenNative: boolean): string {
    let methodName: string = isToTokenNative
      ? TO_USER_SWAP_METHOD.SWAP_CRYPTO
      : TO_USER_SWAP_METHOD.SWAP_TOKENS;

    methodName = methodName + this.providersData[providerIndex].methodSuffix;

    return methodName;
  }
}
