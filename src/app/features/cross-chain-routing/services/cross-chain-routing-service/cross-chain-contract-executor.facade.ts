import { PrivateBlockchainAdapterService } from '@core/services/blockchain/web3/web3-public-service/private-blockchain-adapter.service';
import { CrossChainRoutingTrade } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/CrossChainRoutingTrade';
import { TransactionOptions } from '@shared/models/blockchain/transaction-options';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/web3/web3-public-service/public-blockchain-adapter.service';
import { CcrSettingsForm } from '@features/swaps/services/settings-service/settings.service';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { SignatureResult } from '@solana/web3.js';

import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import { Injectable } from '@angular/core';
import { TokensService } from '@core/services/tokens/tokens.service';
import { RaydiumRoutingService } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/utils/raydium-router.info';

import { CrossChainRoutingApiService } from '@core/services/backend/cross-chain-routing-api/cross-chain-routing-api.service';
import { RaydiumService } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/raydium.service';
import { SolanaContractExecutor } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/solana-contract-executor';
import { EthLikeContractExecutor } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/eth-like-contract-executor';
import BigNumber from 'bignumber.js';
import CustomError from '@core/errors/models/custom-error';

@Injectable({
  providedIn: 'root'
})
export class CrossChainContractExecutorFacade {
  private targetAddress: string;

  private solanaContractExecutor: SolanaContractExecutor;

  private ethLikeContractExecutor: EthLikeContractExecutor;

  constructor(
    private readonly privateAdapter: PrivateBlockchainAdapterService,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    private readonly tokensService: TokensService,
    private readonly raydiumRoutingService: RaydiumRoutingService,
    private readonly apiService: CrossChainRoutingApiService,
    private readonly raydiumService: RaydiumService
  ) {
    this.solanaContractExecutor = new SolanaContractExecutor(
      privateAdapter,
      tokensService,
      raydiumRoutingService
    );
    this.ethLikeContractExecutor = new EthLikeContractExecutor(
      privateAdapter,
      apiService,
      publicBlockchainAdapterService
    );
  }

  public async executeCCRContract(
    trade: CrossChainRoutingTrade,
    options: TransactionOptions,
    userAddress: string,
    settings: CcrSettingsForm,
    toBlockchainInContractNumber: number
  ): Promise<string> {
    const type = BlockchainsInfo.getBlockchainType(trade.fromBlockchain);
    if (type === 'ethLike') {
      return this.ethLikeContractExecutor.execute(
        trade,
        options,
        userAddress,
        settings,
        toBlockchainInContractNumber,
        this.targetAddress
      );
    }
    if (type === 'solana') {
      try {
        const { transaction, signers } = await this.solanaContractExecutor.execute(
          trade,
          userAddress,
          toBlockchainInContractNumber,
          settings,
          this.targetAddress
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

  public setTargetNetworkAddress(address: string): void {
    this.targetAddress = address;
  }

  public calculateTokenInAmountMax(
    currentCrossChainTrade: CrossChainRoutingTrade,
    settings: CcrSettingsForm
  ): BigNumber {
    return this.ethLikeContractExecutor.calculateTokenInAmountMax(currentCrossChainTrade, settings);
  }

  public calculateTokenOutAmountMin(
    currentCrossChainTrade: CrossChainRoutingTrade,
    settings: CcrSettingsForm
  ): BigNumber {
    return this.ethLikeContractExecutor.calculateTokenOutAmountMin(
      currentCrossChainTrade,
      settings
    );
  }

  public async getContractData(
    trade: CrossChainRoutingTrade,
    walletAddress: string,
    settings: CcrSettingsForm,
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
      settings,
      numOfBlockchainsInContractElementElement
    );
  }
}
