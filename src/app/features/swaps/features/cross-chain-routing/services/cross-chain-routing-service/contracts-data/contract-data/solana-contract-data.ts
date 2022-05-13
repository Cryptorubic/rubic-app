import { ContractData } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/contract-data';
import { ProviderData } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/models/provider-data';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { SolanaWeb3Public } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-public';
import { PublicKey } from '@solana/web3.js';
import { PDA_CONFIG } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/constants/solana/solana-constants';
import { BLOCKCHAIN_UUID } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/constants/solana/solana-blockchain-accounts-addresses';
import { NATIVE_SOL } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/tokens';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';
import {
  BLOCKCHAIN_LAYOUT,
  BRIDGE_CONFIG,
  BridgeConfigData,
  SolanaBlockchainConfig
} from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/constants/solana/raydium-ccr-sctuct';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import InstantTrade from '@features/swaps/features/instant-trade/models/instant-trade';
import BigNumber from 'bignumber.js';
import { BlockchainNumber } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/models/blockchain-number';

export class SolanaContractData extends ContractData {
  private readonly blockchainAdapter: SolanaWeb3Public;

  constructor(
    public readonly providersData: ProviderData[],
    public readonly numOfBlockchain: BlockchainNumber,
    publicBlockchainAdapterService: PublicBlockchainAdapterService
  ) {
    super(BLOCKCHAIN_NAME.SOLANA, providersData, numOfBlockchain);

    this.blockchainAdapter = publicBlockchainAdapterService[BLOCKCHAIN_NAME.SOLANA];
  }

  public async minTokenAmount(): Promise<string> {
    const { data } = await this.blockchainAdapter.connection.getAccountInfo(
      new PublicKey(PDA_CONFIG)
    );
    const bridgeData = BRIDGE_CONFIG.decode(data) as BridgeConfigData;
    return bridgeData.min_token_amount.toString();
  }

  public async maxTokenAmount(): Promise<string> {
    const { data } = await this.blockchainAdapter.connection.getAccountInfo(
      new PublicKey(PDA_CONFIG)
    );
    const bridgeData = BRIDGE_CONFIG.decode(data) as BridgeConfigData;
    return bridgeData.max_token_amount.toString();
  }

  public async feeAmountOfBlockchain(): Promise<string> {
    const { data } = await this.blockchainAdapter.connection.getAccountInfo(
      new PublicKey(PDA_CONFIG)
    );
    const bridgeData = BRIDGE_CONFIG.decode(data) as BridgeConfigData;
    return bridgeData.fee_amount_of_blockchain.toString();
  }

  public async blockchainCryptoFee(toBlockchainInContract: BlockchainNumber): Promise<BigNumber> {
    const account = new PublicKey(BLOCKCHAIN_UUID[toBlockchainInContract]);
    const { data } = await this.blockchainAdapter.connection.getAccountInfo(account);
    const blockchainData = BLOCKCHAIN_LAYOUT.decode(data) as SolanaBlockchainConfig;
    const fee = blockchainData.crypto_fee.toNumber();
    const decimals = NATIVE_SOL.decimals;

    return Web3Pure.fromWei(fee, decimals);
  }

  public async isPaused(): Promise<boolean> {
    const { data } = await this.blockchainAdapter.connection.getAccountInfo(
      new PublicKey(PDA_CONFIG)
    );
    const bridgeData = BRIDGE_CONFIG.decode(data) as BridgeConfigData;
    return bridgeData?.is_paused || false;
  }

  public getSecondPath(instantTrade: InstantTrade): string[] {
    if (!instantTrade) {
      return [SolanaWeb3Public.addressToBytes32(this.transitToken.address)];
    }
    return instantTrade.path.map(token => SolanaWeb3Public.addressToBytes32(token.address));
  }
}
