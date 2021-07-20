import { Injectable } from '@angular/core';
import { ItProvider } from 'src/app/features/instant-trade/services/instant-trade-service/models/it-provider';
import BigNumber from 'bignumber.js';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { CommonUniswapService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common-uniswap/common-uniswap.service';
import {
  abi,
  WONE,
  routingProviders,
  sushiSwapHarmonyContracts,
  tokensToTokensEstimatedGas,
  ethToTokensEstimatedGas,
  tokensToEthEstimatedGas,
  maxTransitTokens
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/sushi-swap-harmony/sushi-swap-harmony.constants';
import {
  ItSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SushiSwapHarmonyService implements ItProvider {

  private WONEAddress: string;

  private web3Public: Web3Public;

  private settings: ItSettingsForm;

  private routingProviders: string[];

  private sushiswapContractAddress: string;

  constructor(
    private readonly w3Public: Web3PublicService,
    private readonly settingsService: SettingsService,
    private readonly commonUniswap: CommonUniswapService
  ) {
    this.web3Public = w3Public[BLOCKCHAIN_NAME.HARMONY];
    this.WONEAddress = WONE.address;
    this.sushiswapContractAddress = sushiSwapHarmonyContracts.address;

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
      fromTokenClone.address = this.WONEAddress;
      estimatedGasPredictionMethod = 'calculateEthToTokensGasLimit';
      estimatedGasArray = ethToTokensEstimatedGas;
    }

    if (this.web3Public.isNativeAddress(toTokenClone.address)) {
      toTokenClone.address = this.WONEAddress;
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
      this.routingProviders,
      this.sushiswapContractAddress,
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
}
