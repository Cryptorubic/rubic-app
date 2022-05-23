import { Injectable } from '@angular/core';
import { Web3Pure } from '@app/core/services/blockchain/blockchain-adapters/common/web3-pure';
import { EthLikeWeb3Pure } from '@app/core/services/blockchain/blockchain-adapters/eth-like/web3-pure/eth-like-web3-pure';
import { PrivateBlockchainAdapterService } from '@app/core/services/blockchain/blockchain-adapters/private-blockchain-adapter.service';
import { PublicBlockchainAdapterService } from '@app/core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { OneinchInstantTrade } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-service/models/oneinch-instant-trade';
import { SettingsService } from '@features/swaps/features/main-form/services/settings-service/settings.service';
import { EMPTY_ADDRESS } from '@app/shared/constants/blockchain/empty-address';
import networks from '@app/shared/constants/blockchain/networks';
import {
  BlockchainName,
  EthLikeBlockchainName
} from '@app/shared/models/blockchain/blockchain-name';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import BigNumber from 'bignumber.js';
import { transitTokens } from '../contracts-data/contract-data/constants/transit-tokens';
import { ContractsDataService } from '../contracts-data/contracts-data.service';
import { IndexedTradeAndToAmount } from '../models/indexed-trade.interface';
import { CelerApiService } from './celer-api.service';
import {
  DEADLINE,
  EMPTY_DATA,
  FEE_MULTIPLIER_FOR_SOURCE_TRANSIT_TOKEN,
  FEE_MULTIPLIER_FOR_TARGET_TRANSIT_TOKEN
} from './constants/CELER_CONSTANTS';
import { CELER_CONTRACT } from './constants/CELER_CONTRACT';
import { CELER_CONTRACT_ABI } from './constants/CELER_CONTRACT_ABI';
import { CELER_SUPPORTED_BLOCKCHAINS } from './constants/CELER_SUPPORTED_BLOCKCHAINS';
import { MESSAGE_BUS_CONTRACT_ABI } from './constants/MESSAGE_BUS_CONTRACT_ABI';
import { WRAPPED_NATIVE } from './constants/WRAPPED_NATIVE';
import { CelerSwapMethod } from './models/celer-swap-method.enum';
import { EstimateAmtResponse } from './models/estimate-amt-response.interface';
import { SwapVersion } from './models/provider-type.enum';
import { SwapInfoBridge } from './models/swap-info-bridge.interface';
import { SwapInfoDest } from './models/swap-info-dest.interface';
import { SwapInfoInch } from './models/swap-info-inch.interface';
import { SwapInfoV2 } from './models/swap-info-v2.interface';
import { SwapInfoV3 } from './models/swap-info-v3.interface';
import { TransactionOptions } from '@shared/models/blockchain/transaction-options';
import { LiquidityInfoItem } from './models/liquidity-info-response.interface';
import { map } from 'rxjs';

interface CelerTrade {
  srcSwap: SwapInfoInch | SwapInfoV2 | SwapInfoV3 | SwapInfoBridge;
  dstSwap: SwapInfoDest;
  srcProvider: IndexedTradeAndToAmount;
  maxSlippage: number;
}

enum CelerTransitTokenSymbol {
  USDT = 'USDT',
  USDC = 'USDC'
}

@Injectable()
export class CelerService {
  private celerTrade: CelerTrade;

  /**
   * User's slippage.
   */
  get userSlippage(): number {
    return this.settingsService.crossChainRoutingValue.slippageTolerance / 100;
  }

  private celerTransitTokens: Record<BlockchainName, LiquidityInfoItem[]>;

  constructor(
    private readonly privateBlockchainAdapterService: PrivateBlockchainAdapterService,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    private readonly contractsDataService: ContractsDataService,
    private readonly settingsService: SettingsService,
    private readonly celerApiService: CelerApiService
  ) {}

  public async getCelerLiquidityInfo(): Promise<void> {
    this.celerTransitTokens = (await this.celerApiService
      .getCelerLiquidityInfo()
      .pipe(
        map(response => {
          const lpInfo = response.lp_info.filter(
            item =>
              CELER_SUPPORTED_BLOCKCHAINS.map(
                (blockchain: BlockchainName) =>
                  networks.find(network => network.name === blockchain).id
              ).includes(item.chain.id) && this.isSupportedTransitToken(item.token.token.symbol)
          );

          return CELER_SUPPORTED_BLOCKCHAINS.map(blockchain => {
            const blockchainId = networks.find(item => item.name === blockchain).id;
            const tokens = lpInfo.filter(item => item.chain.id === blockchainId);

            return { [blockchain]: tokens };
          }).reduce((acc, curr) => {
            return { ...acc, ...curr };
          }, {});
        })
      )
      .toPromise()) as Record<BlockchainName, LiquidityInfoItem[]>;
  }

