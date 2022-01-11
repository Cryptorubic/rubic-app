import { CrossChainTrade } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade';
import { TransactionOptions } from '@shared/models/blockchain/transaction-options';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { Injectable } from '@angular/core';
import { RaydiumService } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/raydium.service';
import { EthLikeContractExecutorService } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/eth-like-contract-executor.service';
import BigNumber from 'bignumber.js';
import { TargetNetworkAddressService } from '@features/cross-chain-routing/components/target-network-address/services/target-network-address.service';
import { TO_BACKEND_BLOCKCHAINS } from '@shared/constants/blockchain/backend-blockchains';
import { CrossChainRoutingApiService } from '@core/services/backend/cross-chain-routing-api/cross-chain-routing-api.service';
import { SupportedCrossChainBlockchain } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/supported-cross-chain-blockchain';
import { ContractsDataService } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contracts-data.service';
import { SolanaContractExecutorService } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/solana-contract-executor.service';
import CustomError from '@core/errors/models/custom-error';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { SignatureResult } from '@solana/web3.js';

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
    private readonly ethLikeContractExecutor: EthLikeContractExecutorService,
    private readonly solanaContractExecutor: SolanaContractExecutorService,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
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

        const methodSignature = this.contracts[trade.toBlockchain].getSwapToUserMethodSignature(
          trade.toProviderIndex,
          isToNative
        );
        this.sendDataFromSolana(trade.fromBlockchain, hash, methodSignature);
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

  /**
   * Solana contract method doesn't have `signature` argument. Sends transaction details via http.
   * @param fromBlockchain From blockchain.
   * @param transactionHash Source transaction hash.
   * @param contractFunction Method signature to call in target network.
   */
  private sendDataFromSolana(
    fromBlockchain: SupportedCrossChainBlockchain,
    transactionHash: string,
    contractFunction: string
  ): void {
    this.apiService
      .postCrossChainDataFromSolana(
        transactionHash,
        TO_BACKEND_BLOCKCHAINS[fromBlockchain],
        contractFunction
      )
      .subscribe();
  }
}
