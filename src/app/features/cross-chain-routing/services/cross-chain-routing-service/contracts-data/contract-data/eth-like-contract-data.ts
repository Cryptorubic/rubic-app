import { CrossChainContractData } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/cross-chain-contract-data';
import { SupportedCrossChainBlockchain } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/supported-cross-chain-blockchain';
import { ProviderData } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/models/provider-data';
import { EthLikeWeb3Public } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { crossChainContractAbi } from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/eth-like/cross-chain-contract-abi';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';

export class EthLikeCrossChainContractData extends CrossChainContractData {
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

  public async getMaxGasPrice(): Promise<string> {
    return this.blockchainAdapter.callContractMethod(
      this.address,
      crossChainContractAbi,
      'maxGasPrice'
    );
  }
}