  /**
   * Makes swap via celer.
   * @param fromAmount Amount in.
   * @param fromBlockchain Source blockchain.
   * @param fromToken Token in.
   * @param toBlockchain Target blockchain.
   * @param toToken Token out.
   * @param options Transaction options.
   * @returns Transaction hash.
   */
  public async makeTransferWithSwap(
    fromAmount: BigNumber,
    fromBlockchain: EthLikeBlockchainName,
    fromToken: TokenAmount,
    toBlockchain: EthLikeBlockchainName,
    toToken: TokenAmount,
    options: TransactionOptions
  ): Promise<string> {
    const nativeIn = this.isNativeToken(fromBlockchain, fromToken);
    const dstChainId = this.getBlockchainId(toBlockchain);
    const receiver = this.getCelerContractAddress(toBlockchain);
    const caller = this.getCelerContractAddress(fromBlockchain);
    const amountIn = Web3Pure.toWei(fromAmount, fromToken.decimals);
    const methodName = this.getSwapMethod(
      fromBlockchain,
      this.celerTrade.srcProvider.providerIndex,
      nativeIn
    );
    const isBridgeInSourceNetwork = Object.keys(this.celerTrade.srcSwap).includes('srcBridgeToken');
    const isTransitTokenExpected = this.isSmartRoutingTransitToken(toToken);

    const methodArguments = this.prepareArgs([
      receiver,
      amountIn,
      dstChainId,
      isBridgeInSourceNetwork
        ? (this.celerTrade.srcSwap as SwapInfoBridge).srcBridgeToken
        : Object.values(this.celerTrade.srcSwap),
      Object.values(this.celerTrade.dstSwap),
      this.celerTrade.maxSlippage
    ]);

    const msgValue = await this.calculateMsgValue(
      fromBlockchain,
      toBlockchain,
      methodArguments,
      nativeIn,
      amountIn,
      isBridgeInSourceNetwork,
      isTransitTokenExpected
    );
    const msgValueStr = new BigNumber(msgValue).toFixed(0);

    let transactionHash: string;
    debugger;
    await this.privateBlockchainAdapterService[fromBlockchain].tryExecuteContractMethod(
      caller,
      CELER_CONTRACT_ABI,
      methodName,
      methodArguments,
      {
        value: msgValueStr,
        onTransactionHash: (hash: string) => {
          if (options?.onTransactionHash) {
            options?.onTransactionHash(hash);
          }
          transactionHash = hash;
        },
        ...(options?.gasPrice && { gasPrice: options.gasPrice })
      }
    );

    return transactionHash;
  }

  /**
   * Preparing data for source swap.
   * @param srcProvider Source provider data.
   * @param fromBlockchain Source blockchain.
   * @param fromTransitTokenAmount Transit token amount in source network.
   * @param fromToken Token in.
   * @param celerBridgeSlippage Celer bridge slippage.
   * @returns Source swap data.
   */
  private getSrcSwapObject(
    srcProvider: IndexedTradeAndToAmount,
    fromBlockchain: EthLikeBlockchainName,
    fromTransitTokenAmount: BigNumber,
    fromToken: TokenAmount,
    fromSlippage: number,
    bridgePair: boolean
  ): SwapInfoInch | SwapInfoV2 | SwapInfoV3 | SwapInfoBridge {
    const dexes = this.contractsDataService.contracts[fromBlockchain];
    const dexAddress = dexes.getProvider(srcProvider.providerIndex).contractAddress;
    const amountOutMinimum = Web3Pure.toWei(
      fromTransitTokenAmount.multipliedBy(fromSlippage),
      dexes.transitToken.decimals
    );
    const canBridgeInSourceNetwork = bridgePair || this.isSmartRoutingTransitToken(fromToken);

    if (canBridgeInSourceNetwork) {
      return { srcBridgeToken: fromToken.address } as SwapInfoBridge;
    }

    if (dexes.isProviderOneinch(srcProvider.providerIndex)) {
      const trade = srcProvider.tradeAndToAmount.trade as OneinchInstantTrade;
      const [tokenIn, ...path] = trade?.path?.map(token => token.address);
      const isInchNative = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' === tokenIn;

      return {
        dex: dexAddress,
        path: [isInchNative ? WRAPPED_NATIVE[fromBlockchain] : tokenIn, path.at(-1)],
        data: trade.data,
        amountOutMinimum
      } as SwapInfoInch;
    }

    if (dexes.isProviderUniV2(srcProvider.providerIndex)) {
      return {
        dex: dexAddress,
        path: srcProvider.tradeAndToAmount.trade?.path?.map(token => token.address),
        deadline: DEADLINE,
        amountOutMinimum
      } as SwapInfoV2;
    }

    if (dexes.isProviderUniV3(srcProvider.providerIndex)) {
      const pathV3 = this.contractsDataService.contracts[fromBlockchain].getFirstPath(
        srcProvider.providerIndex,
        srcProvider.tradeAndToAmount.trade
      );

      return {
        dex: dexAddress,
        path: pathV3,
        deadline: DEADLINE,
        amountOutMinimum
      } as SwapInfoV3;
    }
  }

