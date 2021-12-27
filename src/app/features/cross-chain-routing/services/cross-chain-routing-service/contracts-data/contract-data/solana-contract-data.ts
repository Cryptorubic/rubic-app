import { ContractData } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/contract-data';
import { SupportedCrossChainBlockchain } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/supported-cross-chain-blockchain';
import { ProviderData } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/models/provider-data';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { SolanaWeb3Public } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-public';
import { PublicKey } from '@solana/web3.js';
import { PDA_CONFIG } from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/solana/solana-constants';
import {
  BlockchainLayout,
  BridgeConfig,
  BridgeConfigData,
  SolanaBlockchainConfig
} from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/solana/raydium-ccr-sctuct';
import { BLOCKCHAIN_UUID } from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/solana/solana-blockchain-accounts-addresses';
import { NATIVE_SOL } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/tokens';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';

export class SolanaContractData extends ContractData {
  private readonly blockchainAdapter: SolanaWeb3Public;

  constructor(
    public readonly blockchain: SupportedCrossChainBlockchain,
    public readonly providersData: ProviderData[],
    public readonly numOfBlockchain: number,
    publicBlockchainAdapterService: PublicBlockchainAdapterService
  ) {
    super(blockchain, providersData, numOfBlockchain);

    BlockchainsInfo.checkIsSolana(blockchain);
    this.blockchainAdapter = publicBlockchainAdapterService[blockchain] as SolanaWeb3Public;
  }

  public async minTokenAmount(): Promise<string> {
    const { data } = await this.blockchainAdapter.connection.getAccountInfo(
      new PublicKey(PDA_CONFIG)
    );
    const bridgeData = BridgeConfig.decode(data) as BridgeConfigData;
    return bridgeData.min_token_amount.toString();
  }

  public async maxTokenAmount(): Promise<string> {
    const { data } = await this.blockchainAdapter.connection.getAccountInfo(
      new PublicKey(PDA_CONFIG)
    );
    const bridgeData = BridgeConfig.decode(data) as BridgeConfigData;
    return bridgeData.max_token_amount.toString();
  }

  public async feeAmountOfBlockchain(): Promise<string> {
    const { data } = await this.blockchainAdapter.connection.getAccountInfo(
      new PublicKey(PDA_CONFIG)
    );
    const bridgeData = BridgeConfig.decode(data) as BridgeConfigData;
    return bridgeData.fee_amount_of_blockchain.toString();
  }

  public async blockchainCryptoFee(toBlockchainInContract: number): Promise<number> {
    const account = new PublicKey(BLOCKCHAIN_UUID[toBlockchainInContract]);
    const { data } = await this.blockchainAdapter.connection.getAccountInfo(account);
    const blockchainData = BlockchainLayout.decode(data) as SolanaBlockchainConfig;
    const fee = blockchainData.crypto_fee.toNumber();
    const decimals = NATIVE_SOL.decimals;

    return Web3Pure.fromWei(fee, decimals).toNumber();
  }

  public async isPaused(): Promise<boolean> {
    const { data } = await this.blockchainAdapter.connection.getAccountInfo(
      new PublicKey(PDA_CONFIG)
    );
    const bridgeData = BridgeConfig.decode(data) as BridgeConfigData;
    return bridgeData?.is_paused || false;
  }
}
