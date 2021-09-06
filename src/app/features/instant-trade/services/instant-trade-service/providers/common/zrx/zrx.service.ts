import { Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ItProvider } from 'src/app/features/instant-trade/services/instant-trade-service/models/ItProvider';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import {
  ItSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';
import { CoingeckoApiService } from 'src/app/core/services/external-api/coingecko-api/coingecko-api.service';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { ZrxApiResponse } from 'src/app/features/instant-trade/services/instant-trade-service/models/zrx/zrx-types';
import { HttpService } from 'src/app/core/services/http/http.service';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { ZRX_API_ADDRESS, ZRX_NATIVE_TOKEN } from './zrx-eth-constants';

@Injectable({
  providedIn: 'root'
})
export class ZrxService implements ItProvider {
  private web3Public: Web3Public;

  private settings: ItSettingsForm;

  private tradeData: ZrxApiResponse;

  protected blockchain: BLOCKCHAIN_NAME;

  private apiAddress: string;

  private isTestingMode: boolean;

  constructor(
    private http: HttpClient,
    private readonly settingsService: SettingsService,
    private readonly w3Public: Web3PublicService,
    private readonly coingeckoApiService: CoingeckoApiService,
    private readonly providerConnector: ProviderConnectorService,
    private readonly web3PrivateService: Web3PrivateService,
    private readonly commonUniswapV2: CommonUniswapV2Service,
    public providerConnectorService: ProviderConnectorService,
    private readonly useTestingModeService: UseTestingModeService,
    private readonly swapFormService: SwapFormService,
    private readonly httpService: HttpService,
    private readonly tokensService: TokensService
  ) {
    useTestingModeService.isTestingMode.subscribe(value => {
      if (value) {
        this.isTestingMode = value;
      }
    });

    this.swapFormService.commonTrade.controls.input.controls.fromBlockchain.valueChanges.subscribe(
      fromBlockchain => {
        if (this.isTestingMode) {
          const blockchain = `${fromBlockchain}_TESTNET` as BLOCKCHAIN_NAME;
          this.blockchain = blockchain;
          this.web3Public = this.w3Public[blockchain];
          this.apiAddress = ZRX_API_ADDRESS[blockchain];
        } else {
          this.web3Public = this.w3Public[fromBlockchain];
          this.blockchain = fromBlockchain;
          this.apiAddress = ZRX_API_ADDRESS[fromBlockchain];
        }
      }
    );

    const form = this.settingsService.settingsForm.controls.INSTANT_TRADE;
    this.settings = {
      ...form.value,
      slippageTolerance: form.value.slippageTolerance / 100
    };
    form.valueChanges.subscribe(formValue => {
      this.settings = {
        ...formValue,
        slippageTolerance: formValue.slippageTolerance / 100
      };
    });
  }

  public createTrade(
    trade: InstantTrade,
    options: {
      onConfirm?: (hash: string) => void;
      onApprove?: (hash: string) => void;
    } = {}
  ): Promise<TransactionReceipt> {
    const amount = Web3Public.fromWei(trade.from.amount, 18);
    return this.web3PrivateService.sendTransaction(this.tradeData.to, amount, {
      data: this.tradeData.data,
      gas: this.tradeData.gas,
      gasPrice: this.tradeData.gasPrice,
      value: this.tradeData.value,
      onTransactionHash: options.onConfirm
    });
  }

  public async calculateTrade(
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken
  ): Promise<InstantTrade> {
    const fromTokenClone = { ...fromToken };
    const toTokenClone = { ...toToken };

    if (Web3Public.isNativeAddress(fromToken.address)) {
      fromTokenClone.address = ZRX_NATIVE_TOKEN;
    }

    if (Web3Public.isNativeAddress(toToken.address)) {
      toTokenClone.address = ZRX_NATIVE_TOKEN;
    }

    const ethPrice = await this.tokensService.getNativeCoinPriceInUsd(this.blockchain);
    const gasPrice = await this.web3Public.getGasPriceInETH();
    const params = {
      sellToken: fromTokenClone.address,
      buyToken: toTokenClone.address,
      sellAmount: Web3Public.toWei(fromAmount, fromToken.decimals),
      slippagePercentage: this.settings.slippageTolerance.toString(),
      excludedSources: 'Uniswap_V3'
    };

    this.tradeData = await this.fetchTrade(params);
    const gasFeeInEth = new BigNumber(this.tradeData.estimatedGas).multipliedBy(gasPrice);
    const gasFeeInUsd = gasFeeInEth.multipliedBy(ethPrice);

    return {
      blockchain: BLOCKCHAIN_NAME.ETHEREUM,
      from: {
        token: fromToken,
        amount: new BigNumber(this.tradeData.sellAmount)
      },
      to: {
        token: toToken,
        amount: new BigNumber(this.tradeData.buyAmount).div(10 ** toToken.decimals)
      },
      gasLimit: this.tradeData.estimatedGas,
      gasFeeInUsd,
      gasFeeInEth,
      options: {
        gasOptimization: this.settings.rubicOptimisation
      }
    };
  }

  public getAllowance(tokenAddress: string): Observable<BigNumber> {
    return this.commonUniswapV2.getAllowance(
      this.blockchain,
      tokenAddress,
      this.tradeData?.allowanceTarget
    );
  }

  public async approve(
    tokenAddress: string,
    options: {
      onTransactionHash?: (hash: string) => void;
    }
  ): Promise<void> {
    await this.providerConnectorService.checkSettings(this.blockchain);
    return this.commonUniswapV2.approve(
      this.blockchain,
      tokenAddress,
      this.tradeData.allowanceTarget,
      options
    );
  }

  public fetchTrade(params): Promise<ZrxApiResponse> {
    return this.httpService
      .get('swap/v1/quote', params, this.apiAddress)
      .toPromise() as Promise<ZrxApiResponse>;
  }
}
