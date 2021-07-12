import { Injectable } from '@angular/core';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { CoingeckoApiService } from 'src/app/core/services/external-api/coingecko-api/coingecko-api.service';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import BigNumber from 'bignumber.js';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import {
  abi,
  ethToTokensEstimatedGas,
  maxTransitTokens,
  routingProviders,
  tokensToEthEstimatedGas,
  tokensToTokensEstimatedGas,
  pancakeSwapContracts,
  WETH
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/pancake-swap-service/pankace-swap-constants';
import { TransactionReceipt } from 'web3-eth';
import { UniSwapTrade } from 'src/app/features/instant-trade/services/instant-trade-service/models/uniswap.types';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';
import {
  ItSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';
import { CommonUniswapService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common-uniswap/common-uniswap.service';
import { Observable } from 'rxjs';
import { ItProvider } from 'src/app/features/instant-trade/services/instant-trade-service/models/it-provider';

@Injectable({
  providedIn: 'root'
})
export class PancakeSwapService implements ItProvider {
  protected blockchain: BLOCKCHAIN_NAME;

  protected shouldCalculateGas: boolean;

  private web3Public: Web3Public;

  private settings: ItSettingsForm;

  constructor(
    private readonly coingeckoApiService: CoingeckoApiService,
    private readonly web3Private: Web3PrivateService,
    private readonly w3Public: Web3PublicService,
    private readonly useTestingModeService: UseTestingModeService,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly settingsService: SettingsService,
    private readonly commonUniswap: CommonUniswapService
  ) {
    useTestingModeService.isTestingMode.subscribe(value => {
      if (value) {
        this.web3Public = w3Public[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET];
      }
    });
    this.web3Public = w3Public[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN];
    this.blockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;
    this.shouldCalculateGas = true;
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
      pancakeSwapContracts.address,
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
    return this.commonUniswap.approve(tokenAddress, pancakeSwapContracts.address, options);
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
      fromTokenClone.address = WETH.address;
      estimatedGasPredictionMethod = 'calculateEthToTokensGasLimit';
      estimatedGasArray = ethToTokensEstimatedGas;
    }

    if (this.web3Public.isNativeAddress(toTokenClone.address)) {
      toTokenClone.address = WETH.address;
      estimatedGasPredictionMethod = 'calculateTokensToEthGasLimit';
      estimatedGasArray = tokensToEthEstimatedGas;
    }

    const amountIn = fromAmount.multipliedBy(10 ** fromTokenClone.decimals).toFixed(0);

    const { route, gasData } = await this.commonUniswap.getToAmountAndPath(
      this.settings.rubicOptimisation,
      amountIn,
      fromTokenClone,
      toTokenClone,
      estimatedGasPredictionMethod,
      this.settings,
      this.web3Public,
      routingProviders.addresses,
      pancakeSwapContracts.address,
      abi,
      maxTransitTokens,
      estimatedGasArray
    );

    return {
      from: {
        token: fromToken,
        amount: fromAmount
      },
      to: {
        token: toToken,
        amount: route.outputAbsoluteAmount.div(10 ** toToken.decimals)
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
    await this.commonUniswap.checkSettings(this.blockchain);
    await this.commonUniswap.checkBalance(trade, this.web3Public);

    const amountIn = trade.from.amount.multipliedBy(10 ** trade.from.token.decimals).toFixed(0);

    const amountOutMin = trade.to.amount
      .multipliedBy(new BigNumber(1).minus(this.settings.slippageTolerance))
      .multipliedBy(10 ** trade.to.token.decimals)
      .toFixed(0);
    const { path } = trade.options;
    const to = this.providerConnectorService.address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * this.settings.deadline;

    const uniSwapTrade: UniSwapTrade = { amountIn, amountOutMin, path, to, deadline };

    if (this.web3Public.isNativeAddress(trade.from.token.address)) {
      return this.commonUniswap.createEthToTokensTrade(
        uniSwapTrade,
        options,
        pancakeSwapContracts.address,
        abi
      );
    }

    if (this.web3Public.isNativeAddress(trade.to.token.address)) {
      return this.commonUniswap.createTokensToEthTrade(
        uniSwapTrade,
        options,
        pancakeSwapContracts.address,
        abi
      );
    }

    return this.commonUniswap.createTokensToTokensTrade(
      uniSwapTrade,
      options,
      pancakeSwapContracts.address,
      abi
    );
  }
}
