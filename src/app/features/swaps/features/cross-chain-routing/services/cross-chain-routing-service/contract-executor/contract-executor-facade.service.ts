import { CelerRubicTrade } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade';
import { TransactionOptions } from '@shared/models/blockchain/transaction-options';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { Injectable } from '@angular/core';
import { RaydiumService } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/raydium.service';
import { EthLikeContractExecutorService } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/eth-like-contract-executor.service';
import BigNumber from 'bignumber.js';
import { TargetNetworkAddressService } from '@features/swaps/features/cross-chain-routing/components/target-network-address/services/target-network-address.service';
import { SolanaContractExecutorService } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/solana-contract-executor.service';
import CustomError from '@core/errors/models/custom-error';
import { NearContractExecutorService } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/near-contract-executor.service';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';

@Injectable({
  providedIn: 'root'
})
export class ContractExecutorFacadeService {
  /**
   * Calculates minimum received amount of transit token, based on tokens route and slippage.
   */
  public static calculateFromTransitTokenAmountMin(trade: CelerRubicTrade): BigNumber {
    if (trade.fromTrade === null) {
      return trade.fromTransitTokenAmount;
    }
    return trade.fromTransitTokenAmount.multipliedBy(trade.fromSlippage);
  }

  /**
   * Calculates minimum received amount of token-out, based on tokens route and slippage.
   */
  public static calculateTokenOutAmountMin(trade: CelerRubicTrade): BigNumber {
    if (trade.toTrade === null) {
      return trade.toAmount;
    }
    return trade.toAmount.multipliedBy(trade.toSlippage);
  }

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
    private readonly targetAddressService: TargetNetworkAddressService
  ) {}

  public async executeTrade(
    trade: CelerRubicTrade,
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
        const isToNative = blockchainAdapter.isNativeAddress(trade.toToken.address);
        return this.solanaContractExecutor.executeTrade(
          trade,
          userAddress,
          this.targetAddress,
          isToNative
        );
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
}
