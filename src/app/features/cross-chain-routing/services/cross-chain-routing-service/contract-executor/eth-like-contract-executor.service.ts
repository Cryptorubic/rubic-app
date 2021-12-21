import { CrossChainRoutingTrade } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/CrossChainRoutingTrade';
import { TransactionOptions } from '@shared/models/blockchain/transaction-options';
import { EthLikeWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-private/eth-like-web3-private.service';
import { TO_BACKEND_BLOCKCHAINS } from '@shared/constants/blockchain/BACKEND_BLOCKCHAINS';
import { EthLikeWeb3Public } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import BigNumber from 'bignumber.js';
import { PrivateBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/private-blockchain-adapter.service';
import { crossChainSwapContractAbi } from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/crossChainSwapContract/crossChainSwapContractAbi';
import { CrossChainRoutingApiService } from '@core/services/backend/cross-chain-routing-api/cross-chain-routing-api.service';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { EMPTY_ADDRESS } from '@shared/constants/blockchain/EMPTY_ADDRESS';
import { CrossChainContractExecutorFacadeService } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/cross-chain-contract-executor-facade.service';
import { RaydiumRoutingService } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/utils/raydium-routering.service';
import { Injectable } from '@angular/core';
import { CrossChainContractsDataService } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-data/cross-chain-contracts-data.service';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import { ContractParams } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/contract-params';

@Injectable({
  providedIn: 'root'
})
export class EthLikeContractExecutorService {
  private readonly contractAbi = crossChainSwapContractAbi;

  private readonly contracts = this.contractsDataService.getCrossChainContracts();

  constructor(
    private readonly contractsDataService: CrossChainContractsDataService,
    private readonly privateAdapter: PrivateBlockchainAdapterService,
    private readonly apiService: CrossChainRoutingApiService,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    private readonly raydiumRoutingService: RaydiumRoutingService
  ) {}

  public async execute(
    trade: CrossChainRoutingTrade,
    options: TransactionOptions,
    userAddress: string,
    targetAddress: string
  ): Promise<string> {
    const { contractAddress, methodName, methodArguments, value } = await this.getContractParams(
      trade,
      userAddress
    );

    const privateAdapter = this.privateAdapter[trade.fromBlockchain] as EthLikeWeb3PrivateService;
    let transactionHash;

    await privateAdapter.tryExecuteContractMethod(
      contractAddress,
      this.contractAbi,
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
          if (trade.toBlockchain === BLOCKCHAIN_NAME.SOLANA) {
            this.sendSolanaData(trade, transactionHash, targetAddress);
          }
        }
      },
      err => {
        const includesErrCode = err?.message?.includes('-32000');
        const allowedErrors = [
          'insufficient funds for transfer',
          'insufficient funds for gas * price+ value',
          'insufficient funds for gas * price + value'
        ];
        const includesPhrase = Boolean(allowedErrors.find(error => err?.message?.includes(error)));
        return includesErrCode && includesPhrase;
      }
    );

    return transactionHash;
  }

  /**
   * Returns contract's method's data to execute trade.
   * @param trade Cross chain trade.
   * @param walletAddress Wallet address.
   */
  public async getContractParams(
    trade: CrossChainRoutingTrade,
    walletAddress: string
  ): Promise<ContractParams> {
    const { fromBlockchain, toBlockchain } = trade;

    const contractAddress = this.contracts[fromBlockchain].address;
    const blockchainFromAdapter = this.publicBlockchainAdapterService[fromBlockchain];
    const blockchainToAdapter = this.publicBlockchainAdapterService[toBlockchain];

    const isFromTokenNative = blockchainFromAdapter.isNativeAddress(trade.tokenIn.address);
    const methodName = this.contracts[fromBlockchain].getMethodName(
      trade.fromProviderIndex,
      isFromTokenNative
    );

    const toNumOfBlockchain = this.contracts[toBlockchain].numOfBlockchain;

    const tokenInAmountAbsolute = EthLikeWeb3Public.toWei(
      trade.tokenInAmount,
      trade.tokenIn.decimals
    );
    const tokenOutAmountMin =
      CrossChainContractExecutorFacadeService.calculateTokenOutAmountMin(trade);
    const tokenOutAmountMinAbsolute = EthLikeWeb3Public.toWei(
      tokenOutAmountMin,
      trade.tokenOut.decimals
    );

    const firstTransitTokenAmountMin =
      CrossChainContractExecutorFacadeService.calculateFirstTransitTokenAmountMin(trade);
    const firstTransitTokenAmountMinAbsolute = EthLikeWeb3Public.toWei(
      firstTransitTokenAmountMin,
      this.contracts[fromBlockchain].transitToken.decimals
    );

    const methodArguments = [
      [
        toNumOfBlockchain,
        tokenInAmountAbsolute,
        trade.firstPath,
        // @TODO Solana. Remove hardcode.
        toBlockchain === BLOCKCHAIN_NAME.SOLANA ? [EMPTY_ADDRESS] : trade.secondPath,
        firstTransitTokenAmountMinAbsolute,
        tokenOutAmountMinAbsolute,
        // @TODO Solana. Remove hardcode.
        toBlockchain === BLOCKCHAIN_NAME.SOLANA ? EMPTY_ADDRESS : walletAddress,
        blockchainToAdapter.isNativeAddress(trade.tokenOut.address),
        true,
        false
      ]
    ];

    const blockchainCryptoFee = EthLikeWeb3Public.toWei(trade.cryptoFee);
    const value = new BigNumber(blockchainCryptoFee)
      .plus(isFromTokenNative ? tokenInAmountAbsolute : 0)
      .toFixed(0);

    return {
      contractAddress,
      methodName,
      methodArguments,
      value
    };
  }

  /**
   * Solana addresses has not supported by eth like blockchain contracts. Sends transaction details via http.
   * @param trade Cross-chain trade.
   * @param transactionHash Source transaction hash.
   * @param targetAddress Target network wallet address.
   */
  private sendSolanaData(
    trade: CrossChainRoutingTrade,
    transactionHash: string,
    targetAddress: string
  ): void {
    this.apiService
      .postSolanaCCRdata(
        transactionHash,
        TO_BACKEND_BLOCKCHAINS[trade.fromBlockchain],
        targetAddress,
        trade.secondPath,
        this.raydiumRoutingService.currentPoolInfo
      )
      .subscribe();
  }
}
