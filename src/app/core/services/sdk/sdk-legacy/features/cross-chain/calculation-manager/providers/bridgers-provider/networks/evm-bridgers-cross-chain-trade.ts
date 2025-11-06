import BigNumber from 'bignumber.js';
import { ContractParams } from '../../../../../common/models/contract-params';
import { bridgersNativeAddress } from '../../../../../common/providers/bridgers/constants/bridgers-native-address';
import { toBridgersBlockchain } from '../../../../../common/providers/bridgers/constants/to-bridgers-blockchain';
import {
  BridgersQuoteRequest,
  BridgersQuoteResponse
} from '../../../../../common/providers/bridgers/models/bridgers-quote-api';
import {
  BridgersSwapRequest,
  BridgersSwapResponse
} from '../../../../../common/providers/bridgers/models/bridgers-swap-api';
import { getFromWithoutFee } from '../../../../../common/utils/get-from-without-fee';
import { createTokenNativeAddressProxy } from '../../../../../common/utils/token-native-address-proxy';
import { CROSS_CHAIN_TRADE_TYPE } from '../../../models/cross-chain-trade-type';
import { BridgersCrossChainSupportedBlockchain } from '../constants/bridgers-cross-chain-supported-blockchain';
import { BridgersEvmCrossChainParams } from '../models/bridgers-cross-chain-trade-types';
import { EvmBridgersTransactionData } from '../models/evm-bridgers-transaction-data';
import { rubicProxyContractAddress } from '../../common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from '../../common/evm-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from '../../common/evm-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { EvmCrossChainTrade } from '../../common/evm-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from '../../common/evm-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from '../../common/models/bridge-type';
import { FeeInfo } from '../../common/models/fee-info';
import { GetContractParamsOptions } from '../../common/models/get-contract-params-options';
import { TradeInfo } from '../../common/models/trade-info';
import { ProxyCrossChainEvmTrade } from '../../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import {
  BLOCKCHAIN_NAME,
  BlockchainsInfo,
  EvmBlockchainName,
  PriceTokenAmount,
  Token
} from '@cryptorubic/core';
import { MarkRequired } from '../../../models/cross-chain-manager-options';
import {
  EvmAdapter,
  NotSupportedRegionError,
  NotSupportedTokensError,
  TronWeb3Pure
} from '@cryptorubic/web3';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import { firstValueFrom } from 'rxjs';

export class EvmBridgersCrossChainTrade extends EvmCrossChainTrade {
  public readonly type = CROSS_CHAIN_TRADE_TYPE.BRIDGERS;

  public readonly isAggregator = false;

  public readonly from: PriceTokenAmount<EvmBlockchainName>;

  public readonly to: PriceTokenAmount;

  public readonly toTokenAmountMin: BigNumber;

  public readonly gasData: GasData;

  public readonly feeInfo: FeeInfo;

  public readonly onChainSubtype = { from: undefined as any, to: undefined as any };

  public readonly bridgeType = BRIDGE_TYPE.BRIDGERS;

  public readonly priceImpact: number | null;

  private readonly slippage: number;

  protected get methodName(): string {
    return 'startBridgeTokensViaGenericCrossChain';
  }

  constructor(params: BridgersEvmCrossChainParams, sdkLegacyService: SdkLegacyService) {
    const { crossChainTrade, providerAddress, routePath, apiQuote, apiResponse } = params;
    super(providerAddress, routePath, apiQuote, apiResponse, sdkLegacyService);

    this.from = crossChainTrade.from;
    this.to = crossChainTrade.to;
    this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
    this.feeInfo = crossChainTrade.feeInfo;
    this.gasData = crossChainTrade.gasData;
    this.priceImpact = this.from.calculatePriceImpactPercent(this.to);
    this.slippage = crossChainTrade.slippage;
  }

