import { Injectable } from '@angular/core';
import { Web3Pure } from '@app/core/services/blockchain/blockchain-adapters/common/web3-pure';
import { EthLikeWeb3Pure } from '@app/core/services/blockchain/blockchain-adapters/eth-like/web3-pure/eth-like-web3-pure';
import { PrivateBlockchainAdapterService } from '@app/core/services/blockchain/blockchain-adapters/private-blockchain-adapter.service';
import { PublicBlockchainAdapterService } from '@app/core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { OneinchInstantTrade } from '@app/features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-service/models/oneinch-instant-trade';
import { SettingsService } from '@app/features/swaps/services/settings-service/settings.service';
import networks from '@app/shared/constants/blockchain/networks';
import {
  BlockchainName,
  EthLikeBlockchainName
} from '@app/shared/models/blockchain/blockchain-name';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import BigNumber from 'bignumber.js';
import { pluck } from 'rxjs/operators';
import { transitTokens } from '../contracts-data/contract-data/constants/transit-tokens';
import { ContractsDataService } from '../contracts-data/contracts-data.service';
import { IndexedTradeAndToAmount } from '../cross-chain-routing.service';
import { CelerApiService } from './celer-api.service';
import { CELER_SLIPPAGE_ADDITIONAL_VALUE } from './constants/CELER_CONSTANTS';
import { CELER_CONTRACT } from './constants/CELER_CONTRACT';
import { CELER_CONTRACT_ABI } from './constants/CELER_CONTRACT_ABI';
import { CELER_SUPPORTED_BLOCKCHAINS } from './constants/CELER_SUPPORTED_BLOCKCHAINS';
import { CELER_TRANSIT_TOKENS } from './constants/CELER_TRANSIT_TOKENS';
import { MESSAGE_BUS_CONTRACT_ABI } from './constants/MESSAGE_BUS_CONTRACT_ABI';
import { CelerSwapMethod } from './models/celer-swap-method.enum';
import { EstimateAmtResponse } from './models/estimate-amt-response.interface';
import { SwapVersion } from './models/provider-type.enum';
import { SwapInfoBridge } from './models/swap-info-bridge.interface';
import { SwapInfoDest } from './models/swap-info-dest.interface';
import { SwapInfoInch } from './models/swap-info-inch.interface';
import { SwapInfoV2 } from './models/swap-info-v2.interface';
import { SwapInfoV3 } from './models/swap-info-v3.interface';

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

const EMPTY_DATA = '0x';

const DEADLINE = 999999999999999;

export interface CelerTrade {
  srcSwap: SwapInfoInch | SwapInfoV2 | SwapInfoV3 | SwapInfoBridge;
  dstSwap: SwapInfoDest;
  srcProvider: IndexedTradeAndToAmount;
  maxSlippage: number;
}

@Injectable()
export class CelerService {
  private celerTrade: CelerTrade;

  get userSlippage(): number {
    return this.settingsService.crossChainRoutingValue.slippageTolerance / 100;
  }

  constructor(
    private readonly privateBlockchainAdapterService: PrivateBlockchainAdapterService,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    private readonly contractsDataService: ContractsDataService,
    private readonly settingsService: SettingsService,
    private readonly celerApiService: CelerApiService
  ) {}

