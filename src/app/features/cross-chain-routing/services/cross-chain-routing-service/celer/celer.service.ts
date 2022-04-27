import { Injectable } from '@angular/core';
import { Web3Pure } from '@app/core/services/blockchain/blockchain-adapters/common/web3-pure';
import { EthLikeWeb3Pure } from '@app/core/services/blockchain/blockchain-adapters/eth-like/web3-pure/eth-like-web3-pure';
import { PrivateBlockchainAdapterService } from '@app/core/services/blockchain/blockchain-adapters/private-blockchain-adapter.service';
import { PublicBlockchainAdapterService } from '@app/core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { TokensService } from '@app/core/services/tokens/tokens.service';
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
import { ContractsDataService } from '../contracts-data/contracts-data.service';
import { IndexedTradeAndToAmount } from '../cross-chain-routing.service';
import { CelerApiService } from './celer-api.service';
import { CELER_CONTRACT } from './constants/CELER_CONTRACT';
import { CELER_CONTRACT_ABI } from './constants/CELER_CONTRACT_ABI';
import { CELER_SUPPORTED_BLOCKCHAINS } from './constants/CELER_SUPPORTED_BLOCKCHAINS';
import { CELER_TRANSIT_TOKENS } from './constants/CELER_TRANSIT_TOKENS';
import { MESSAGE_BUS_CONTRACT_ABI } from './constants/MESSAGE_BUS_CONTRACT_ABI';
import { CelerSwapMethod } from './models/celer-swap-method.enum';
import { SwapVersion } from './models/provider-type.enum';
import { SwapInfoBridge } from './models/swap-info-bridge.interface';
import { SwapInfoDest } from './models/swap-info-dest.interface';
import { SwapInfoInch } from './models/swap-info-inch.interface';
import { SwapInfoV2 } from './models/swap-info-v2.interface';
import { SwapInfoV3 } from './models/swap-info-v3.interface';

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

const EMPTY_DATA = '0x';

const CELER_SLIPPAGE_ADDITIONAL_VALUE = 1.01;

const CELER_SLIPPAGE = 0.15;

const DEADLINE = 999999999999999;

export interface CelerTrade {
  srcSwap: SwapInfoInch | SwapInfoV2 | SwapInfoV3 | SwapInfoBridge;
  dstSwap: SwapInfoDest;
  estimatedTokenAmount: BigNumber;
  estimatedTransitTokenAmount: BigNumber;
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
    private readonly tokensService: TokensService,
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

    const preparedArgs = this.prepareArgs([
      receiver,
      amountIn,
      dstChainId,
      Object.values(this.celerTrade.srcSwap).length === 1
        ? (this.celerTrade.srcSwap as SwapInfoBridge).srcBridgeToken
        : Object.values(this.celerTrade.srcSwap),
      Object.values(this.celerTrade.dstSwap),
      1000000,
      nativeOut
    ]);

    const msgValue = await this.calculateMsgValue(
      fromBlockchain,
      toBlockchain,
      preparedArgs,
      nativeIn,
      amountIn
    );

    console.log('message value', msgValue);

    let transactionHash: string;

