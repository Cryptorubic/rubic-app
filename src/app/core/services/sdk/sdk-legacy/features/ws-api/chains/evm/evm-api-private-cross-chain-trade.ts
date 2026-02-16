import {
  blockchainId,
  EvmBlockchainName,
  PriceTokenAmount,
  SwapRequestInterface,
  Token
} from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { CrossChainTradeType } from '../../../cross-chain/calculation-manager/models/cross-chain-trade-type';
import { EvmCrossChainTrade } from '../../../cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from '../../../cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { FeeInfo } from '../../../cross-chain/calculation-manager/providers/common/models/fee-info';
import { OnChainSubtype } from '../../../cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { TradeInfo } from '../../../cross-chain/calculation-manager/providers/common/models/trade-info';
import { EvmApiCrossChainConstructor } from './evm-api-cross-chain-constructor';
import { SdkLegacyService } from '../../../../sdk-legacy.service';
import { RubicApiService } from '../../../../rubic-api/rubic-api.service';
import {
  ERC20Token,
  networkRegistry,
  RelayerTransaction,
  SubAccount,
  TokenChanges
} from '@hinkal/common';
import { EvmTransactionConfig, SwapTransactionOptions } from '@cryptorubic/web3';
import { HinkalSDKService } from '@app/core/services/hinkal-sdk/hinkal-sdk.service';

export class EvmApiPrivateCrossChainTrade extends EvmCrossChainTrade {
  public readonly feeInfo: FeeInfo;

  public readonly from: PriceTokenAmount<EvmBlockchainName>;

  public readonly gasData: GasData;

  public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

  public readonly to: PriceTokenAmount;

  public readonly toTokenAmountMin: BigNumber;

  public readonly type: CrossChainTradeType;

  public readonly priceImpact: number | null;

  public readonly slippage: number;

  public readonly bridgeType: CrossChainTradeType;

  public readonly isAggregator = false;

  protected readonly isWalletAuth: boolean;

  public override get needAuthWallet(): boolean {
    return this.isWalletAuth;
  }

  constructor(
    params: EvmApiCrossChainConstructor,
    sdkLegacyService: SdkLegacyService,
    rubicApiService: RubicApiService,
    private readonly hinkalSdk: HinkalSDKService
  ) {
    super(
      params.apiQuote.integratorAddress!,
      params.routePath,
      params.apiQuote,
      params.apiResponse,
      sdkLegacyService,
      rubicApiService
    );

    this.type = params.apiResponse.providerType as CrossChainTradeType;
    this.bridgeType = this.type;
    this.toTokenAmountMin = Token.fromWei(
      params.apiResponse.estimate.destinationWeiMinAmount,
      params.to.decimals
    );
    this.priceImpact = params.apiResponse.estimate.priceImpact;
    this.slippage = params.apiResponse.estimate.slippage;

    this.to = params.to;
    this.feeInfo = params.feeInfo;
    this.from = params.from;
    this.gasData = null;
    this.isWalletAuth = Boolean(params.needAuthWallet);
  }

  public getTradeInfo(): TradeInfo {
    return {
      estimatedGas: null,
      feeInfo: this.feeInfo,
      priceImpact: this.priceImpact,
      slippage: this.slippage * 100,
      routePath: this.routePath
    };
  }

  public override async swap(options?: SwapTransactionOptions): Promise<string | never> {
    try {
      if (!this.hinkalSdk.hinkalSDK) throw new Error();
      const hinkalSdk = this.hinkalSdk.hinkalSDK;
      const keys = hinkalSdk.userKeys;

      // const hasAccessToken = await hinkalSdk.checkAccessToken()
      // if (!hasAccessToken) {
      //   const resp = hinkalSdk.getSupportedPassportLinks();
      //   // const { signatureData } = await hinkalSdk
      //   //   .gerutAPI()
      //   //   .getAccessTokenSignature(
      //   //     chainId,
      //   //     ethAddress,
      //   //     '0xe5618AB3Fe92CC1EeE539a5322E54587247A6dfd'
      //   //   );

      //   // const res = await hinkalSdk.mintHinkalAccessToken(signatureData, true);
      //   // const status = await res.wait().catch(err => console.log(err));

      //   // // await openDefaultPassportWindow(resp[2], 'Zk me');

      //   // // const key = hinkalSdk.mintHinkalAccessToken()
      //   // console.log(status);
      // }

      await hinkalSdk.resetMerkleTreesIfNecessary();

      const fromToken: ERC20Token = {
        chainId: blockchainId[this.from.blockchain],
        erc20TokenAddress: this.from.address,
        name: this.from.name,
        symbol: this.from.symbol,
        decimals: this.from.decimals
      };

      const toToken: ERC20Token = {
        chainId: blockchainId[this.to.blockchain],
        erc20TokenAddress: this.to.address,
        name: this.to.name,
        symbol: this.to.symbol,
        decimals: this.to.decimals
      };

      const emporiumAddress =
        networkRegistry[blockchainId[this.from.blockchain]].contractData.emporiumAddress;

      const { data, value, to } = await this.encode({
        ...options,
        fromAddress: emporiumAddress,
        receiverAddress: options.receiverAddress || this.walletAddress
      });

      const subAccount: SubAccount = {
        index: 0,
        ethAddress: keys.getShieldedPublicKey(),
        privateKey: keys.getShieldedPrivateKey(),
        name: 'User',
        createdAt: new Date().toISOString(),
        isHidden: false,
        isImported: false
      };

      const fromTokenChanges: TokenChanges<bigint> = {
        token: fromToken,
        amount: -BigInt(this.from.stringWeiAmount)
      };

      const toTokenChanges: TokenChanges<bigint> = {
        token: toToken,
        amount: BigInt(this.to.stringWeiAmount)
      };

      const resp = (await hinkalSdk.actionFundApproveAndTransact(
        [fromTokenChanges, toTokenChanges],
        subAccount,
        to,
        to,
        data,
        BigInt(value),
        undefined,
        undefined,
        true,
        undefined,
        undefined,
        false
      )) as RelayerTransaction;

      options.onConfirm(resp.transactionHash);
      console.log(resp);
      return resp.transactionHash;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  protected async getTransactionConfigAndAmount(
    _testMode?: boolean,
    receiverAddress?: string
  ): Promise<{ config: EvmTransactionConfig; amount: string }> {
    const swapRequestData: SwapRequestInterface = {
      ...this.apiQuote,
      fromAddress: this.walletAddress,
      receiver: receiverAddress,
      id: this.apiResponse.id,
      enableChecks: false,
      ...(this.signature && { signature: this.signature })
    };
    const swapData = await this.fetchSwapData<EvmTransactionConfig>(swapRequestData);

    this._uniqueInfo = swapData.uniqueInfo ?? {};
    const amount = swapData.estimate.destinationWeiAmount;

    const config = {
      data: swapData.transaction.data!,
      value: swapData.transaction.value!,
      to: swapData.transaction.to!,
      gas: swapData.fees.gasTokenFees.gas.gasLimit!
    };

    return { config, amount };
  }
}