  /**
   * Preparing data for destination swap.
   * @param dstProvider Target provider data.
   * @param toBlockchain Target blockchain.
   * @param estimatedTokenAmount Estimated amount out.
   * @param toToken Token out.
   * @returns Destination swap data.
   */
  private getDstSwapObject(
    dstProvider: IndexedTradeAndToAmount,
    toBlockchain: EthLikeBlockchainName,
    estimatedTokenAmount: BigNumber,
    toToken: TokenAmount,
    bridgePair: boolean
  ): SwapInfoDest {
    const swapVersion = this.getCelerSwapVersion(toBlockchain, dstProvider.providerIndex);
    const dexes = this.contractsDataService.contracts[toBlockchain];
    const dexAddress = dexes.getProvider(dstProvider.providerIndex).contractAddress;
    const amountOutMinimum = this.getAmountWithUsersSlippage(estimatedTokenAmount);
    const canBridgeInTargetNetwork = bridgePair || this.isSmartRoutingTransitToken(toToken);

    const dstSwap: SwapInfoDest = {
      dex: dexAddress,
      integrator: EMPTY_ADDRESS,
      version: swapVersion,
      path: [EMPTY_ADDRESS],
      pathV3: EMPTY_DATA,
      deadline: DEADLINE,
      amountOutMinimum: Web3Pure.toWei(amountOutMinimum, dexes.transitToken.decimals)
    };

    if (canBridgeInTargetNetwork) {
      return {
        dex: EMPTY_ADDRESS,
        integrator: EMPTY_ADDRESS,
        version: SwapVersion.BRIDGE,
        path: [toToken.address],
        pathV3: EMPTY_DATA,
        deadline: 0,
        amountOutMinimum: '0'
      };
    }

    if (dexes.isProviderUniV2(dstProvider.providerIndex)) {
      // TODO change to getSecondPath
      dstSwap.path = dstProvider.tradeAndToAmount.trade.path.map(token => token.address);
    }

    if (dexes.isProviderUniV3(dstProvider.providerIndex)) {
      const pathV3 = this.contractsDataService.contracts[toBlockchain].getFirstPath(
        dstProvider.providerIndex,
        dstProvider.tradeAndToAmount.trade
      );
      dstSwap.pathV3 = pathV3;
    }

    return dstSwap;
  }

  /**
   * Builds celer trade object needed for swap.
   * @param fromBlockchain Source blockchain.
   * @param toBlockchain Target blockchain.
   * @param toToken Token out.
   * @param fromToken Token in.
   * @param fromTransitTokenAmount Transit token amount in source network.
   * @param toAmount Amount out.
   * @param srcProvider Source provider data.
   * @param dstProvider Target provider data.
   * @param maxSlippage Max slippage.
   * @param fromSlippage Celer bridge slippage.
   * @param amountIn Token amount user wants to swap.
   */
  public async buildCelerTrade(
    fromBlockchain: EthLikeBlockchainName,
    toBlockchain: EthLikeBlockchainName,
    toToken: TokenAmount,
    fromToken: TokenAmount,
    fromTransitTokenAmount: BigNumber,
    toAmount: BigNumber,
    srcProvider: IndexedTradeAndToAmount,
    dstProvider: IndexedTradeAndToAmount,
    maxSlippage: number,
    fromSlippage: number,
    amountIn: BigNumber,
    isBridgePair: boolean
  ): Promise<void> {
    const isEnoughtLiquidityForBridge =
      isBridgePair && this.checkBridgePairLiquidity(fromToken, toToken, amountIn);
    const srcSwap = this.getSrcSwapObject(
      srcProvider,
      fromBlockchain,
      fromTransitTokenAmount,
      fromToken,
      fromSlippage,
      isEnoughtLiquidityForBridge
    );
    const dstSwap = this.getDstSwapObject(
      dstProvider,
      toBlockchain,
      toAmount,
      toToken,
      isEnoughtLiquidityForBridge
    );

    this.celerTrade = {
      srcSwap,
      dstSwap,
      srcProvider,
      maxSlippage
    };
  }

