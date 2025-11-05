import BigNumber from 'bignumber.js';
import { rubicProxyContractAddress } from '../constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from '../evm-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { FeeInfo } from '../models/fee-info';
import { GetContractParamsOptions } from '../models/get-contract-params-options';
import { ProxyBridgeParams } from '../models/proxy-bridge-params';
import { ProxySwapParams } from '../models/proxy-swap-params';
import { oneinchApiParams } from '../../../../../on-chain/calculation-manager/constants/constants';
import {
  EvmAdapter,
  UnapprovedContractError,
  UnapprovedMethodError,
  Web3Pure
} from '@cryptorubic/web3';
import { Abi, stringToHex } from 'viem';
import {
  BLOCKCHAIN_NAME,
  blockchainId,
  BlockchainName,
  EvmBlockchainName,
  nativeTokensList,
  PriceTokenAmount,
  Token
} from '@cryptorubic/core';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';

type BridgeParams = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  number,
  boolean,
  boolean
];

export class ProxyCrossChainEvmTrade {
  constructor() {}

  public static async getFeeInfo(
    fromBlockchain: BlockchainName,
    providerAddress: string,
    percentFeeToken: PriceTokenAmount,
    useProxy: boolean,
    sdkLegacyService: SdkLegacyService
  ): Promise<FeeInfo> {
    const fixedFeeAmount = useProxy
      ? await this.getFixedFee(
          fromBlockchain,
          providerAddress,
          rubicProxyContractAddress[fromBlockchain].router,
          evmCommonCrossChainAbi,
          sdkLegacyService
        )
      : new BigNumber(0);

    const feePercent = useProxy
      ? await this.getFeePercent(
          fromBlockchain,
          providerAddress,
          rubicProxyContractAddress[fromBlockchain].router,
          evmCommonCrossChainAbi,
          sdkLegacyService
        )
      : 0;
    const nativeToken = await sdkLegacyService.tokenService.createPriceToken(
      nativeTokensList[fromBlockchain]
    );

    return {
      rubicProxy: {
        fixedFee: {
          amount: fixedFeeAmount,
          token: nativeToken
        },
        platformFee: {
          percent: feePercent,
          token: percentFeeToken
        }
      }
    };
  }

  /**
   * Gets fixed fee information.
   * @param fromBlockchain Source network blockchain.
   * @param providerAddress Integrator address.
   * @param contractAddress Contract address.
   * @param contractAbi Contract ABI.
   * @protected
   * @internal
   */
  private static async getFixedFee(
    fromBlockchain: BlockchainName,
    providerAddress: string,
    contractAddress: string,
    contractAbi: Abi,
    sdkLegacyService: SdkLegacyService
  ): Promise<BigNumber> {
    const evmAdapter = sdkLegacyService.adaptersFactoryService.getAdapter(
      fromBlockchain as EvmBlockchainName
    );
    const nativeToken = nativeTokensList[fromBlockchain];

    if (!Web3Pure.isEmptyAddress(fromBlockchain, providerAddress)) {
      const integratorInfo = await evmAdapter.callContractMethod<{
        isIntegrator: boolean;
        fixedFeeAmount: string;
      }>(contractAddress, contractAbi, 'integratorToFeeInfo', [providerAddress]);
      if (integratorInfo.isIntegrator) {
        return Token.fromWei(integratorInfo.fixedFeeAmount, nativeToken.decimals);
      }
    }

    return Token.fromWei(
      await evmAdapter.callContractMethod<string>(contractAddress, contractAbi, 'fixedNativeFee'),
      nativeToken.decimals
    );
  }

  /**
   * Gets percent fee.
   * @param fromBlockchain Source network blockchain.
   * @param providerAddress Integrator address.
   * @param contractAddress Contract address.
   * @param contractAbi Contract ABI.
   * @protected
   * @internal
   */
  private static async getFeePercent(
    fromBlockchain: BlockchainName,
    providerAddress: string,
    contractAddress: string,
    contractAbi: Abi,
    sdkLegacyService: SdkLegacyService
  ): Promise<number> {
    const evmAdapter = sdkLegacyService.adaptersFactoryService.getAdapter(
      fromBlockchain as EvmBlockchainName
    );

    if (!Web3Pure.isEmptyAddress(fromBlockchain, providerAddress)) {
      const integratorInfo = await evmAdapter.callContractMethod<{
        isIntegrator: boolean;
        tokenFee: string;
      }>(contractAddress, contractAbi, 'integratorToFeeInfo', [providerAddress]);
      if (integratorInfo.isIntegrator) {
        return new BigNumber(integratorInfo.tokenFee).toNumber() / 10_000;
      }
    }

    return (
      new BigNumber(
        await evmAdapter.callContractMethod<string>(
          contractAddress,
          contractAbi,
          'RubicPlatformFee'
        )
      ).toNumber() / 10_000
    );
  }

  public static async getWhitelistedDexes(
    fromBlockchain: EvmBlockchainName,
    sdkLegacyService: SdkLegacyService
  ): Promise<string[]> {
    const evmAdapter = sdkLegacyService.adaptersFactoryService.getAdapter(
      fromBlockchain as EvmBlockchainName
    );

    return evmAdapter.callContractMethod<string[]>(
      rubicProxyContractAddress[fromBlockchain].router,
      evmCommonCrossChainAbi,
      'approvedDexs'
    );
  }