  protected async getContractParams(
    options: MarkRequired<GetContractParamsOptions, 'receiverAddress'>
  ): Promise<ContractParams> {
    const {
      data,
      value: providerValue,
      to
    } = await this.setTransactionConfig(
      false,
      options?.useCacheData || false,
      options.testMode,
      options?.receiverAddress
    );

    const isEvmDestination = BlockchainsInfo.isEvmBlockchainName(this.to.blockchain);
    let receiverAddress = isEvmDestination
      ? options.receiverAddress || this.walletAddress
      : options.receiverAddress;
    let toAddress = this.to.address;

    if (this.to.blockchain === BLOCKCHAIN_NAME.TRON) {
      receiverAddress = TronWeb3Pure.addressToHex(receiverAddress);
      toAddress = TronWeb3Pure.addressToHex(toAddress);
    }

    const bridgeData = ProxyCrossChainEvmTrade.getBridgeData(
      { ...options, receiverAddress },
      {
        walletAddress: this.walletAddress,
        fromTokenAmount: this.from,
        toTokenAmount: this.to,
        toAddress,
        srcChainTrade: null,
        providerAddress: this.providerAddress,
        type: `native:${this.type}`,
        fromAddress: this.walletAddress
      }
    );

    const providerData = await ProxyCrossChainEvmTrade.getGenericProviderData(
      to!,
      data! as string,
      this.from.blockchain as EvmBlockchainName,
      to,
      '0',
      this.sdkLegacyService
    );

    const methodArguments = [bridgeData, providerData];

    const value = this.getSwapValue(providerValue);

    const transactionConfiguration = EvmAdapter.encodeMethodCall(
      rubicProxyContractAddress[this.from.blockchain].router,
      evmCommonCrossChainAbi,
      this.methodName,
      methodArguments,
      value
    );
    const sendingToken = this.from.isNative ? [] : [this.from.address];
    const sendingAmount = this.from.isNative ? [] : [this.from.stringWeiAmount];

    return {
      contractAddress: rubicProxyContractAddress[this.from.blockchain].gateway,
      contractAbi: gatewayRubicCrossChainAbi,
      methodName: 'startViaRubic',
      methodArguments: [sendingToken, sendingAmount, transactionConfiguration.data],
      value
    };
  }

  public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
    return fromUsd.dividedBy(this.to.tokenAmount);
  }

  public getTradeInfo(): TradeInfo {
    return {
      estimatedGas: this.estimatedGas,
      feeInfo: this.feeInfo,
      priceImpact: this.priceImpact ?? null,
      slippage: this.slippage * 100,
      routePath: this.routePath
    };
  }

  protected override async getTransactionConfigAndAmount(
    _testMode?: boolean,
    receiverAddress?: string
  ): Promise<{ config: EvmBridgersTransactionData; amount: string }> {
    const fromBlockchain = this.from.blockchain as BridgersCrossChainSupportedBlockchain;
    const toBlockchain = this.to.blockchain as BridgersCrossChainSupportedBlockchain;

    const fromWithoutFee = getFromWithoutFee(
      this.from,
      this.feeInfo.rubicProxy?.platformFee?.percent
    );
    const amountOutMin = Token.toWei(this.toTokenAmountMin, this.to.decimals);

    const fromTokenAddress = createTokenNativeAddressProxy(
      fromWithoutFee,
      bridgersNativeAddress,
      true
    ).address;

    const toTokenAddress = createTokenNativeAddressProxy(
      this.to,
      bridgersNativeAddress,
      this.to.blockchain !== BLOCKCHAIN_NAME.TRON
    ).address;

    const fromAddress = this.walletAddress;
    const swapRequest: BridgersSwapRequest = {
      fromTokenAddress,
      toTokenAddress,
      fromAddress,
      toAddress: receiverAddress!,
      fromTokenChain: toBridgersBlockchain[fromBlockchain],
      toTokenChain: toBridgersBlockchain[toBlockchain],
      fromTokenAmount: fromWithoutFee.stringWeiAmount,
      amountOutMin,
      equipmentNo: fromAddress.slice(0, 32),
      sourceFlag: 'rubic'
    };

    const swapData = await firstValueFrom(
      this.sdkLegacyService.httpClient.post<BridgersSwapResponse<EvmBridgersTransactionData>>(
        'https://sswap.swft.pro/api/sswap/swap',
        swapRequest
      )
    );
    if (swapData.resCode === 1146) {
      throw new NotSupportedRegionError();
    }
    if (!swapData.data?.txData) {
      throw new NotSupportedTokensError();
    }

    const config = swapData.data?.txData;

    const quoteRequest: BridgersQuoteRequest = {
      fromTokenAddress,
      toTokenAddress,
      fromTokenAmount: fromWithoutFee.stringWeiAmount,
      fromTokenChain: toBridgersBlockchain[fromBlockchain],
      toTokenChain: toBridgersBlockchain[toBlockchain]
    };
    const quoteResponse = await firstValueFrom(
      this.sdkLegacyService.httpClient.post<BridgersQuoteResponse>(
        'https://sswap.swft.pro/api/sswap/quote',
        quoteRequest
      )
    );
    const amount = quoteResponse.data?.txData?.amountOutMin;

    return { config, amount };
  }
}
