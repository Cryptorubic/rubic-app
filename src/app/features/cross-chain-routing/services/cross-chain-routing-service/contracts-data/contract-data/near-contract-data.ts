import { ContractData } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/contract-data';
import { SupportedCrossChainBlockchain } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/supported-cross-chain-blockchain';
import { ProviderData } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/models/provider-data';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { NearWeb3Public } from '@core/services/blockchain/blockchain-adapters/near/near-web3-public';
import { Contract } from 'near-api-js';
import {
  NEAR_CCR_VIEW_METHODS,
  NearCcrViewMethods
} from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/near/near-ccr-view-methods';
import InstantTrade from '@features/instant-trade/models/instant-trade';
import { EthLikeWeb3Public } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import { EMPTY_ADDRESS } from '@shared/constants/blockchain/empty-address';
import BigNumber from 'bignumber.js';
import { BlockchainNumber } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/models/blockchain-number';

type NearCrossChainContract = Contract & NearCcrViewMethods;

export class NearContractData extends ContractData {
  private readonly blockchainAdapter: NearWeb3Public;

  private readonly _contract: NearCrossChainContract;

  public get contract(): NearCrossChainContract {
    return this._contract;
  }

  constructor(
    public readonly blockchain: SupportedCrossChainBlockchain,
    public readonly providersData: ProviderData[],
    public readonly numOfBlockchain: BlockchainNumber,
    public readonly publicBlockchainAdapterService: PublicBlockchainAdapterService
  ) {
    super(blockchain, providersData, numOfBlockchain);
    BlockchainsInfo.checkIsNear(blockchain);
    this.blockchainAdapter = publicBlockchainAdapterService[BLOCKCHAIN_NAME.NEAR];
    this._contract = this.loadContract();
  }

  public async minTokenAmount(): Promise<string> {
    return this._contract.get_min_token_amount();
  }

  public async maxTokenAmount(): Promise<string> {
    return this._contract.get_max_token_amount();
  }

  public async feeAmountOfBlockchain(): Promise<string> {
    return this._contract.get_fee_amount_of_blockchain();
  }

  public async blockchainCryptoFee(toBlockchainNumber: BlockchainNumber): Promise<BigNumber> {
    const fee = await this._contract.get_blockchain_crypto_fee({
      blockchain_id: toBlockchainNumber
    });
    return Web3Pure.fromWei(fee, 24);
  }

  public async isPaused(): Promise<boolean> {
    return this._contract.is_running().then(el => !el);
  }

  private loadContract(): NearCrossChainContract {
    const wallet = this.blockchainAdapter.walletConnection;
    const methodOptions = {
      viewMethods: NEAR_CCR_VIEW_METHODS as string[],
      changeMethods: ['']
    };
    return new Contract(wallet.account(), this.address, methodOptions) as NearCrossChainContract;
  }

  public getSecondPath(
    instantTrade: InstantTrade,
    _: number,
    fromBlockchain: BLOCKCHAIN_NAME
  ): string[] {
    const emptyAddress = EMPTY_ADDRESS;
    if (fromBlockchain === BLOCKCHAIN_NAME.SOLANA) {
      if (!instantTrade) {
        return [emptyAddress];
      }
      return [emptyAddress, emptyAddress];
    }
    if (!instantTrade) {
      return [EthLikeWeb3Public.addressToBytes32(emptyAddress)];
    }
    return [
      EthLikeWeb3Public.addressToBytes32(emptyAddress),
      EthLikeWeb3Public.addressToBytes32(emptyAddress)
    ];
  }
}