  private checkBridgePairLiquidity(
    fromToken: TokenAmount,
    toToken: TokenAmount,
    amountIn: BigNumber
  ): boolean {
    const srcTokenLiquidityInfo = this.findCelerTransitTokenInfo(fromToken);
    const dstTokenLiquidityInfo = this.findCelerTransitTokenInfo(toToken);
    const isEnoughtLiquidityForTrade =
      amountIn.lt(srcTokenLiquidityInfo?.total_liquidity) &&
      amountIn.lt(dstTokenLiquidityInfo?.total_liquidity);

    return (
      Boolean(srcTokenLiquidityInfo) && Boolean(dstTokenLiquidityInfo) && isEnoughtLiquidityForTrade
    );
  }

  public async checkIsCelerBridgeSupportedTokenPair(
    fromToken: TokenAmount,
    toToken: TokenAmount
  ): Promise<boolean> {
    if (!Boolean(this.celerTransitTokens)) {
      await this.getCelerLiquidityInfo();
    }

    const srcTokenLiquidityInfo = this.findCelerTransitTokenInfo(fromToken);
    const dstTokenLiquidityInfo = this.findCelerTransitTokenInfo(toToken);

    return (
      srcTokenLiquidityInfo?.token?.token.symbol === dstTokenLiquidityInfo?.token?.token.symbol
    );
  }

  private findCelerTransitTokenInfo(token: TokenAmount): LiquidityInfoItem {
    return this.celerTransitTokens?.[token.blockchain]?.find(
      item => item.token.token.address.toLowerCase() === token.address.toLocaleLowerCase()
    );
  }

  /**
   * Gets celer's estimate for trade based on provided data.
   * @param fromBlockchain Source blockchain.
   * @param toBlockchain Target blockchain.
   * @param fromTransitTokenAmount Transit token amount in source network.
   * @param celerBridgeSlippage Celer bridge slippage.
   * @returns Estimated trade data.
   */
  public async getCelerEstimate(
    fromBlockchain: EthLikeBlockchainName,
    toBlockchain: EthLikeBlockchainName,
    fromTransitTokenAmount: BigNumber,
    celerBridgeSlippage: number
  ): Promise<EstimateAmtResponse> {
    const srcChainId = this.getBlockchainId(fromBlockchain);
    const dstChainId = this.getBlockchainId(toBlockchain);
    const srcTransitTokenDecimals =
      this.contractsDataService.contracts[fromBlockchain].transitToken.decimals;

    return await this.celerApiService
      .getEstimateAmt(
        srcChainId,
        dstChainId,
        'USDC',
        Number((celerBridgeSlippage * 100 * 10 ** 6).toFixed(0)),
        Web3Pure.toWei(fromTransitTokenAmount, srcTransitTokenDecimals)
      )
      .toPromise();
  }

  /**
   * Get swap limit for celer's contract in provided blockchain.
   * @param fromBlockchain Supposed blockchain.
   * @param type Limit type expected.
   * @returns Swap limit.
   */
  public async getSwapLimit(
    fromBlockchain: EthLikeBlockchainName,
    type: 'min' | 'max'
  ): Promise<BigNumber> {
    const celerContractAddress = this.getCelerContractAddress(fromBlockchain);
    const transitToken = transitTokens[fromBlockchain];
    const amount = await this.publicBlockchainAdapterService[fromBlockchain].callContractMethod(
      celerContractAddress,
      CELER_CONTRACT_ABI,
      type === 'min' ? 'minSwapAmount' : 'maxSwapAmount',
      { methodArguments: [transitToken.address] }
    );
    const amountInTokens = Web3Pure.fromWei(amount, transitToken.decimals);

    return amountInTokens;
  }

