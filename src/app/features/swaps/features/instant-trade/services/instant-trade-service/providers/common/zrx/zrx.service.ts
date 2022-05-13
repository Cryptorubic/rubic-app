import { inject, Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import { ItOptions } from '@features/swaps/features/instant-trade/services/instant-trade-service/models/it-provider';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

import { ZrxApiResponse } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/zrx/models/zrx-types';
import InstantTradeToken from '@features/swaps/features/instant-trade/models/instant-trade-token';
import InstantTrade from '@features/swaps/features/instant-trade/models/instant-trade';
import { ZrxCalculateTradeParams } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/zrx/models/zrx-calculate-trade-params';
import { ZRX_API_ADDRESS } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/zrx/constants/zrx-api-addresses';
import { ZRX_NATIVE_TOKEN } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/zrx/constants/zrx-native-token';
import { ENVIRONMENT } from 'src/environments/environment';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { EthLikeInstantTradeProviderService } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/eth-like-instant-trade-provider/eth-like-instant-trade-provider.service';
import { ZRX_CONTRACT_ADDRESS } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/zrx/constants/zrx-contract-address';
import { HttpService } from '@core/services/http/http.service';
import { SupportedZrxBlockchain } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/zrx/constants/supported-zrx-blockchain';

const AFFILIATE_ADDRESS = ENVIRONMENT.zrxAffiliateAddress;

@Injectable()
export abstract class ZrxService extends EthLikeInstantTradeProviderService {
  public readonly providerType = INSTANT_TRADE_PROVIDER.ZRX;

  public readonly contractAddress = ZRX_CONTRACT_ADDRESS;

  protected readonly gasMargin = 1.4;

  private currentTradeData: ZrxApiResponse;

  private readonly apiAddress: string;

  // Injected services start
  private readonly httpService = inject(HttpService);
  // Injected services end

  private get slippageTolerance(): number {
    return this.settings.slippageTolerance / 100;
  }

  protected constructor(protected readonly blockchain: SupportedZrxBlockchain) {
    super(blockchain);

    this.apiAddress = ZRX_API_ADDRESS[this.blockchain];
  }

  public async calculateTrade(
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken,
    shouldCalculateGas: boolean
  ): Promise<InstantTrade> {
    const fromTokenClone = { ...fromToken };
    const toTokenClone = { ...toToken };

    if (this.web3Public.isNativeAddress(fromToken.address)) {
      fromTokenClone.address = ZRX_NATIVE_TOKEN;
    }
    if (this.web3Public.isNativeAddress(toToken.address)) {
      toTokenClone.address = ZRX_NATIVE_TOKEN;
    }

    const params: ZrxCalculateTradeParams = {
      sellToken: fromTokenClone.address,
      buyToken: toTokenClone.address,
      sellAmount: Web3Pure.toWei(fromAmount, fromToken.decimals),
      slippagePercentage: this.slippageTolerance.toString()
    };
    if (AFFILIATE_ADDRESS) {
      params.affiliateAddress = AFFILIATE_ADDRESS;
    }
    this.currentTradeData = await this.fetchTrade(params);

    const trade: InstantTrade = {
      blockchain: BLOCKCHAIN_NAME.ETHEREUM,
      from: {
        token: fromToken,
        amount: Web3Pure.fromWei(this.currentTradeData.sellAmount, fromToken.decimals)
      },
      to: {
        token: toToken,
        amount: Web3Pure.fromWei(this.currentTradeData.buyAmount, toToken.decimals)
      }
    };
    if (!shouldCalculateGas) {
      return trade;
    }

    const estimatedGas = Web3Pure.calculateGasMargin(this.currentTradeData.gas, this.gasMargin);
    const gasPriceInEth = Web3Pure.fromWei(this.currentTradeData.gasPrice);
    const nativeCoinPrice = await this.tokensService.getNativeCoinPriceInUsd(this.blockchain);
    const gasPriceInUsd = gasPriceInEth.multipliedBy(nativeCoinPrice);
    const gasFeeInEth = gasPriceInEth.multipliedBy(estimatedGas);
    const gasFeeInUsd = gasPriceInUsd.multipliedBy(estimatedGas);

    return {
      ...trade,
      gasLimit: estimatedGas,
      gasPrice: this.currentTradeData.gasPrice,
      gasFeeInEth,
      gasFeeInUsd
    };
  }

  public async createTrade(
    trade: InstantTrade,
    options: ItOptions = {}
  ): Promise<TransactionReceipt> {
    this.walletConnectorService.checkSettings(trade.blockchain);

    const amount = Web3Pure.fromWei(trade.from.amount, trade.from.token.decimals);
    await this.web3Public.checkBalance(trade.from.token, amount, this.walletAddress);

    return this.web3PrivateService.trySendTransaction(
      this.currentTradeData.to,
      this.currentTradeData.value,
      {
        data: this.currentTradeData.data,
        gas: trade.gasLimit,
        gasPrice: this.currentTradeData.gasPrice,
        inWei: true,
        onTransactionHash: options.onConfirm
      }
    );
  }

  /**
   * Fetches zrx data from their api.
   * @param params Zrx params.
   */
  private fetchTrade(params: ZrxCalculateTradeParams): Promise<ZrxApiResponse> {
    return this.httpService
      .get<ZrxApiResponse>('swap/v1/quote', params, this.apiAddress)
      .toPromise();
  }
}
