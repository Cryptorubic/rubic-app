import { PrivateBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/private-blockchain-adapter.service';
import { CrossChainRoutingTrade } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/CrossChainRoutingTrade';
import { TransactionOptions } from '@shared/models/blockchain/transaction-options';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { SignatureResult } from '@solana/web3.js';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import { Injectable } from '@angular/core';
import { TokensService } from '@core/services/tokens/tokens.service';
import { RaydiumRoutingService } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/utils/raydium-routering.service';
import { CrossChainRoutingApiService } from '@core/services/backend/cross-chain-routing-api/cross-chain-routing-api.service';
import { RaydiumService } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/raydium.service';
import { SolanaContractExecutor } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/solana-contract-executor';
import { EthLikeContractExecutor } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/eth-like-contract-executor';
import BigNumber from 'bignumber.js';
import CustomError from '@core/errors/models/custom-error';
import { TargetNetworkAddressService } from '@features/cross-chain-routing/components/target-network-address/services/target-network-address.service';

@Injectable({
  providedIn: 'root'
})
export class CrossChainContractExecutorFacade {
  private solanaContractExecutor: SolanaContractExecutor;

  private ethLikeContractExecutor: EthLikeContractExecutor;

  get targetAddress(): string {
    return this.targetAddressService.targetAddress?.value;
  }

  /**
   * Calculates maximum sent amount of token-in, based on tokens route and slippage.
   */
  public static calculateTokenInAmountMax(trade: CrossChainRoutingTrade): BigNumber {
    if (trade.firstPath.length === 1) {
      return trade.tokenInAmount;
    }
    return trade.tokenInAmount.multipliedBy(2 - trade.fromSlippage);
  }

  /**
   * Calculates minimum received amount of transit token, based on tokens route and slippage.
   */
  public static calculateFirstTransitTokenAmountMin(trade: CrossChainRoutingTrade): BigNumber {
    if (trade.firstPath.length === 1) {
      return trade.firstTransitTokenAmount;
    }
    return trade.firstTransitTokenAmount.multipliedBy(trade.fromSlippage);
  }

  /**
   * Calculates minimum received amount of token-out, based on tokens route and slippage.
   */
  public static calculateTokenOutAmountMin(trade: CrossChainRoutingTrade): BigNumber {
    if (trade.secondPath.length === 1) {
      return trade.tokenOutAmount;
    }
    return trade.tokenOutAmount.multipliedBy(trade.toSlippage);
  }

  constructor(
    private readonly privateAdapter: PrivateBlockchainAdapterService,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    private readonly tokensService: TokensService,
    private readonly raydiumRoutingService: RaydiumRoutingService,
    private readonly apiService: CrossChainRoutingApiService,
    private readonly raydiumService: RaydiumService,
    private readonly targetAddressService: TargetNetworkAddressService
  ) {
    this.solanaContractExecutor = new SolanaContractExecutor(
      privateAdapter,
      tokensService,
      raydiumRoutingService
    );
    this.ethLikeContractExecutor = new EthLikeContractExecutor(
      privateAdapter,
      apiService,
      publicBlockchainAdapterService,
      raydiumRoutingService
    );
  }

  public async executeCCRContract(
    trade: CrossChainRoutingTrade,
    options: TransactionOptions,
    userAddress: string,
    toBlockchainInContractNumber: number
  ): Promise<string> {
    const type = BlockchainsInfo.getBlockchainType(trade.fromBlockchain);

    if (type === 'ethLike') {
      return this.ethLikeContractExecutor.execute(
        trade,
        options,
        userAddress,
        toBlockchainInContractNumber,
        this.targetAddress
      );
    }

    if (type === 'solana') {
      try {
        const isToNative = this.publicBlockchainAdapterService[trade.toBlockchain].isNativeAddress(
          trade.tokenOut.address
        );
        const { transaction, signers } = await this.solanaContractExecutor.execute(
          trade,
          userAddress,
          toBlockchainInContractNumber,
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

    return null;
  }

  public async getContractData(
    trade: CrossChainRoutingTrade,
    walletAddress: string,
    numOfBlockchainsInContractElementElement: number
  ): Promise<{
    contractAddress: string;
    methodName: string;
    methodArguments: unknown[];
    value: string;
  }> {
    return this.ethLikeContractExecutor.getContractData(
      trade,
      walletAddress,
      numOfBlockchainsInContractElementElement
    );
  }
}
