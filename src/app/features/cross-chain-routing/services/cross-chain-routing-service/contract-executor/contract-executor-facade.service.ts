import { CrossChainTrade } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade';
import { TransactionOptions } from '@shared/models/blockchain/transaction-options';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { Injectable } from '@angular/core';
import { RaydiumService } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/raydium.service';
import { EthLikeContractExecutorService } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/eth-like-contract-executor.service';
import BigNumber from 'bignumber.js';
import { TargetNetworkAddressService } from '@features/cross-chain-routing/components/target-network-address/services/target-network-address.service';
import { CrossChainRoutingApiService } from '@core/services/backend/cross-chain-routing-api/cross-chain-routing-api.service';
import { ContractsDataService } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contracts-data.service';
import { SolanaContractExecutorService } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/solana-contract-executor.service';
import CustomError from '@core/errors/models/custom-error';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { SignatureResult } from '@solana/web3.js';
import { NearContractExecutorService } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/near-contract-executor.service';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { SolanaWeb3Public } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-public';

@Injectable({
  providedIn: 'root'
})
export class ContractExecutorFacadeService {
  /**
   * Calculates minimum received amount of transit token, based on tokens route and slippage.
   */
  public static calculateFromTransitTokenAmountMin(trade: CrossChainTrade): BigNumber {
    if (trade.fromTrade === null) {
      return trade.fromTransitTokenAmount;
    }
    return trade.fromTransitTokenAmount.multipliedBy(trade.fromSlippage);
  }

  /**
   * Calculates minimum received amount of token-out, based on tokens route and slippage.
   */
  public static calculateTokenOutAmountMin(trade: CrossChainTrade): BigNumber {
    if (trade.toTrade === null) {
      return trade.tokenOutAmount;
    }
    return trade.tokenOutAmount.multipliedBy(trade.toSlippage);
  }

  private readonly contracts = this.contractsDataService.contracts;

  /**
   * Gets address in target network.
   */
  get targetAddress(): string {
    return this.targetAddressService.targetAddress?.value;
  }

  constructor(
    // Executors.
    private readonly ethLikeContractExecutor: EthLikeContractExecutorService,
    private readonly solanaContractExecutor: SolanaContractExecutorService,
    private readonly nearContractExecutor: NearContractExecutorService,
    // Other services.
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly raydiumService: RaydiumService,
    private readonly targetAddressService: TargetNetworkAddressService,
    private readonly apiService: CrossChainRoutingApiService,
    private readonly contractsDataService: ContractsDataService
  ) {}

  public async executeTrade(
    trade: CrossChainTrade,
    options: TransactionOptions,
    userAddress: string
  ): Promise<string> {
    try {
      const blockchainType = BlockchainsInfo.getBlockchainType(trade.fromBlockchain);
      const blockchainAdapter = this.publicBlockchainAdapterService[trade.toBlockchain];

      if (blockchainType === 'ethLike') {
        return this.ethLikeContractExecutor.executeTrade(
          trade,
          options,
          userAddress,
          this.targetAddress
        );
      }

      if (blockchainType === 'solana') {
        const isToNative = blockchainAdapter.isNativeAddress(trade.tokenOut.address);
        const { transaction, signers } = await this.solanaContractExecutor.executeTrade(
          trade,
          userAddress,
          this.targetAddress,
          isToNative
        );
        const hash = await (blockchainAdapter as SolanaWeb3Public).signTransaction(
          this.walletConnectorService.provider,
          transaction,
          signers
        );
        await this.handleSolanaTransaction(hash, options?.onTransactionHash);

        return hash;
      }

      if (blockchainType === 'near') {
        return this.nearContractExecutor.executeTrade(trade, options, this.targetAddress);
      }
    } catch (err) {
      console.debug(err);
      if ('message' in err) {
        throw new CustomError(err.message);
      }
    }
  }

  private async handleSolanaTransaction(
    hash: string,
    onTransactionHash: ((hash: string) => void) | undefined
  ): Promise<void> {
    if (onTransactionHash) {
      onTransactionHash(hash);
    }
    await new Promise((resolve, reject) => {
      this.publicBlockchainAdapterService[BLOCKCHAIN_NAME.SOLANA].connection.onSignature(
        hash,
        (signatureResult: SignatureResult) => {
          if (!signatureResult.err) {
            resolve(hash);
          } else {
            reject(signatureResult.err);
          }
        }
      );
    });
  }
}