  public static getBridgeData(
    swapOptions: GetContractParamsOptions,
    tradeParams: ProxyBridgeParams
  ): BridgeParams {
    const toChainId = blockchainId[tradeParams.toTokenAmount.blockchain] || 9999;
    const fromToken = tradeParams.srcChainTrade
      ? tradeParams.srcChainTrade.toTokenAmountMin
      : tradeParams.fromTokenAmount;
    const hasSwapBeforeBridge = tradeParams.srcChainTrade !== null;
    const toAddress = tradeParams.toAddress || tradeParams.toTokenAmount.address;
    const receiverAddress = this.getReceiverAddress(
      swapOptions?.receiverAddress,
      tradeParams.walletAddress,
      toChainId
    );

    return [
      EvmAdapter.randomHex(32),
      tradeParams.type.toLowerCase(),
      tradeParams.providerAddress,
      this.getReferrerAddress(swapOptions?.referrer),
      fromToken.isNative && fromToken.blockchain === BLOCKCHAIN_NAME.METIS
        ? toAddress
        : fromToken.address,
      toAddress,
      receiverAddress,
      tradeParams.fromAddress,
      fromToken.stringWeiAmount,
      toChainId,
      hasSwapBeforeBridge,
      Boolean(tradeParams?.dstChainTrade)
    ];
  }

  private static getReferrerAddress(referrer: string | undefined): string {
    if (referrer) {
      return '0x' + stringToHex(referrer).slice(2, 42).padStart(40, '0');
    }

    return '0x0000000000000000000000000000000000000000';
  }

  public static async getSwapData(
    swapOptions: GetContractParamsOptions,
    tradeParams: ProxySwapParams,
    sdkLegacyService: SdkLegacyService
  ): Promise<[[string, string, string, string, string, string, boolean]]> {
    const fromAddress =
      swapOptions.fromAddress || tradeParams.walletAddress || oneinchApiParams.nativeAddress;
    const swapData = await tradeParams.onChainEncodeFn({
      fromAddress,
      receiverAddress: tradeParams.contractAddress,
      supportFee: false
    });

    const routerAddress = swapData.to;
    const signature = swapData.data.slice(0, 10);

    await this.checkDexWhiteList(
      tradeParams.fromTokenAmount.blockchain,
      routerAddress,
      signature,
      sdkLegacyService
    );

    return [
      [
        routerAddress,
        routerAddress,
        tradeParams.fromTokenAmount.address,
        tradeParams.toTokenAmount.address,
        tradeParams.fromTokenAmount.stringWeiAmount,
        swapData.data,
        true
      ]
    ];
  }

  public static async getGenericProviderData(
    providerAddress: string,
    providerData: string,
    fromBlockchain: EvmBlockchainName,
    gatewayAddress: string,
    extraNative: string,
    sdkLegacyService: SdkLegacyService
  ): Promise<[string, string, string, string]> {
    await this.checkCrossChainWhiteList(
      fromBlockchain,
      providerAddress,
      providerData.slice(0, 10),
      sdkLegacyService
    );

    return [providerAddress, gatewayAddress, extraNative, providerData];
  }

  public static async checkCrossChainWhiteList(
    fromBlockchain: EvmBlockchainName,
    routerAddress: string,
    offset: string,
    sdkLegacyService: SdkLegacyService
  ): Promise<void | never> {
    const evmAdapter = sdkLegacyService.adaptersFactoryService.getAdapter(
      fromBlockchain as EvmBlockchainName
    );
    const result = await evmAdapter.callContractMethod<{ isAvailable: boolean }>(
      rubicProxyContractAddress[fromBlockchain].router,
      evmCommonCrossChainAbi,
      'getSelectorInfo',
      [routerAddress, offset]
    );
    if (!result.isAvailable) {
      throw new UnapprovedContractError(offset);
    }
  }

  public static async checkDexWhiteList(
    fromBlockchain: EvmBlockchainName,
    routerAddress: string,
    method: string,
    sdkLegacyService: SdkLegacyService
  ): Promise<never | void> {
    const evmAdapter = sdkLegacyService.adaptersFactoryService.getAdapter(
      fromBlockchain as EvmBlockchainName
    );

    let isRouterApproved = false;
    try {
      isRouterApproved = await evmAdapter.callContractMethod<boolean>(
        rubicProxyContractAddress[fromBlockchain].router,
        evmCommonCrossChainAbi,
        'isContractApproved',
        [routerAddress]
      );
    } catch {
      /* empty */
    }
    if (!isRouterApproved) {
      throw new UnapprovedContractError(routerAddress);
    }

    let isMethodApproved = false;
    try {
      isMethodApproved = await evmAdapter.callContractMethod<boolean>(
        rubicProxyContractAddress[fromBlockchain].router,
        evmCommonCrossChainAbi,
        'isFunctionApproved',
        [method]
      );
    } catch {
      /* empty */
    }
    if (!isMethodApproved) {
      throw new UnapprovedMethodError(method);
    }
  }

  private static getReceiverAddress(
    receiverAddress: string | undefined,
    walletAddress: string,
    toChainId: number
  ): string {
    if (
      toChainId === blockchainId[BLOCKCHAIN_NAME.BITCOIN] ||
      toChainId === blockchainId[BLOCKCHAIN_NAME.SOLANA] ||
      toChainId === blockchainId[BLOCKCHAIN_NAME.TON]
    ) {
      return walletAddress;
    }

    return receiverAddress || walletAddress;
  }
}