  public async makeTransferWithSwap(
    fromAmount: BigNumber,
    fromBlockchain: EthLikeBlockchainName,
    fromToken: TokenAmount,
    toBlockchain: EthLikeBlockchainName,
    toToken: TokenAmount,
    onTxHash: (hash: string) => void
  ): Promise<string> {
    const nativeOut = this.isNativeToken(toBlockchain, toToken);
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
    const isBridge = Object.keys(this.celerTrade.srcSwap).includes('srcBridgeToken');

    const preparedArgs = this.prepareArgs([
      receiver,
      amountIn,
      dstChainId,
      isBridge
        ? (this.celerTrade.srcSwap as SwapInfoBridge).srcBridgeToken
        : Object.values(this.celerTrade.srcSwap),
      Object.values(this.celerTrade.dstSwap),
      this.celerTrade.maxSlippage,
      nativeOut
    ]);

    const msgValue = await this.calculateMsgValue(
      fromBlockchain,
      toBlockchain,
      preparedArgs,
      nativeIn,
      amountIn,
      isBridge
    );

    let transactionHash: string;

    await this.privateBlockchainAdapterService[fromBlockchain].tryExecuteContractMethod(
      caller,
      CELER_CONTRACT_ABI,
      methodName,
      preparedArgs,
      {
        value: String(msgValue),
        onTransactionHash: (hash: string) => {
          if (onTxHash) {
            onTxHash(hash);
          }
          transactionHash = hash;
        }
      }
    );

    return transactionHash;
  }

