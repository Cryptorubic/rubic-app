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

export class EthLikeContractData extends ContractData {
  private readonly blockchainAdapter: EthLikeWeb3Public;

  constructor(
    public readonly blockchain: SupportedCrossChainBlockchain,
    public readonly providersData: ProviderData[],
    public readonly numOfBlockchain: number,
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

  public feeAmountOfBlockchain(): Promise<string> {
    return this.blockchainAdapter.callContractMethod(
      this.address,
      crossChainContractAbi,
      'feeAmountOfBlockchain',
      {
        methodArguments: [this.numOfBlockchain]
      }
    );
  }

  public async blockchainCryptoFee(toBlockchainInContract: number): Promise<number> {
    const fee = await this.blockchainAdapter.callContractMethod(
      this.address,
      crossChainContractAbi,
      'blockchainCryptoFee',
      {
        methodArguments: [toBlockchainInContract]
      }
    );

    return Web3Pure.fromWei(fee).toNumber();
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

    const secondPath = toContract.getSecondPath(trade.toProviderIndex, trade.toTrade);

    const fromTransitTokenAmountMin =
      ContractExecutorFacadeService.calculateFromTransitTokenAmountMin(trade);
    const fromTransitTokenAmountMinAbsolute = Web3Pure.toWei(
      fromTransitTokenAmountMin,
      this.transitToken.decimals
    );

    const tokenOutAmountMin = ContractExecutorFacadeService.calculateTokenOutAmountMin(trade);
    const tokenOutAmountMinAbsolute = Web3Pure.toWei(tokenOutAmountMin, trade.tokenOut.decimals);

    const toWalletAddressBytes32 =
      trade.toBlockchain !== BLOCKCHAIN_NAME.SOLANA
        ? EthLikeWeb3Public.addressToBytes32(toWalletAddress)
        : SolanaWeb3Public.addressToBytes32(toWalletAddress);

    const swapToUserMethodSignature = toContract.getSwapToUserMethodSignature(
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
        isToTokenNative,
        true
      ]
    ];
    if (!this.isProviderV3(trade.fromProviderIndex)) {
      methodArguments[0].push(false);
    }
    methodArguments[0].push(swapToUserMethodSignature);

    return methodArguments;
  }
}
