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
import { NearContractExecutorService } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/near-contract-executor.service';
import { RefFinanceService } from '@features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/ref-finance.service';
import { NATIVE_NEAR_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import { WRAP_NEAR_CONTRACT } from '@features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/constants/ref-fi-constants';

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
    private readonly raydiumService: RaydiumService,
    private readonly targetAddressService: TargetNetworkAddressService,
    private readonly apiService: CrossChainRoutingApiService,
    private readonly contractsDataService: ContractsDataService,
    private readonly refFinanceService: RefFinanceService
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
        const hash = await this.raydiumService.addMetaAndSend(transaction, signers);
        await this.handleSolanaTransaction(hash, options?.onTransactionHash, trade, isToNative);

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

  /**
   * Solana contract method doesn't have `signature` argument. Sends transaction details via http.
   * @param fromBlockchain From blockchain.
   * @param transactionHash Source transaction hash.
   * @param methodName Method name to call in target network.
   * @param secondPath Second path for trade.
   * @param targetAddress Wallet address in target network.
   * @param pools To trade tokens pools.
   */
  private sendDataFromSolana(
    fromBlockchain: SupportedCrossChainBlockchain,
    transactionHash: string,
    methodName: string,
    secondPath?: string[],
    targetAddress?: string,
    pools?: number[]
  ): void {
    this.apiService
      .postCrossChainDataFromSolana(
        transactionHash,
        TO_BACKEND_BLOCKCHAINS[fromBlockchain],
        methodName,
        secondPath,
        targetAddress,
        pools
      )
      .subscribe();
  }

  private async handleSolanaTransaction(
    hash: string,
    onTransactionHash: ((hash: string) => void) | undefined,
    trade: CrossChainTrade,
    isToNative: boolean
  ): Promise<void> {
    if (onTransactionHash) {
      onTransactionHash(hash);

      const methodName = this.contracts[trade.toBlockchain].getSwapToUserMethodName(
        trade.toProviderIndex,
        isToNative
      );
      this.sendDataFromSolana(
        trade.fromBlockchain,
        hash,
        methodName,
        trade.toTrade?.path?.map(token =>
          token.address === NATIVE_NEAR_ADDRESS ? WRAP_NEAR_CONTRACT : token.address
        ),
        this.targetAddress,
        this.refFinanceService.refRoutes?.map(el => el.pool.id) || []
      );
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
