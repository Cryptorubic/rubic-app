import { Injectable } from '@angular/core';
import { ItProvider } from 'src/app/features/instant-trade/services/instant-trade-service/models/it-provider';
import BigNumber from 'bignumber.js';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import { Observable } from 'rxjs';
import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';
import { TransactionReceipt } from 'web3-eth';
import {
  SushiRoute,
  SushiRoutesResponse
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/sushi-swap-service/sushi-swap.types';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { HttpService } from 'src/app/core/services/http/http.service';
import { CommonUniswapService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common-uniswap/common-uniswap.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import {
  ItSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';
import {
  abi,
  ethToTokensEstimatedGas,
  routingProviders,
  tokensToEthEstimatedGas,
  tokensToTokensEstimatedGas,
  sushiSwapContracts,
  WETH
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/sushi-swap-service/sushi-swap-constants';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import {
  Gas,
  UniswapRoute,
  UniSwapTrade
} from 'src/app/features/instant-trade/services/instant-trade-service/models/uniswap-types';
import { CoingeckoApiService } from 'src/app/core/services/external-api/coingecko-api/coingecko-api.service';
import InsufficientLiquidityError from 'src/app/core/errors/models/instant-trade/insufficient-liquidity.error';

@Injectable({
  providedIn: 'root'
})
export class SushiSwapService implements ItProvider {
  private readonly apiUrl = 'https://api.sushipro.io/find_route';

  private readonly apiKey = 'Rub1cl33T*';

  protected blockchain: BLOCKCHAIN_NAME;

  protected shouldCalculateGas: boolean;

  private web3Public: Web3Public;

  private WETHAddress: string;

  private sushiswapContractAddress: string;

  private routingProviders: string[];

  private settings: ItSettingsForm;

  constructor(
    private readonly httpService: HttpService,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly settingsService: SettingsService,
    private readonly commonUniswap: CommonUniswapService,
    private readonly w3Public: Web3PublicService,
    private readonly web3Private: Web3PrivateService,
    private readonly coingeckoApiService: CoingeckoApiService
  ) {
    this.web3Public = w3Public[BLOCKCHAIN_NAME.ETHEREUM];
    this.blockchain = BLOCKCHAIN_NAME.ETHEREUM;
    this.shouldCalculateGas = true;
    this.WETHAddress = WETH.address;
    this.sushiswapContractAddress = sushiSwapContracts.address;
    this.routingProviders = routingProviders.addresses;

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

  public getAllowance(tokenAddress: string): Observable<BigNumber> {
    return this.commonUniswap.getAllowance(
      tokenAddress,
      this.sushiswapContractAddress,
      this.web3Public
    );
  }

  public async approve(
    tokenAddress: string,
    options: {
      onTransactionHash?: (hash: string) => void;
    }
  ): Promise<void> {
    await this.commonUniswap.checkSettings(this.blockchain);
    return this.commonUniswap.approve(tokenAddress, this.sushiswapContractAddress, options);
  }

  public async calculateTrade(
    fromAmount: BigNumber,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken
  ): Promise<InstantTrade> {
    const fromTokenClone = { ...fromToken };
    const toTokenClone = { ...toToken };
    let estimatedGasPredictionMethod = 'calculateTokensToTokensGasLimit';
    let estimatedGasArray = tokensToTokensEstimatedGas;

    if (this.web3Public.isNativeAddress(fromTokenClone.address)) {
      fromTokenClone.address = this.WETHAddress;
      estimatedGasPredictionMethod = 'calculateEthToTokensGasLimit';
      estimatedGasArray = ethToTokensEstimatedGas;
    }

    if (this.web3Public.isNativeAddress(toTokenClone.address)) {
      toTokenClone.address = this.WETHAddress;
      estimatedGasPredictionMethod = 'calculateTokensToEthGasLimit';
      estimatedGasArray = tokensToEthEstimatedGas;
    }

    const { route, gasData } = await this.getToAmountAndPath(
      fromAmount.toString(),
      fromTokenClone,
      toTokenClone,
      estimatedGasPredictionMethod,
      estimatedGasArray
    );

    return {
      from: {
        token: fromToken,
        amount: fromAmount
      },
      to: {
        token: toToken,
        amount: route.outputAbsoluteAmount
      },
      estimatedGas: gasData.estimatedGas,
      gasFeeInUsd: gasData.gasFeeInUsd,
      gasFeeInEth: gasData.gasFeeInEth,
      options: {
        path: route.path,
        gasOptimization: this.settings.rubicOptimisation
      }
    };
  }

  public async createTrade(
    trade: InstantTrade,
    options: {
      onConfirm?: (hash: string) => void;
      onApprove?: (hash: string) => void;
    } = {}
  ): Promise<TransactionReceipt> {
    // @TODO Проверить правильность констант и проверить почему газ считается не верно.
    await this.commonUniswap.checkSettings(this.blockchain);
    await this.commonUniswap.checkBalance(trade, this.web3Public);

    const amountIn = trade.from.amount.multipliedBy(10 ** trade.from.token.decimals).toFixed(0);

    const amountOutMin = trade.to.amount
      .multipliedBy(new BigNumber(1).minus(this.settings.slippageTolerance))
      .multipliedBy(10 ** trade.to.token.decimals)
      .toFixed(0);
    const { path } = trade.options;
    const to = this.providerConnectorService.address;
    const deadline = Math.floor(Date.now() / 1000) + this.settings.deadline;

    const uniSwapTrade: UniSwapTrade = { amountIn, amountOutMin, path, to, deadline };

    if (this.web3Public.isNativeAddress(trade.from.token.address)) {
      return this.commonUniswap.createEthToTokensTrade(
        uniSwapTrade,
        options,
        this.sushiswapContractAddress,
        abi
      );
    }

    if (this.web3Public.isNativeAddress(trade.to.token.address)) {
      return this.commonUniswap.createTokensToEthTrade(
        uniSwapTrade,
        options,
        this.sushiswapContractAddress,
        abi
      );
    }

    return this.commonUniswap.createTokensToTokensTrade(
      uniSwapTrade,
      options,
      this.sushiswapContractAddress,
      abi
    );
  }

  /**
   * @description Fetch routes from sushi api.
   * @param fromAmount Tokens trade from amount.
   * @param fromToken Instant trade from token.
   * @param toToken Instant trade to token.
   * @return Observable<SushiRoutesResponse<SushiRoute[]>> Sushi routes array.
   */
  private fetchRoutes(
    fromAmount: string,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken
  ): Promise<SushiRoutesResponse<SushiRoute[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const requestData = {
      api_key: this.apiKey,
      quantity: fromAmount,
      token_input: fromToken.address.toString(),
      token_output: toToken.address.toString(),
      hops: '4'
    } as { [param: string]: string | readonly string[] };
    const httpParams = new HttpParams({ fromObject: requestData });
    return this.httpService.post('', httpParams, this.apiUrl, { headers }).toPromise();
  }

  private async getToAmountAndPath(
    fromAmountAbsolute: string,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken,
    gasCalculationMethodName: string,
    estimatedGasArray: BigNumber[]
  ): Promise<{ route: UniswapRoute; gasData: Gas }> {
    const sushiRoute = (await this.fetchRoutes(fromAmountAbsolute, fromToken, toToken)).route.sort(
      (a, b) => (b.sum_output > a.sum_output ? 1 : -1)
    )[0];

    const route = {
      path: sushiRoute.route.split(';'),
      outputAbsoluteAmount: new BigNumber(sushiRoute.sum_output)
    };

    if (route.path.length === 0) {
      throw new InsufficientLiquidityError();
    }

    const to = this.providerConnectorService.address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * this.settings.deadline;
    const ethPrice = await this.coingeckoApiService.getEtherPriceInUsd();
    const gasPrice = await this.web3Public.getGasPriceInETH();

    const amountOutMin = route.outputAbsoluteAmount
      .multipliedBy(new BigNumber(1).minus(this.settings.slippageTolerance))
      .toFixed(0);

    const estimatedGas = await this.commonUniswap[gasCalculationMethodName](
      fromAmountAbsolute,
      amountOutMin,
      route.path,
      to,
      deadline,
      this.sushiswapContractAddress,
      this.web3Public,
      estimatedGasArray,
      abi
    );

    const gasFeeInEth = estimatedGas.multipliedBy(gasPrice);
    const gasFeeInUsd = gasFeeInEth.multipliedBy(ethPrice);

    return {
      route,
      gasData: {
        estimatedGas,
        gasFeeInEth,
        gasFeeInUsd
      }
    };
  }
}
