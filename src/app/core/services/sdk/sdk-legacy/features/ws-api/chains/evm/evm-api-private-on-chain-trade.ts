import {
  blockchainId,
  EvmBlockchainName,
  OnChainTradeType,
  PriceTokenAmount,
  SwapRequestInterface
} from '@cryptorubic/core';
import { GasData } from '../../../cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { FeeInfo } from '../../../cross-chain/calculation-manager/providers/common/models/fee-info';
import { OnChainSubtype } from '../../../cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { EvmOnChainTrade } from '../../../on-chain/calculation-manager/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { EvmApiOnChainConstructor } from './evm-api-on-chain-constructor';
import { SdkLegacyService } from '../../../../sdk-legacy.service';
import { RubicApiService } from '../../../../rubic-api/rubic-api.service';
import { SwapTransactionOptions } from '../../../common/models/swap-transaction-options';
import {
  ERC20Token,
  emporiumOp,
  SubAccount,
  TokenChanges,
  RelayerTransaction,
  generateFundApproveAndTransactOps,
  getNecessaryAssetsForFunding,
  UserKeys,
  networkRegistry,
  WRAPPER_TOKEN_EXCHANGE_ADDRESSES
} from '@hinkal/common';
import { EncodeTransactionOptions, EvmTransactionConfig } from '@cryptorubic/web3';
import { EvmEncodedConfigAndToAmount } from '../../../on-chain/calculation-manager/models/aggregator-on-chain-types';
import { HinkalSDKService } from '@app/core/services/hinkal-sdk/hinkal-sdk.service';

export class EvmApiPrivateOnChainTrade extends EvmOnChainTrade {
  public override readonly feeInfo: FeeInfo;

  public override readonly from: PriceTokenAmount<EvmBlockchainName>;

  public readonly gasData: GasData;

  public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

  public override readonly to: PriceTokenAmount<EvmBlockchainName>;

  public readonly type: OnChainTradeType;

  private readonly _priceImpact: number | null;

  public override get priceImpact(): number | null {
    return this._priceImpact;
  }

  public readonly slippage: number;

  public readonly isAggregator = false;

  public readonly dexContractAddress: string;

  constructor(
    params: EvmApiOnChainConstructor,
    sdkLegacyService: SdkLegacyService,
    rubicApiService: RubicApiService,
    private readonly hinkalSdk: HinkalSDKService
  ) {
    super(
      {
        ...params,
        path: params.routePath,
        gasFeeInfo: null,
        useProxy: params.useProxy,
        slippageTolerance: params.apiResponse!.estimate.slippage,
        withDeflation: { from: { isDeflation: false }, to: { isDeflation: false } },
        fromWithoutFee: params.from
      },
      sdkLegacyService,
      rubicApiService
    );
    this.dexContractAddress = params.apiResponse!.transaction.approvalAddress!;

    this.type = params.apiResponse!.providerType as OnChainTradeType;
    this._priceImpact = params.apiResponse!.estimate.priceImpact;
    this.slippage = params.apiResponse!.estimate.slippage;

    this.to = params.to;
    this.feeInfo = params.feeInfo;
    this.from = params.from;
    this.gasData = null;
  }

  public override async swap(options?: SwapTransactionOptions): Promise<string | never> {
    try {
      if (!this.hinkalSdk.hinkalSDK) throw new Error();
      const hinkalSdk = this.hinkalSdk.hinkalSDK;

      // const hasAccessToken = await hinkalSdk.checkAccessToken();
      // if (!hasAccessToken) {
      //   const resp = hinkalSdk.getSupportedPassportLinks();
      //   // const { signatureData } = await hinkalSdk
      //   //   .getAPI()
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

      const chainId = blockchainId[this.from.blockchain];
      const keys = hinkalSdk.userKeys;

      const fromToken: ERC20Token = {
        chainId: chainId,
        erc20TokenAddress: this.from.address,
        name: this.from.name,
        symbol: this.from.symbol,
        decimals: this.from.decimals
      };

      const toToken: ERC20Token = {
        chainId: chainId,
        erc20TokenAddress: this.to.address,
        name: this.to.name,
        symbol: this.to.symbol,
        decimals: this.to.decimals
      };

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

      const emporiumAddress = networkRegistry[chainId].contractData.emporiumAddress;

      await hinkalSdk.resetMerkleTreesIfNecessary();

      const [necessaryAssets, rubicSwapData] = await Promise.all([
        getNecessaryAssetsForFunding(hinkalSdk, subAccount, [fromTokenChanges, toTokenChanges]),
        this.encode({
          ...options,
          fromAddress: emporiumAddress,
          receiverAddress: emporiumAddress
        })
      ]);

      const ops = generateFundApproveAndTransactOps(
        hinkalSdk,
        necessaryAssets.tokensToFund.map(token => token.erc20TokenAddress),
        necessaryAssets.fundAmounts,
        necessaryAssets.approveTokenAddresses,
        necessaryAssets.approvedTokenAmounts,
        UserKeys.getSignerAddressFromPrivateKey(chainId, keys.getShieldedPrivateKey()),
        rubicSwapData.to,
        rubicSwapData.to,
        rubicSwapData.data,
        BigInt(rubicSwapData.value)
      );

      ops.push(
        emporiumOp({
          contract: WRAPPER_TOKEN_EXCHANGE_ADDRESSES[chainId],
          func: 'withdrawBalanceDifference',
          args: [0n],
          invokeWallet: true
        })
      );

      const txResult = (await hinkalSdk.actionPrivateWallet(
        [fromToken.erc20TokenAddress, toToken.erc20TokenAddress],
        [fromTokenChanges.amount, toTokenChanges.amount],
        [false, true],
        ops,
        [fromTokenChanges, toTokenChanges],
        subAccount,
        undefined,
        undefined,
        undefined,
        true,
        undefined,
        undefined,
        undefined,
        false
      )) as RelayerTransaction;

      options.onConfirm(txResult.transactionHash);
      console.log(txResult);
      return txResult.transactionHash;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  protected override async getTransactionConfigAndAmount(
    options?: EncodeTransactionOptions
  ): Promise<EvmEncodedConfigAndToAmount> {
    if (!this.apiResponse || !this.apiQuote) {
      throw new Error('Failed to load api response');
    }
    const swapRequestData: SwapRequestInterface = {
      ...this.apiQuote,
      fromAddress: this.walletAddress,
      receiver: options?.receiverAddress || this.walletAddress,
      id: this.apiResponse.id,
      enableChecks: false
    };
    const swapData = await this.fetchSwapData<EvmTransactionConfig>(swapRequestData);

    const config: EvmTransactionConfig = {
      data: swapData.transaction.data!,
      value: swapData.transaction.value!,
      to: swapData.transaction.to!,
      gas: swapData.fees.gasTokenFees.gas.gasLimit!
    };

    const amount = swapData.estimate.destinationWeiAmount;

    return { tx: config, toAmount: amount };
  }
}