  /**
   * Calculates message value for celer swap based on final message length.
   * @param fromBlockchain Source blockchain.
   * @param toBlockchain Target blockchain.
   * @param data Message.
   * @param nativeIn Is source token native.
   * @param amountIn Trade amount.
   * @param isBridge Is bridge swap in source network.
   * @returns Message value for swap.
   */
  private async calculateMsgValue(
    fromBlockchain: EthLikeBlockchainName,
    toBlockchain: EthLikeBlockchainName,
    data: unknown,
    nativeIn: boolean,
    amountIn: string,
    isBridge: boolean,
    isTransitTokenExpected: boolean
  ): Promise<number> {
    const dstNetworkId = this.getBlockchainId(toBlockchain);
    const celerContractAddress = this.getCelerContractAddress(fromBlockchain);

    const cryptoFee = await this.publicBlockchainAdapterService[fromBlockchain].callContractMethod(
      celerContractAddress,
      CELER_CONTRACT_ABI,
      'dstCryptoFee',
      {
        methodArguments: [String(dstNetworkId)]
      }
    );

    const message = EthLikeWeb3Pure.asciiToBytes32(JSON.stringify(data));
    const messageBusAddress = await this.publicBlockchainAdapterService[
      fromBlockchain
    ].callContractMethod(celerContractAddress, CELER_CONTRACT_ABI, 'messageBus');

    const feePerByte = await this.publicBlockchainAdapterService[fromBlockchain].callContractMethod(
      messageBusAddress,
      MESSAGE_BUS_CONTRACT_ABI,
      'calcFee',
      { methodArguments: [message] }
    );

    const feeBase = await this.publicBlockchainAdapterService[fromBlockchain].callContractMethod(
      messageBusAddress,
      MESSAGE_BUS_CONTRACT_ABI,
      'feeBase'
    );

    if (nativeIn) {
      return Number(amountIn) + Number(feePerByte) + Number(cryptoFee) + Number(feeBase);
    }

    if (isBridge) {
      // TODO investigate "insufficient fee" error with USDC as source token
      const adjustedFeeBase = Number(feeBase) * FEE_MULTIPLIER_FOR_SOURCE_TRANSIT_TOKEN;
      return Number(feePerByte) + Number(cryptoFee) + adjustedFeeBase;
    }

    // TODO investigate "insufficient fee" error with USDC as target token
    const adjustedFeePerByte = isTransitTokenExpected
      ? Number(feePerByte) * FEE_MULTIPLIER_FOR_TARGET_TRANSIT_TOKEN
      : Number(feePerByte);

    return adjustedFeePerByte + Number(cryptoFee) + Number(feeBase);
  }

  /**
   * Checks if celer contracts are paused in source and target networks.
   * @param fromBlockchain Source blockchain.
   * @param toBlockchain Target blockchain.
   * @returns Result for each contract.
   */
  public checkIsCelerContractPaused(
    fromBlockchain: EthLikeBlockchainName,
    toBlockchain: EthLikeBlockchainName
  ): Promise<boolean[]> {
    const checkContract = (blockchain: EthLikeBlockchainName): Promise<boolean> => {
      const contractAddress = this.getCelerContractAddress(blockchain);
      return this.publicBlockchainAdapterService[blockchain].callContractMethod<boolean>(
        contractAddress,
        CELER_CONTRACT_ABI,
        'paused'
      );
    };

    return Promise.all([checkContract(fromBlockchain), checkContract(toBlockchain)]);
  }

  /**
   * Returns id of passed blockchain.
   * @param blockchain Supposed blockchain.
   * @returns Blockchain id.
   */
  public getBlockchainId(blockchain: EthLikeBlockchainName): number {
    return networks.find(network => network.name === blockchain).id;
  }

  /**
   * Checks if the passed token is transit.
   * @param token Verifiable token.
   * @returns True if token is transit for token's blockchain.
   */
  private isSmartRoutingTransitToken(token: TokenAmount): boolean {
    return transitTokens[token.blockchain].address.toLowerCase() === token.address.toLowerCase();
  }

  /**
   * Calculates token amount with user's slippage.
   * @param amount Amount in.
   * @returns Amount with slippage.
   */
  private getAmountWithUsersSlippage(amount: BigNumber): BigNumber {
    const slippage = this.userSlippage / 2;

    return amount.minus(amount.multipliedBy(slippage));
  }

