import { CrossChainTrade } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade';
import { TransactionOptions } from '@shared/models/blockchain/transaction-options';
import { EthLikeWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-private/eth-like-web3-private.service';
import { TO_BACKEND_BLOCKCHAINS } from '@shared/constants/blockchain/BACKEND_BLOCKCHAINS';
import { PrivateBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/private-blockchain-adapter.service';
import { CrossChainRoutingApiService } from '@core/services/backend/cross-chain-routing-api/cross-chain-routing-api.service';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { RaydiumRoutingService } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/utils/raydium-routering.service';
import { Injectable } from '@angular/core';
import { CrossChainContractsDataService } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/cross-chain-contracts-data.service';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import { ContractParams } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/contract-params';
import { EthLikeWeb3Public } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import { CrossChainContractExecutorFacadeService } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/cross-chain-contract-executor-facade.service';
import BigNumber from 'bignumber.js';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';

@Injectable({
  providedIn: 'root'
})
export class EthLikeCrossChainContractExecutorService {
  private readonly contracts = this.contractsDataService.getCrossChainContracts();

  constructor(
    private readonly contractsDataService: CrossChainContractsDataService,
    private readonly privateAdapter: PrivateBlockchainAdapterService,
    private readonly apiService: CrossChainRoutingApiService,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    private readonly raydiumRoutingService: RaydiumRoutingService
  ) {}

  public async execute(
    trade: CrossChainTrade,
    options: TransactionOptions,
    userAddress: string,
    targetAddress: string
  ): Promise<string> {
    const { contractAddress, contractAbi, methodName, methodArguments, value } =
      await this.getContractParams(trade, userAddress);

    const privateAdapter = this.privateAdapter[trade.fromBlockchain] as EthLikeWeb3PrivateService;
    let transactionHash;

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
    trade: CrossChainTrade,
    walletAddress: string
  ): Promise<ContractParams> {
    const { fromBlockchain, toBlockchain } = trade;

    const isFromTokenNative = this.publicBlockchainAdapterService[fromBlockchain].isNativeAddress(
      trade.tokenIn.address
    );
    const isToTokenNative = this.publicBlockchainAdapterService[toBlockchain].isNativeAddress(
      trade.tokenOut.address
    );

    const contractAddress = this.contracts[fromBlockchain].address;

    const { contractAbi, methodName } = this.contracts[
      fromBlockchain
    ].getFromMethodNameAndContractAbi(trade.fromProviderIndex, isFromTokenNative);

    const tokenInAmountAbsolute = Web3Pure.toWei(trade.tokenInAmount, trade.tokenIn.decimals);
    const tokenOutAmountMin =
      CrossChainContractExecutorFacadeService.calculateTokenOutAmountMin(trade);
    const tokenOutAmountMinAbsolute = Web3Pure.toWei(tokenOutAmountMin, trade.tokenOut.decimals);

    const fromTransitTokenAmountMin =
      CrossChainContractExecutorFacadeService.calculateFromTransitTokenAmountMin(trade);
    const fromTransitTokenAmountMinAbsolute = Web3Pure.toWei(
      fromTransitTokenAmountMin,
      this.contracts[fromBlockchain].transitToken.decimals
    );

    const toNumOfBlockchain = this.contracts[toBlockchain].numOfBlockchain;

    const fromPath = this.contracts[fromBlockchain].getFromPath(
      trade.fromProviderIndex,
      trade.fromTrade
    );
    const toPath = this.contracts[toBlockchain].getToPath(trade.toProviderIndex, trade.toTrade);

    const toMethodSignature = this.contracts[toBlockchain].getToMethodSignature(
      trade.toProviderIndex,
      isToTokenNative
    );

    const methodArguments = [
      [
        toNumOfBlockchain,
        tokenInAmountAbsolute,
        fromPath,
        toPath,
        fromTransitTokenAmountMinAbsolute,
        tokenOutAmountMinAbsolute,
        EthLikeWeb3Public.addressToBytes32(walletAddress),
        isToTokenNative,
        true,
        false,
        toMethodSignature
      ]
    ];

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
   * Solana addresses has not supported by eth like blockchain contracts. Sends transaction details via http.
   * @param trade Cross-chain trade.
   * @param transactionHash Source transaction hash.
   * @param targetAddress Target network wallet address.
   */
  private sendSolanaData(
    trade: CrossChainTrade,
    transactionHash: string,
    targetAddress: string
  ): void {
    this.apiService
      .postSolanaCCRdata(
        transactionHash,
        TO_BACKEND_BLOCKCHAINS[trade.fromBlockchain],
        targetAddress,
        trade.toTrade.path.map(token => token.address),
        this.raydiumRoutingService.currentPoolInfo
      )
      .subscribe();
  }
}
