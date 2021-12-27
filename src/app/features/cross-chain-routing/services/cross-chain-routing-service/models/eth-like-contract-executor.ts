import { CrossChainRoutingTrade } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/CrossChainRoutingTrade';
import { TransactionOptions } from '@shared/models/blockchain/transaction-options';
import { CcrSettingsForm } from '@features/swaps/services/settings-service/settings.service';
import { EthLikeWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-private/eth-like-web3-private.service';
import { TO_BACKEND_BLOCKCHAINS } from '@shared/constants/blockchain/BACKEND_BLOCKCHAINS';
import { CROSS_CHAIN_ROUTING_SWAP_METHOD } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/CROSS_CHAIN_ROUTING_SWAP_METHOD';
import BigNumber from 'bignumber.js';
import { PrivateBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/private-blockchain-adapter.service';
import { crossChainSwapContractAbi } from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/crossChainSwapContract/crossChainSwapContractAbi';
import { CrossChainRoutingApiService } from '@core/services/backend/cross-chain-routing-api/cross-chain-routing-api.service';
import { crossChainSwapContractAddresses } from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/crossChainSwapContract/crossChainSwapContractAddresses';
import {
  TransitTokens,
  transitTokensWithMode
} from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/transit-tokens';
import { SupportedCrossChainSwapBlockchain } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/SupportedCrossChainSwapBlockchain';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { EMPTY_ADDRESS } from '@shared/constants/blockchain/EMPTY_ADDRESS';
import { CrossChainContractExecutorFacade } from '@features/cross-chain-routing/services/cross-chain-routing-service/cross-chain-contract-executor.facade';
import { RaydiumRoutingService } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/utils/raydium-routering.service';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';

export class EthLikeContractExecutor {
  private readonly contractAbi;

  private readonly contractAddresses: Record<SupportedCrossChainSwapBlockchain, string[]>;

  private readonly transitTokens: TransitTokens;

  constructor(
    private readonly privateAdapter: PrivateBlockchainAdapterService,
    private readonly apiService: CrossChainRoutingApiService,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    private readonly raydiumRoutingService: RaydiumRoutingService
  ) {
    this.contractAbi = crossChainSwapContractAbi;
    this.contractAddresses = crossChainSwapContractAddresses;
    this.transitTokens = transitTokensWithMode;
  }

  public async execute(
    trade: CrossChainRoutingTrade,
    options: TransactionOptions,
    userAddress: string,
    settings: CcrSettingsForm,
    toBlockchainInContractNumber: number,
    targetAddress: string
  ): Promise<string> {
    const { contractAddress, methodName, methodArguments, value } = await this.getContractData(
      trade,
      userAddress,
      settings,
      toBlockchainInContractNumber
    );
    let transactionHash;
    await (
      this.privateAdapter[trade.fromBlockchain] as EthLikeWeb3PrivateService
    ).tryExecuteContractMethod(
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
          if (toBlockchainInContractNumber === 8) {
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
   * @param settings Cross-chain form settings.
   * @param toBlockchainInContractNumber Number of blockchain.
   * @return string contractAddress
   * Contract address in source network.
   * @return string methodName
   * Method's name to call in contract.
   * @return unknown[] methodArguments
   * Method's arguments to call method with.
   * @return string value
   * Value in Wei to send with transaction.
   */
  public async getContractData(
    trade: CrossChainRoutingTrade,
    walletAddress: string,
    settings: CcrSettingsForm,
    toBlockchainInContractNumber: number
  ): Promise<{
    contractAddress: string;
    methodName: string;
    methodArguments: unknown[];
    value: string;
  }> {
    const contractAddress = this.contractAddresses[trade.fromBlockchain][trade.fromContractIndex];
    const blockchainFromAdapter = this.publicBlockchainAdapterService[trade.fromBlockchain];
    const blockchainToAdapter = this.publicBlockchainAdapterService[trade.toBlockchain];

    const isFromTokenNative = blockchainFromAdapter.isNativeAddress(trade.tokenIn.address);
    const methodName = isFromTokenNative
      ? CROSS_CHAIN_ROUTING_SWAP_METHOD.SWAP_CRYPTO
      : CROSS_CHAIN_ROUTING_SWAP_METHOD.SWAP_TOKENS;

    const tokenInAmountMax = CrossChainContractExecutorFacade.calculateTokenInAmountMax(
      trade,
      settings
    );
    const tokenInAmountAbsolute = Web3Pure.toWei(tokenInAmountMax, trade.tokenIn.decimals);

    const tokenOutAmountMin = CrossChainContractExecutorFacade.calculateTokenOutAmountMin(
      trade,
      settings
    );
    const tokenOutMinAbsolute = Web3Pure.toWei(tokenOutAmountMin, trade.tokenOut.decimals);

    const firstTransitTokenAmountAbsolute = Web3Pure.toWei(
      trade.firstTransitTokenAmount,
      this.transitTokens[trade.fromBlockchain].decimals
    );

    const methodArguments = [
      [
        toBlockchainInContractNumber,
        tokenInAmountAbsolute,
        trade.firstPath,
        // @TODO Solana. Remove hardcode.
        toBlockchainInContractNumber === 8 ? [EMPTY_ADDRESS] : trade.secondPath,
        firstTransitTokenAmountAbsolute,
        tokenOutMinAbsolute,
        // @TODO Solana. Remove hardcode.
        toBlockchainInContractNumber === 8 ? EMPTY_ADDRESS : walletAddress,
        blockchainToAdapter.isNativeAddress(trade.tokenOut.address)
      ]
    ];

    const blockchainCryptoFee = Web3Pure.toWei(trade.cryptoFee);
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
