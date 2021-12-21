import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import {
  MinimalProvider,
  ProviderData
} from '@features/cross-chain-routing/services/cross-chain-routing-service/models/provider-data';
import { CROSS_CHAIN_SWAP_METHOD } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-data/models/CROSS_CHAIN_SWAP_METHOD';
import { crossChainContractAddresses } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-data/constants/cross-chain-contract-addresses';
import { SupportedCrossChainBlockchain } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/supported-cross-chain-blockchain';
import InstantTradeToken from '@features/instant-trade/models/InstantTradeToken';
import { transitTokens } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-data/constants/transit-tokens';
import { AbiItem } from 'web3-utils';
import { tuiPure } from '@taiga-ui/cdk';
import { crossChainContractAbiV2 } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-data/constants/contract-abi/cross-chain-contract-abi-v2';
import { crossChainContractAbiV3 } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-data/constants/contract-abi/cross-chain-contract-abi-v3';
import { CommonUniV3AlgebraService } from '@features/instant-trade/services/instant-trade-service/providers/common/uni-v3-algebra/common-service/common-uni-v3-algebra.service';
import { EthLikeWeb3Public } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import { CrossChainContractExecutorFacadeService } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/cross-chain-contract-executor-facade.service';
import { EMPTY_ADDRESS } from '@shared/constants/blockchain/EMPTY_ADDRESS';
import { CrossChainTrade } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade';
import { ContractParams } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/contract-params';
import BigNumber from 'bignumber.js';

export class CrossChainContractData {
  @tuiPure
  public get address(): string {
    return crossChainContractAddresses[this.blockchain];
  }

  @tuiPure
  public get transitToken(): InstantTradeToken {
    return transitTokens[this.blockchain];
  }

  constructor(
    public readonly blockchain: SupportedCrossChainBlockchain,
    public readonly providersData: ProviderData[],
    public readonly numOfBlockchain: number
  ) {}

  public getProvider(providerIndex: number): MinimalProvider {
    return this.providersData[providerIndex].provider;
  }

  private isV3(providerIndex: number): boolean {
    return this.getProvider(providerIndex) instanceof CommonUniV3AlgebraService;
  }

  public getContractParams(
    trade: CrossChainTrade,
    isFromTokenNative: boolean,
    isToTokenNative: boolean,
    toNumOfBlockchain: number,
    walletAddress: string
  ): ContractParams {
    const { methodName, contractAbi } = this.getMethodNameAndContractAbi(
      trade.fromProviderIndex,
      isFromTokenNative
    );

    let methodArguments;
    let value;
    if (this.isV3(trade.fromProviderIndex)) {
      // TODO
    } else {
      ({ methodArguments, value } = this.getV2MethodArgumentsAndValue(
        trade,
        isFromTokenNative,
        isToTokenNative,
        toNumOfBlockchain,
        walletAddress
      ));
    }

    return {
      contractAddress: this.address,
      contractAbi,
      methodName,
      methodArguments,
      value
    };
  }

  private getMethodNameAndContractAbi(
    providerIndex: number,
    isFromTokenNative: boolean
  ): {
    methodName: string;
    contractAbi: AbiItem[];
  } {
    let methodName: string = isFromTokenNative
      ? CROSS_CHAIN_SWAP_METHOD.SWAP_CRYPTO
      : CROSS_CHAIN_SWAP_METHOD.SWAP_TOKENS;
    let contractAbiMethod = {
      ...crossChainContractAbiV2.find(method => method.name === methodName)
    };

    if (this.isV3(providerIndex)) {
      methodName += 'V3';
      contractAbiMethod = { ...crossChainContractAbiV3.find(method => method.name === methodName) };
    }

    if (this.blockchain === BLOCKCHAIN_NAME.AVALANCHE) {
      methodName += 'AVAX';
    }

    methodName = methodName + this.providersData[providerIndex].methodSuffix;
    contractAbiMethod.name = methodName;

    return {
      methodName,
      contractAbi: [contractAbiMethod]
    };
  }

  // TODO
  // private getV3MethodArguments() {}

  private getV2MethodArgumentsAndValue(
    trade: CrossChainTrade,
    isFromTokenNative: boolean,
    isToTokenNative: boolean,
    toNumOfBlockchain: number,
    walletAddress: string
  ): {
    methodArguments: unknown[];
    value: string;
  } {
    const { toBlockchain } = trade;

    const tokenInAmountAbsolute = EthLikeWeb3Public.toWei(
      trade.tokenInAmount,
      trade.tokenIn.decimals
    );
    const tokenOutAmountMin =
      CrossChainContractExecutorFacadeService.calculateTokenOutAmountMin(trade);
    const tokenOutAmountMinAbsolute = EthLikeWeb3Public.toWei(
      tokenOutAmountMin,
      trade.tokenOut.decimals
    );

    const firstTransitTokenAmountMin =
      CrossChainContractExecutorFacadeService.calculateFirstTransitTokenAmountMin(trade);
    const firstTransitTokenAmountMinAbsolute = EthLikeWeb3Public.toWei(
      firstTransitTokenAmountMin,
      this.transitToken.decimals
    );

    const methodArguments = [
      [
        toNumOfBlockchain,
        tokenInAmountAbsolute,
        trade.firstPath,
        // @TODO Solana. Remove hardcode.
        toBlockchain === BLOCKCHAIN_NAME.SOLANA ? [EMPTY_ADDRESS] : trade.secondPath,
        firstTransitTokenAmountMinAbsolute,
        tokenOutAmountMinAbsolute,
        // @TODO Solana. Remove hardcode.
        toBlockchain === BLOCKCHAIN_NAME.SOLANA ? EMPTY_ADDRESS : walletAddress,
        isToTokenNative,
        true,
        false
      ]
    ];

    const blockchainCryptoFee = EthLikeWeb3Public.toWei(trade.cryptoFee);
    const value = new BigNumber(blockchainCryptoFee)
      .plus(isFromTokenNative ? tokenInAmountAbsolute : 0)
      .toFixed(0);

    return {
      methodArguments,
      value
    };
  }
}
