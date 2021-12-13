import { CrossChainRoutingTrade } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/CrossChainRoutingTrade';
import { TransactionOptions } from '@shared/models/blockchain/transaction-options';
import { CcrSettingsForm } from '@features/swaps/services/settings-service/settings.service';
import { PrivateAdapterService } from '@core/services/blockchain/web3/web3-private-service/private-adapter.service';
import { TO_BACKEND_BLOCKCHAINS } from '@shared/constants/blockchain/BACKEND_BLOCKCHAINS';
import { CROSS_CHAIN_ROUTING_SWAP_METHOD } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/CROSS_CHAIN_ROUTING_SWAP_METHOD';
import { Web3Public } from '@core/services/blockchain/web3/web3-public-service/Web3Public';
import BigNumber from 'bignumber.js';
import { PrivateBlockchainAdapterService } from '@core/services/blockchain/web3/web3-public-service/private-blockchain-adapter.service';
import { crossChainSwapContractAbi } from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/crossChainSwapContract/crossChainSwapContractAbi';
import { CrossChainRoutingApiService } from '@core/services/backend/cross-chain-routing-api/cross-chain-routing-api.service';
import { crossChainSwapContractAddresses } from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/crossChainSwapContract/crossChainSwapContractAddresses';
import {
  TransitTokens,
  transitTokensWithMode
} from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/transitTokens';
import { SupportedCrossChainSwapBlockchain } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/SupportedCrossChainSwapBlockchain';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/web3/web3-public-service/public-blockchain-adapter.service';

export class EthLikeContractExecutor {
  private readonly contractAbi;

  private readonly contractAddresses: Record<SupportedCrossChainSwapBlockchain, string[]>;

  private readonly transitTokens: TransitTokens;

  constructor(
    private readonly privateAdapter: PrivateBlockchainAdapterService,
    private readonly apiService: CrossChainRoutingApiService,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService
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
      this.privateAdapter[trade.fromBlockchain] as PrivateAdapterService
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
          // @TODO SOLANA KOSTYL.
          if (toBlockchainInContractNumber === 8) {
            this.apiService.postSolanaCCRdata(
              transactionHash,
              TO_BACKEND_BLOCKCHAINS[trade.fromBlockchain],
              targetAddress,
              trade.secondPath
            );
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

    const tokenInAmountMax = this.calculateTokenInAmountMax(trade, settings);
    const tokenInAmountAbsolute = Web3Public.toWei(tokenInAmountMax, trade.tokenIn.decimals);
    const tokenOutAmountMin = this.calculateTokenOutAmountMin(trade, settings);
    const tokenOutMinAbsolute = Web3Public.toWei(tokenOutAmountMin, trade.tokenOut.decimals);

    const firstTransitTokenAmountAbsolute = Web3Public.toWei(
      trade.firstTransitTokenAmount,
      this.transitTokens[trade.fromBlockchain].decimals
    );

    const methodArguments = [
      [
        toBlockchainInContractNumber,
        tokenInAmountAbsolute,
        trade.firstPath,
        // @TODO Solana.
        toBlockchainInContractNumber === 8 ? [] : trade.secondPath,
        firstTransitTokenAmountAbsolute,
        tokenOutMinAbsolute,
        // @TODO Solana.
        toBlockchainInContractNumber === 8 ? '0x1' : walletAddress,
        blockchainToAdapter.isNativeAddress(trade.tokenOut.address)
      ]
    ];

    const blockchainCryptoFee = Web3Public.toWei(trade.cryptoFee);
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
   * Calculates maximum sent amount of token-in, based on tokens route and slippage.
   */
  public calculateTokenInAmountMax(
    trade: CrossChainRoutingTrade,
    settings: CcrSettingsForm
  ): BigNumber {
    if (trade.firstPath.length === 1) {
      return trade.tokenInAmount;
    }
    const slippageTolerance = settings.slippageTolerance / 100;
    return trade.tokenInAmount.multipliedBy(1 + slippageTolerance);
  }

  /**
   * Calculates minimum received amount of token-out, based on tokens route and slippage.
   */
  public calculateTokenOutAmountMin(
    trade: CrossChainRoutingTrade,
    settings: CcrSettingsForm
  ): BigNumber {
    if (trade.secondPath.length === 1) {
      return trade.tokenOutAmount;
    }
    const slippageTolerance = settings.slippageTolerance / 100;
    return trade.tokenOutAmount.multipliedBy(1 - slippageTolerance);
  }
}