  /**
   * Returns celer's swap version based on passed provider index and blockchain.
   * @param blockchain Supposed blockchain.
   * @param providerIndex Supposed provider index.
   * @returns Celer's swap version
   */
  private getCelerSwapVersion(
    blockchain: EthLikeBlockchainName,
    providerIndex: number
  ): SwapVersion {
    const ccrContract = this.contractsDataService.contracts[blockchain];

    if (ccrContract.isProviderUniV3(providerIndex)) {
      return SwapVersion.V3;
    }

    return SwapVersion.V2;
  }

  /**
   * Returns celer's contract swap method based on source token and dex.
   * @param fromBlockchain Source blockchain.
   * @param srcProviderIndex Source provider index.
   * @param nativeIn Is source token native.
   * @returns Celer swap method.
   */
  private getSwapMethod(
    fromBlockchain: EthLikeBlockchainName,
    srcProviderIndex: number,
    nativeIn: boolean
  ): CelerSwapMethod {
    const ccrContract = this.contractsDataService.contracts[fromBlockchain];

    if ((this.celerTrade.srcSwap as SwapInfoBridge).srcBridgeToken) {
      return nativeIn ? CelerSwapMethod.SWAP_BRIDGE_NATIVE : CelerSwapMethod.SWAP_BRIDGE;
    }

    if (ccrContract.isProviderOneinch(srcProviderIndex)) {
      return nativeIn ? CelerSwapMethod.SWAP_INCH_NATIVE : CelerSwapMethod.SWAP_INCH;
    }

    if (ccrContract.isProviderUniV2(srcProviderIndex)) {
      return nativeIn ? CelerSwapMethod.SWAP_V2_NATIVE : CelerSwapMethod.SWAP_V2;
    }

    if (ccrContract.isProviderUniV3(srcProviderIndex)) {
      return nativeIn ? CelerSwapMethod.SWAP_V3_NATIVE : CelerSwapMethod.SWAP_V3;
    }
  }

  /**
   * Returns Celer contract address used in passed blockchain.
   * @param blockchain Supposed blockchain.
   * @returns Celer contract address.
   */
  public getCelerContractAddress(blockchain: EthLikeBlockchainName): string {
    return CELER_CONTRACT[blockchain];
  }

  /**
   * Checks if the passed blockchain supported by Celer.
   * @param blockchain Verifiable blochain.
   * @returns True if supported.
   */
  public isSupportedBlockchain(blockchain: BlockchainName): boolean {
    return CELER_SUPPORTED_BLOCKCHAINS.includes(blockchain);
  }

  /**
   * Checks if the passed token is native.
   * @param blockchain Token's blockchain.
   * @param token Verifiable token.
   * @returns True if token is native.
   */
  private isNativeToken(blockchain: EthLikeBlockchainName, token: TokenAmount): boolean {
    return this.publicBlockchainAdapterService[blockchain].isNativeAddress(token.address);
  }

  /**
   * Transforms each element of array of arguments to string for smart-contract method call.
   * @param args Array of arguments.
   * @returns Prepared array of arguments.
   */
  private prepareArgs(args: unknown[]): unknown[] {
    return args.map(arg => {
      if (Array.isArray(arg)) {
        return this.prepareArgs(arg);
      }

      if (typeof arg === 'boolean') {
        return arg;
      } else {
        return String(arg);
      }
    });
  }

  private isSupportedTransitToken(symbol: string): boolean {
    return (Object.values(CelerTransitTokenSymbol) as string[]).includes(symbol);
  }

  /**
   * Calculates celer bridge slippage.
   * @param fromBlockchain Source blockchain.
   * @param toBlockchain Target blockchain.
   * @param amt Trade amount.
   * @returns Celer bridge slippage.
   */
  public async getCelerBridgeSlippage(
    fromBlockchain: EthLikeBlockchainName,
    toBlockchain: EthLikeBlockchainName,
    amt: BigNumber
  ): Promise<number> {
    const srcChainId = this.getBlockchainId(fromBlockchain);
    const dstChainId = this.getBlockchainId(toBlockchain);
    const srcTransitTokenDecimals = transitTokens[fromBlockchain].decimals;
    const estimate = await this.celerApiService
      .getEstimateAmt(
        srcChainId,
        dstChainId,
        'USDC',
        0,
        Web3Pure.toWei(amt, srcTransitTokenDecimals)
      )
      .toPromise();

    return estimate.max_slippage / 10 ** 6 / 100;
  }
}