  private getSrcSwapObject(
    srcProvider: IndexedTradeAndToAmount,
    fromBlockchain: EthLikeBlockchainName,
    fromTransitTokenAmount: BigNumber,
    fromToken: TokenAmount
  ): SwapInfoInch | SwapInfoV2 | SwapInfoV3 | SwapInfoBridge {
    const dexes = this.contractsDataService.contracts[fromBlockchain];
    const dexAddress = dexes.getProvider(srcProvider.providerIndex).contractAddress;
    const amountOutMinimum = Web3Pure.toWei(
      this.getAmountOutMinimum(fromTransitTokenAmount),
      dexes.transitToken.decimals
    );
    const canBridgeInSourceNetwork = this.isTransitToken(fromToken);

    if (canBridgeInSourceNetwork) {
      return { srcBridgeToken: fromToken.address } as SwapInfoBridge;
    }

    if (dexes.isProviderOneinch(srcProvider.providerIndex)) {
      const trade = srcProvider.tradeAndToAmount.trade as OneinchInstantTrade;
      return {
        dex: dexAddress,
        path: trade?.path?.map(token => token.address),
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

  private getDstSwapObject(
    dstProvider: IndexedTradeAndToAmount,
    toBlockchain: EthLikeBlockchainName,
    estimatedTokenAmount: BigNumber,
    toToken: TokenAmount
  ): SwapInfoDest {
    const swapVersion = this.getCelerSwapVersion(toBlockchain, dstProvider.providerIndex);
    const dexes = this.contractsDataService.contracts[toBlockchain];
    const dexAddress = dexes.getProvider(dstProvider.providerIndex).contractAddress;
    const amountOutMinimum = this.getAmountOutMinimum(estimatedTokenAmount);
    const canBridgeInTargetNetwork = this.isTransitToken(toToken);

    const dstSwap: SwapInfoDest = {
      dex: dexAddress,
      integrator: NULL_ADDRESS,
      version: swapVersion,
      path: [NULL_ADDRESS],
      pathV3: EMPTY_DATA,
      deadline: DEADLINE,
      amountOutMinimum: Web3Pure.toWei(amountOutMinimum, dexes.transitToken.decimals)
    };

    if (canBridgeInTargetNetwork) {
      return {
        dex: NULL_ADDRESS,
        integrator: NULL_ADDRESS,
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

  public async calculateTrade(
    fromBlockchain: EthLikeBlockchainName,
    toBlockchain: EthLikeBlockchainName,
    toToken: TokenAmount,
    fromToken: TokenAmount,
    fromTransitTokenAmount: BigNumber,
    toAmount: BigNumber,
    srcProvider: IndexedTradeAndToAmount,
    dstProvider: IndexedTradeAndToAmount,
    maxSlippage: number
  ): Promise<void> {
    const srcSwap = this.getSrcSwapObject(
      srcProvider,
      fromBlockchain,
      fromTransitTokenAmount,
      fromToken
    );
    const dstSwap = this.getDstSwapObject(dstProvider, toBlockchain, toAmount, toToken);

    this.celerTrade = {
      srcSwap,
      dstSwap,
      srcProvider,
      maxSlippage
    };
  }

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
    const fromTransitTokenAmountWithSlippage = fromTransitTokenAmount.minus(
      fromTransitTokenAmount.multipliedBy(this.userSlippage / 2)
    );

    return await this.celerApiService
      .getEstimateAmt(
        srcChainId,
        dstChainId,
        'USDC',
        celerBridgeSlippage * 1000000,
        Web3Pure.toWei(fromTransitTokenAmountWithSlippage, srcTransitTokenDecimals)
      )
      .toPromise();
  }

  public async getMinSwapAmountInTransitTokens(
    fromBlockchain: EthLikeBlockchainName
  ): Promise<BigNumber> {
    const celerContractAddress = this.getCelerContractAddress(fromBlockchain);
    const transitToken = transitTokens[fromBlockchain];
    const minAmount = await this.publicBlockchainAdapterService[fromBlockchain].callContractMethod(
      celerContractAddress,
      CELER_CONTRACT_ABI,
      'minSwapAmount',
      { methodArguments: [transitToken.address] }
    );
    const minAmountInTokens = Web3Pure.fromWei(minAmount, transitToken.decimals);

    return minAmountInTokens.minus(minAmountInTokens.multipliedBy(this.userSlippage / 2));
  }

  private async calculateMsgValue(
    fromBlockchain: EthLikeBlockchainName,
    toBlockchain: EthLikeBlockchainName,
    data: unknown,
    nativeIn: boolean,
    amountIn: string,
    isBridge: boolean
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

    const fee = await this.publicBlockchainAdapterService[fromBlockchain].callContractMethod(
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
      return Number(amountIn) + Number(fee) + Number(cryptoFee) + Number(feeBase);
    }

    if (isBridge) {
      return Number(fee) + Number(cryptoFee) + Number(feeBase) + Number(feeBase);
    }

    return Number(fee) + Number(cryptoFee) + Number(feeBase);
  }

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

  public getBlockchainId(blockchain: EthLikeBlockchainName): number {
    return networks.find(network => network.name === blockchain).id;
  }

  private isTransitToken(token: TokenAmount): boolean {
    return CELER_TRANSIT_TOKENS[token.blockchain].includes(token.address);
  }

  private getAmountOutMinimum(amount: BigNumber): BigNumber {
    const slippage = this.userSlippage / 2;

    return amount.minus(amount.multipliedBy(slippage));
  }

  private getCelerSwapVersion(blockchain: EthLikeBlockchainName, providerIndex: number): number {
    const ccrContract = this.contractsDataService.contracts[blockchain];

    if (ccrContract.isProviderUniV3(providerIndex)) {
      return SwapVersion.V3;
    }

    return SwapVersion.V2;
  }

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

  public getCelerContractAddress(blockchain: EthLikeBlockchainName): string {
    return CELER_CONTRACT[blockchain];
  }

  public isSupportedBlockchain(blockchain: BlockchainName): boolean {
    return CELER_SUPPORTED_BLOCKCHAINS.includes(blockchain);
  }

  private isNativeToken(blockchain: EthLikeBlockchainName, token: TokenAmount): boolean {
    return this.publicBlockchainAdapterService[blockchain].isNativeAddress(token.address);
  }

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

  public async getCelerBridgeSlippage(
    fromBlockchain: EthLikeBlockchainName,
    toBlockchain: EthLikeBlockchainName,
    amt: BigNumber
  ): Promise<number> {
    const srcChainId = this.getBlockchainId(fromBlockchain);
    const dstChainId = this.getBlockchainId(toBlockchain);
    const srcTransitTokenDecimals = transitTokens[fromBlockchain].decimals;
    const bridgeRate = await this.celerApiService
      .getEstimateAmt(
        srcChainId,
        dstChainId,
        'USDC',
        0,
        Web3Pure.toWei(amt, srcTransitTokenDecimals)
      )
      .pipe(pluck('bridge_rate'))
      .toPromise();

    return (1 - bridgeRate) * 100 * CELER_SLIPPAGE_ADDITIONAL_VALUE;
  }
}
