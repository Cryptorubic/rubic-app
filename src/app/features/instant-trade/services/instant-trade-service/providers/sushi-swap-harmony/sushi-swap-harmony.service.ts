import { Injectable } from '@angular/core';
import { ItProvider } from 'src/app/features/instant-trade/services/instant-trade-service/models/it-provider';
import BigNumber from 'bignumber.js';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';
import {
  ethToTokensEstimatedGas, tokensToEthEstimatedGas,
  tokensToTokensEstimatedGas
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/sushi-swap-eth-service/sushi-swap-eth.constants';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';

@Injectable({
  providedIn: 'root'
})
export class SushiSwapHarmonyService implements ItProvider {

  private WETHAddress: string;

  private web3Public: Web3Public;

  constructor(private readonly w3Public: Web3PublicService) {
    this.web3Public = w3Public[BLOCKCHAIN_NAME.HARMONY];
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


  }
}
