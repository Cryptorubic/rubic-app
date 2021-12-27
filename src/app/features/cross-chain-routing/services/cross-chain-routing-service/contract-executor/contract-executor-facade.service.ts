import { CrossChainTrade } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade';
import { TransactionOptions } from '@shared/models/blockchain/transaction-options';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { SignatureResult } from '@solana/web3.js';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import { Injectable } from '@angular/core';
import { RaydiumService } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/raydium.service';
import { SolanaContractExecutorService } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/solana-contract-executor.service';
import { EthLikeContractExecutorService } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/eth-like-contract-executor.service';
import BigNumber from 'bignumber.js';
import CustomError from '@core/errors/models/custom-error';
import { TargetNetworkAddressService } from '@features/cross-chain-routing/components/target-network-address/services/target-network-address.service';

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

  /**
   * Gets address in target network.
   */
  get targetAddress(): string {
    return this.targetAddressService.targetAddress?.value;
  }

  constructor(
    private readonly ethLikeContractExecutor: EthLikeContractExecutorService,
    private readonly solanaContractExecutor: SolanaContractExecutorService,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    private readonly raydiumService: RaydiumService,
    private readonly targetAddressService: TargetNetworkAddressService
  ) {}

  public async executeTrade(
    trade: CrossChainTrade,
    options: TransactionOptions,
    userAddress: string
  ): Promise<string> {
    if (BlockchainsInfo.getBlockchainType(trade.fromBlockchain) === 'ethLike') {
      return this.ethLikeContractExecutor.executeTrade(
        trade,
        options,
        userAddress,
        this.targetAddress
      );
    }

    // solana
    try {
      const isToNative = this.publicBlockchainAdapterService[trade.toBlockchain].isNativeAddress(
        trade.tokenOut.address
      );
      const { transaction, signers } = await this.solanaContractExecutor.executeTrade(
        trade,
        userAddress,
        this.targetAddress,
        isToNative
      );

      const hash = await this.raydiumService.addMetaAndSend(transaction, signers);
      if (options.onTransactionHash) {
        options.onTransactionHash(hash);
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
      return hash;
    } catch (err) {
      console.debug(err);
      if ('message' in err) {
        throw new CustomError(err.message);
      }
    }
  }
}
