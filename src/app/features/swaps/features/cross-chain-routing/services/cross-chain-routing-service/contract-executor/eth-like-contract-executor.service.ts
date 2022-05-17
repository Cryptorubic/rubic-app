import { CrossChainTrade } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade';
import { TransactionOptions } from '@shared/models/blockchain/transaction-options';
import { PrivateBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/private-blockchain-adapter.service';
import { CrossChainRoutingApiService } from '@core/services/backend/cross-chain-routing-api/cross-chain-routing-api.service';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { Injectable } from '@angular/core';
import { ContractsDataService } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contracts-data.service';
import { ContractParams } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/contract-params';
import BigNumber from 'bignumber.js';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';
import { TO_BACKEND_BLOCKCHAINS } from '@shared/constants/blockchain/backend-blockchains';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { RefFinanceService } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/ref-finance.service';
import { NATIVE_NEAR_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import { WRAP_NEAR_CONTRACT } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/constants/ref-fi-constants';
import { isEthLikeBlockchainName } from '@shared/utils/blockchain/check-blockchain-name';
import IsNotEthLikeError from '@core/errors/models/common/is-not-eth-like-error';
import { TokenWithFeeError } from '@core/errors/models/common/token-with-fee-error';
import { TOKEN_WITH_FEE_ERRORS } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/constants/token-with-fee-errors';
import FailedToCheckForTransactionReceiptError from '@core/errors/models/common/failed-to-check-for-transaction-receipt-error';

@Injectable({
  providedIn: 'root'
})
export class EthLikeContractExecutorService {
  private readonly contracts = this.contractsDataService.contracts;

  constructor(
    private readonly contractsDataService: ContractsDataService,
    private readonly privateAdapter: PrivateBlockchainAdapterService,
    private readonly apiService: CrossChainRoutingApiService,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    private readonly refFinanceService: RefFinanceService
  ) {}

  public async executeTrade(
    trade: CrossChainTrade,
    options: TransactionOptions,
    userAddress: string,
    targetAddress: string
  ): Promise<string> {
    let transactionHash;
    try {
      transactionHash = await this.executeContractMethod(
        trade,
        options,
        userAddress,
        targetAddress
      );
    } catch (err) {
      const errMessage = err.message || err.toString?.();
      if (
        TOKEN_WITH_FEE_ERRORS.some(errText =>
          errMessage.toLowerCase().includes(errText.toLowerCase())
        )
      ) {
        try {
          if (this.contracts[trade.fromBlockchain].isProviderUniV2(trade.fromProviderIndex)) {
            transactionHash = await this.executeContractMethod(
              trade,
              options,
              userAddress,
              targetAddress,
              true
            );
          }
        } catch (_err) {
          throw new TokenWithFeeError();
        }
      } else {
        throw err;
      }
    }
    return transactionHash;
  }

  private async executeContractMethod(
    trade: CrossChainTrade,
    options: TransactionOptions,
    userAddress: string,
    targetAddress: string,
    swapTokenWithFee = false
  ): Promise<string> {
    if (!isEthLikeBlockchainName(trade.fromBlockchain)) {
      throw new IsNotEthLikeError(trade.fromBlockchain);
    }

    const toWalletAddress =
      BlockchainsInfo.getBlockchainType(trade.toBlockchain) === 'ethLike'
        ? userAddress
        : targetAddress;
    const { contractAddress, contractAbi, methodName, methodArguments, value } =
      await this.getContractParams(trade, toWalletAddress, swapTokenWithFee);

    const privateAdapter = this.privateAdapter[trade.fromBlockchain];
    const skipChecks = trade.fromBlockchain === BLOCKCHAIN_NAME.TELOS;

    let transactionHash;
    try {
      await privateAdapter.tryExecuteContractMethod(
        contractAddress,
        contractAbi,
        methodName,
        methodArguments,
        {
          ...options,
          value,
          onTransactionHash: (hash: string) => {
            if (options.onTransactionHash) {
              options.onTransactionHash(hash);
            }
            transactionHash = hash;
            if (trade.toBlockchain === BLOCKCHAIN_NAME.NEAR) {
              this.sendDataToNear(trade, transactionHash, targetAddress);
            }
          }
        },
        null,
        skipChecks
      );
    } catch (err) {
      if (err instanceof FailedToCheckForTransactionReceiptError) {
        return transactionHash;
      }
      throw err;
    }

    return transactionHash;
  }

  /**
   * Returns contract's method's data to execute trade.
   * @param trade Cross chain trade.
   * @param toWalletAddress Target wallet address.
   * @param swapTokenWithFee True, if token is with fee.
   */
  public async getContractParams(
    trade: CrossChainTrade,
    toWalletAddress: string,
    swapTokenWithFee = false
  ): Promise<ContractParams> {
    const { fromBlockchain, toBlockchain } = trade;
    if (!isEthLikeBlockchainName(fromBlockchain)) {
      throw new IsNotEthLikeError(fromBlockchain);
    }

    const isFromTokenNative = this.publicBlockchainAdapterService[fromBlockchain].isNativeAddress(
      trade.tokenIn.address
    );
    const isToTokenNative = this.publicBlockchainAdapterService[toBlockchain].isNativeAddress(
      trade.tokenOut.address
    );

    const contractAddress = this.contracts[fromBlockchain].address;

    const { contractAbi, methodName } = this.contracts[fromBlockchain].getMethodNameAndContractAbi(
      trade.fromProviderIndex,
      isFromTokenNative
    );

    const methodArguments = this.contracts[fromBlockchain].getMethodArguments(
      trade,
      isToTokenNative,
      this.contracts[toBlockchain],
      toWalletAddress,
      swapTokenWithFee
    );

    const tokenInAmountAbsolute = Web3Pure.toWei(trade.tokenInAmount, trade.tokenIn.decimals);
    const blockchainCryptoFee = Web3Pure.toWei(trade.cryptoFee);
    const value = new BigNumber(blockchainCryptoFee)
      .plus(isFromTokenNative ? tokenInAmountAbsolute : 0)
      .toFixed(0);

    return {
      contractAddress,
      contractAbi,
      methodName,
      methodArguments,
      value
    };
  }

  /**
   * Near addresses are not supported by eth like blockchain contracts. Sends transaction details via http.
   * @param trade Cross-chain trade.
   * @param transactionHash Source transaction hash.
   * @param targetAddress Target network wallet address.
   */
  private sendDataToNear(
    trade: CrossChainTrade,
    transactionHash: string,
    targetAddress: string
  ): void {
    this.apiService
      .postCrossChainDataToNear(
        transactionHash,
        TO_BACKEND_BLOCKCHAINS[trade.fromBlockchain],
        targetAddress,
        trade.toTrade?.path?.map(token =>
          token.address === NATIVE_NEAR_ADDRESS ? WRAP_NEAR_CONTRACT : token.address
        ) || [trade.tokenOut.address],
        this.refFinanceService.refRoutes
      )
      .subscribe();
  }
}
