import { ContractData } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/contract-data';
import { SupportedCrossChainBlockchain } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/supported-cross-chain-blockchain';
import { ProviderData } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/models/provider-data';
import { EthLikeWeb3Public } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { crossChainContractAbi } from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/eth-like/cross-chain-contract-abi';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';
import { CrossChainTrade } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade';
import { ContractExecutorFacadeService } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/contract-executor-facade.service';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { SolanaWeb3Public } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-public';
import { OneinchInstantTrade } from '@features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-oneinch/models/oneinch-instant-trade';
import { BlockchainNumber } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/models/blockchain-number';
import BigNumber from 'bignumber.js';
import { EMPTY_ADDRESS } from '@shared/constants/blockchain/empty-address';

export class EthLikeContractData extends ContractData {
  private readonly blockchainAdapter: EthLikeWeb3Public;

  constructor(
    public readonly blockchain: SupportedCrossChainBlockchain,
    public readonly providersData: ProviderData[],
    public readonly numOfBlockchain: BlockchainNumber,
    publicBlockchainAdapterService: PublicBlockchainAdapterService
  ) {
    super(blockchain, providersData, numOfBlockchain);

    BlockchainsInfo.checkIsEthLike(blockchain);
    this.blockchainAdapter = publicBlockchainAdapterService[blockchain] as EthLikeWeb3Public;
  }

  public minTokenAmount(): Promise<string> {
    return this.blockchainAdapter.callContractMethod<string>(
      this.address,
      crossChainContractAbi,
      'minTokenAmount'
    );
  }

  public maxTokenAmount(): Promise<string> {
    return this.blockchainAdapter.callContractMethod<string>(
      this.address,
      crossChainContractAbi,
      'maxTokenAmount'
    );
  }

  public feeAmountOfBlockchain(numOfFromBlockchain: number): Promise<string> {
    return this.blockchainAdapter.callContractMethod(
      this.address,
      crossChainContractAbi,
      'feeAmountOfBlockchain',
      {
        methodArguments: [numOfFromBlockchain]
      }
    );
  }

  public async blockchainCryptoFee(toBlockchainInContract: number): Promise<BigNumber> {
    const fee = await this.blockchainAdapter.callContractMethod(
      this.address,
      crossChainContractAbi,
      'blockchainCryptoFee',
      {
        methodArguments: [toBlockchainInContract]
      }
    );

    return Web3Pure.fromWei(fee);
  }

  public isPaused(): Promise<boolean> {
    return this.blockchainAdapter.callContractMethod<boolean>(
      this.address,
      crossChainContractAbi,
      'paused'
    );
  }

  public async maxGasPrice(): Promise<string> {
    return this.blockchainAdapter.callContractMethod(
      this.address,
      crossChainContractAbi,
      'maxGasPrice'
    );
  }

  /**
   * Returns method's arguments to use in source network.
   */
  public getMethodArguments(
    trade: CrossChainTrade,
    isToTokenNative: boolean,
    toContract: ContractData,
    toWalletAddress: string
  ): unknown[] {
    const toNumOfBlockchain = toContract.numOfBlockchain;

    const tokenInAmountAbsolute = Web3Pure.toWei(trade.tokenInAmount, trade.tokenIn.decimals);

    const firstPath = this.getFirstPath(trade.fromProviderIndex, trade.fromTrade);

    const secondPath = toContract.getSecondPath(
      trade.toTrade,
      trade.toProviderIndex,
      trade.fromBlockchain
    );

    const fromTransitTokenAmountMin =
      ContractExecutorFacadeService.calculateFromTransitTokenAmountMin(trade);
    const fromTransitTokenAmountMinAbsolute = Web3Pure.toWei(
      fromTransitTokenAmountMin,
      this.transitToken.decimals
    );

    const tokenOutAmountMin = ContractExecutorFacadeService.calculateTokenOutAmountMin(trade);
    const tokenOutAmountMinAbsolute = Web3Pure.toWei(tokenOutAmountMin, trade.tokenOut.decimals);

    let toWalletAddressBytes32: string;
    const { toBlockchain } = trade;
    if (toBlockchain === BLOCKCHAIN_NAME.NEAR) {
      toWalletAddressBytes32 = EthLikeWeb3Public.addressToBytes32(
        '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
      );
    } else if (toBlockchain === BLOCKCHAIN_NAME.SOLANA) {
      toWalletAddressBytes32 = SolanaWeb3Public.addressToBytes32(toWalletAddress);
    } else {
      toWalletAddressBytes32 = EthLikeWeb3Public.addressToBytes32(toWalletAddress);
    }

    const provider = EMPTY_ADDRESS;

    const swapToUserMethodSignature = toContract.getSwapToUserMethodName(
      trade.toProviderIndex,
      isToTokenNative
    );

    const methodArguments = [
      [
        toNumOfBlockchain,
        tokenInAmountAbsolute,
        firstPath,
        secondPath,
        fromTransitTokenAmountMinAbsolute,
        tokenOutAmountMinAbsolute,
        toWalletAddressBytes32,
        provider,
        isToTokenNative
      ]
    ];

    this.modifyArgumentsForProvider(trade, methodArguments);

    methodArguments[0].push(swapToUserMethodSignature);

    return methodArguments;
  }

  private modifyArgumentsForProvider(trade: CrossChainTrade, methodArguments: unknown[][]): void {
    const exactTokensForTokens = true;
    const swapTokenWithFee = false;

    if (this.isProviderOneinch(trade.fromProviderIndex)) {
      const data = (trade.fromTrade as OneinchInstantTrade).data;
      methodArguments[0].push(data);
    } else {
      methodArguments[0].push(exactTokensForTokens);

      if (!this.isProviderV3OrAlgebra(trade.fromProviderIndex)) {
        methodArguments[0].push(swapTokenWithFee);
      }
    }
  }
}