    await this.privateBlockchainAdapterService[fromBlockchain].tryExecuteContractMethod(
      caller,
      CELER_CONTRACT_ABI,
      this.getSwapMethod(fromBlockchain, this.celerTrade.srcProvider.providerIndex, nativeIn),
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
      const pathV3 = EthLikeWeb3Pure.asciiToBytes32(
        JSON.stringify(srcProvider.tradeAndToAmount.trade?.path?.map(token => token.address))
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
    estimatedTransitTokenAmount: BigNumber,
    toToken: TokenAmount
  ): SwapInfoDest {
    const swapVersion = this.getCelerSwapVersion(toBlockchain, dstProvider.providerIndex);
    const dexes = this.contractsDataService.contracts[toBlockchain];
    const dexAddress = dexes.getProvider(dstProvider.providerIndex).contractAddress;
    const amountOutMinimum = this.getAmountOutMinimum(estimatedTransitTokenAmount);
    const canBridgeInTargetNetwork = this.isTransitToken(toToken);

    const dstSwap: SwapInfoDest = {
      dex: dexAddress,
      integrator: NULL_ADDRESS,
      version: swapVersion,
      path: [NULL_ADDRESS],
      dataInchOrPathV3: EMPTY_DATA,
      deadline: DEADLINE,
      amountOutMinimum: Web3Pure.toWei(amountOutMinimum, dexes.transitToken.decimals)
    };

    if (canBridgeInTargetNetwork) {
      return {
        dex: NULL_ADDRESS,
        integrator: NULL_ADDRESS,
        version: SwapVersion.BRIDGE,
        path: [toToken.address],
        dataInchOrPathV3: EMPTY_DATA,
        deadline: 0,
        amountOutMinimum: '0'
      };
    }
    debugger;
    if (dexes.isProviderUniV2(dstProvider.providerIndex)) {
      dstSwap.path = dstProvider.tradeAndToAmount.trade.path.map(token => token.address);
    }

    if (dexes.isProviderUniV3(dstProvider.providerIndex)) {
      const pathV3 = EthLikeWeb3Pure.asciiToBytes32(
        JSON.stringify(dstProvider.tradeAndToAmount.trade?.path?.map(token => token.address))
      );
      dstSwap.dataInchOrPathV3 = pathV3;
    }

    return dstSwap;
  }

  public async calculateTrade(
    fromBlockchain: EthLikeBlockchainName,
    toBlockchain: EthLikeBlockchainName,
    toToken: TokenAmount,
    fromToken: TokenAmount,
    fromTransitTokenAmount: BigNumber,
    srcProvider: IndexedTradeAndToAmount,
    dstProvider: IndexedTradeAndToAmount
  ): Promise<{
    estimatedTransitTokenAmount: BigNumber;
    estimatedTokenAmount: BigNumber;
    estimatedTokenAmountWithoutSlippage: BigNumber;
  }> {
    const srcChainId = this.getBlockchainId(fromBlockchain);
    const dstChainId = this.getBlockchainId(toBlockchain);
    const celerSlippage = CELER_SLIPPAGE * 1000000;
    const srcTransitTokenDecimals =
      this.contractsDataService.contracts[fromBlockchain].transitToken.decimals;
    const dstTransitTokenDecimals =
      this.contractsDataService.contracts[toBlockchain].transitToken.decimals;

    const estimatedData = await this.celerApiService
      .getEstimateAmt(
        srcChainId,
        dstChainId,
        'USDC',
        celerSlippage,
        Web3Pure.toWei(fromTransitTokenAmount, srcTransitTokenDecimals)
      )
      .toPromise();

    console.log('Celer`s estimate', estimatedData);

    const toTokenPrice = await this.tokensService.getAndUpdateTokenPrice({
      address: toToken.address,
      blockchain: toBlockchain
    });

    const estimatedTransitTokenAmount = Web3Pure.fromWei(
      estimatedData.estimated_receive_amt,
      dstTransitTokenDecimals
    );
    const estimatedTokenAmount = estimatedTransitTokenAmount.dividedBy(toTokenPrice);
    const estimatedTokenAmountWithoutSlippage = estimatedTokenAmount.minus(
      estimatedTokenAmount.multipliedBy(this.userSlippage / 2)
    );

    const srcSwap = this.getSrcSwapObject(
      srcProvider,
      fromBlockchain,
      fromTransitTokenAmount,
      fromToken
    );
    const dstSwap = this.getDstSwapObject(
      dstProvider,
      toBlockchain,
      estimatedTransitTokenAmount,
      toToken
    );

    this.celerTrade = {
      srcSwap,
      dstSwap,
      estimatedTokenAmount,
      estimatedTransitTokenAmount,
      srcProvider,
      maxSlippage: estimatedData.max_slippage
    };

    return {
      estimatedTransitTokenAmount,
      estimatedTokenAmount,
      estimatedTokenAmountWithoutSlippage
    };
  }

  public async getMinSwapAmount(fromToken: TokenAmount): Promise<BigNumber> {
    const fromBlockchain = fromToken.blockchain as EthLikeBlockchainName;
    const celerContractAddress = this.getCelerContractAddress(fromBlockchain);

    return await this.publicBlockchainAdapterService[fromBlockchain].callContractMethod(
      celerContractAddress,
      CELER_CONTRACT_ABI,
      'minSwapAmount'
    );
  }

  private async calculateMsgValue(
    fromBlockchain: EthLikeBlockchainName,
    toBlockchain: EthLikeBlockchainName,
    data: unknown,
    nativeIn: boolean,
    amountIn: string
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
    return Number(fee) + Number(cryptoFee) + Number(feeBase);
  }

  public async getCelerSlippage(
    srcChainId: number,
    dstChainId: number,
    tokenSymbol: string,
    amt: string
  ): Promise<number> {
    const bridgeRate = await this.celerApiService
      .getEstimateAmt(srcChainId, dstChainId, tokenSymbol, 0, amt)
      .pipe(pluck('bridge_rate'))
      .toPromise();

    return (1 - bridgeRate) * 100 * CELER_SLIPPAGE_ADDITIONAL_VALUE;
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
    console.log('transaction data', args);
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
}
