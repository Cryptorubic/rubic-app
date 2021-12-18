import { AbiItem } from 'web3-utils';
import { SolanaWeb3Public } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-public';
import { EthLikeWeb3Public } from 'src/app/core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import { crossChainSwapContractAbi } from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/crossChainSwapContract/crossChainSwapContractAbi';
import { PublicKey } from '@solana/web3.js';
import {
  BlockchainLayout,
  BridgeConfig,
  BridgeConfigData,
  SolanaBlockchainConfig
} from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/solana/raydium-ccr-sctuct';
import {
  PDA_CONFIG,
  PDA_POOL
} from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/solana/solana-constants';
import { BLOCKCHAIN_UUID } from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/solana/solana-blockchain-accounts-addresses';
import { NATIVE_SOL } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/tokens';
import { Web3Public } from '@core/services/blockchain/blockchain-adapters/models/web3-public';

export class CrossChainContractReader {
  private readonly ethContractAbi: AbiItem[];

  constructor(private readonly blockchainAdapter: SolanaWeb3Public | EthLikeWeb3Public) {
    this.ethContractAbi = crossChainSwapContractAbi;
  }

  public async minTokenAmount(fromContractAddress: string): Promise<string> {
    if (this.isSolana(this.blockchainAdapter)) {
      const { data } = await this.blockchainAdapter.connection.getAccountInfo(
        new PublicKey(PDA_CONFIG)
      );
      const bridgeData = BridgeConfig.decode(data) as BridgeConfigData;
      return bridgeData.min_token_amount.toString();
    }

    if (this.isEthLike(this.blockchainAdapter)) {
      return this.blockchainAdapter.callContractMethod<string>(
        fromContractAddress,
        this.ethContractAbi,
        'minTokenAmount'
      );
    }
    return null;
  }

  private isSolana(
    blockchainAdapter: Web3Public<unknown, unknown>
  ): blockchainAdapter is SolanaWeb3Public {
    return this.blockchainAdapter instanceof SolanaWeb3Public;
  }

  private isEthLike(
    blockchainAdapter: Web3Public<unknown, unknown>
  ): blockchainAdapter is EthLikeWeb3Public {
    return this.blockchainAdapter instanceof EthLikeWeb3Public;
  }

  public async maxTokenAmount(fromContractAddress: string): Promise<string> {
    if (this.isSolana(this.blockchainAdapter)) {
      const { data } = await this.blockchainAdapter.connection.getAccountInfo(
        new PublicKey(PDA_CONFIG)
      );
      const bridgeData = BridgeConfig.decode(data) as BridgeConfigData;
      return bridgeData.max_token_amount.toString();
    }

    if (this.isEthLike(this.blockchainAdapter)) {
      return this.blockchainAdapter.callContractMethod<string>(
        fromContractAddress,
        this.ethContractAbi,
        'maxTokenAmount'
      );
    }
    return null;
  }

  public async feeAmountOfBlockchain(
    contractAddress: string,
    numOfBlockchainInContract: number
  ): Promise<string> {
    if (this.isSolana(this.blockchainAdapter)) {
      const { data } = await this.blockchainAdapter.connection.getAccountInfo(
        new PublicKey(PDA_CONFIG)
      );
      const bridgeData = BridgeConfig.decode(data) as BridgeConfigData;
      return bridgeData.fee_amount_of_blockchain.toString();
    }

    if (this.isEthLike(this.blockchainAdapter)) {
      return await this.blockchainAdapter.callContractMethod(
        contractAddress,
        this.ethContractAbi,
        'feeAmountOfBlockchain',
        {
          methodArguments: [numOfBlockchainInContract]
        }
      );
    }
    return null;
  }

  public async blockchainCryptoFee(
    contractAddress: string,
    toBlockchainInContract: number
  ): Promise<number> {
    let fee, decimals;
    if (this.isSolana(this.blockchainAdapter)) {
      const account = new PublicKey(BLOCKCHAIN_UUID[toBlockchainInContract]);
      const { data } = await this.blockchainAdapter.connection.getAccountInfo(account);
      const blockchainData = BlockchainLayout.decode(data) as SolanaBlockchainConfig;
      fee = blockchainData.crypto_fee.toNumber();
      decimals = NATIVE_SOL.decimals;
    }

    if (this.isEthLike(this.blockchainAdapter)) {
      fee = await this.blockchainAdapter.callContractMethod(
        contractAddress,
        this.ethContractAbi,
        'blockchainCryptoFee',
        {
          methodArguments: [toBlockchainInContract]
        }
      );
      decimals = 18;
    }
    return EthLikeWeb3Public.fromWei(fee, decimals).toNumber();
  }

  public async isPaused(contractAddress: string): Promise<boolean> {
    if (this.isSolana(this.blockchainAdapter)) {
      const { data } = await this.blockchainAdapter.connection.getAccountInfo(
        new PublicKey(PDA_CONFIG)
      );
      const bridgeData = BridgeConfig.decode(data) as BridgeConfigData;
      return bridgeData?.is_paused || false;
    }

    if (this.isEthLike(this.blockchainAdapter)) {
      return await this.blockchainAdapter.callContractMethod<boolean>(
        contractAddress,
        this.ethContractAbi,
        'paused'
      );
    }
    return null;
  }

  public async blockchainPool(contractAddress: string): Promise<string> {
    if (this.isSolana(this.blockchainAdapter)) {
      return PDA_POOL;
    }

    if (this.isEthLike(this.blockchainAdapter)) {
      return await this.blockchainAdapter.callContractMethod(
        contractAddress,
        this.ethContractAbi,
        'blockchainPool'
      );
    }
    return null;
  }
}
