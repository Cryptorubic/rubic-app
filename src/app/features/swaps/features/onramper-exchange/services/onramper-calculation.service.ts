import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import BigNumber from 'bignumber.js';
import {
  blockchainId,
  BlockchainName,
  compareAddresses,
  EvmWeb3Pure,
  MaxAmountError,
  MinAmountError,
  OnChainTrade
} from 'rubic-sdk';
import { SdkService } from '@core/services/sdk/sdk.service';
import { RubicError } from '@core/errors/models/rubic-error';
import { cryptoCode as nativeCoinCode } from '@features/swaps/features/onramper-exchange/constants/crypto-code';
import { SwapFormInputFiats } from '@core/services/swaps/models/swap-form-fiats';
import {
  OnramperSupportedBlockchain,
  onramperSupportedBlockchains
} from '@features/swaps/features/onramper-exchange/models/onramper-supported-blockchain';
import { GasService } from '@core/services/gas-service/gas.service';
import { OnramperService } from '@core/services/onramper/onramper.service';
import { PlatformConfigurationService } from '@core/services/backend/platform-configuration/platform-configuration.service';
import {
  OnramperError,
  OnramperRate
} from '@features/swaps/features/onramper-exchange/models/onramper-rate-response';
import { OnramperApiService } from '@features/swaps/features/onramper-exchange/services/onramper-api.service';
import { TokenAmount } from '@shared/models/tokens/token-amount';

@Injectable()
export class OnramperCalculationService {
  public static isSupportedBlockchain(
    blockchain: BlockchainName
  ): blockchain is OnramperSupportedBlockchain {
    return onramperSupportedBlockchains.some(
      supportedBlockchain => supportedBlockchain === blockchain
    );
  }

  constructor(
    private readonly httpClient: HttpClient,
    private readonly sdkService: SdkService,
    private readonly gasService: GasService,
    private readonly onramperService: OnramperService,
    private readonly platformConfigurationService: PlatformConfigurationService,
    private readonly onramperApiService: OnramperApiService
  ) {}

  public async getOutputAmount(
    input: SwapFormInputFiats
  ): Promise<{ amount: BigNumber; direct: boolean; code: string } | null> {
    const cryptoCode = await this.checkForDirectSwap(input.toToken);
    const fromFiat = input.fromFiat.symbol;
    const fromAmount = input.fromAmount.toFixed();
    if (cryptoCode) {
      try {
        const amount = await this.getOutputTokenAmount(fromFiat, fromAmount, cryptoCode);
        return { amount, direct: true, code: cryptoCode };
      } catch (err) {
        if (!err?.message?.includes('Not supported destination currency')) {
          throw err;
        }
      }
    }

    const nativeCode = nativeCoinCode[input.toToken.blockchain as OnramperSupportedBlockchain];
    const receivedNativeAmount = await this.getOutputTokenAmount(fromFiat, fromAmount, nativeCode);
    // const fromFee = await this.onramperService.getFromFees(input.toBlockchain as EvmBlockchainName);
    const useProxy = this.platformConfigurationService.useOnChainProxy;
    const onChainTrades = await this.sdkService.instantTrade.calculateTrade(
      {
        address: EvmWeb3Pure.nativeTokenAddress,
        blockchain: input.toToken.blockchain
      },
      receivedNativeAmount.toFixed(),
      input.toToken.address,
      {
        gasCalculation: 'disabled',
        useProxy
      }
    );
    const bestTrade = onChainTrades[onChainTrades.length - 1];
    if (bestTrade instanceof OnChainTrade) {
      return { amount: bestTrade.to.tokenAmount, direct: false, code: nativeCode };
    } else {
      throw bestTrade.error;
    }
  }

  private async getOutputTokenAmount(
    fromFiat: string,
    fromAmount: string,
    cryptoCode: string
  ): Promise<BigNumber> {
    const trades = await firstValueFrom(
      this.onramperApiService.fetchRate(fromFiat, cryptoCode, fromAmount)
    );
    const successfulTrades = trades.filter(trade => 'rate' in trade) as OnramperRate[];

    if (
      trades.every(trade => 'errors' in trade && trade.errors.some(error => error.errorId === 6100))
    ) {
      throw new Error('Not supported destination currency');
    }
    const bestTrade = successfulTrades.sort((a, b) => {
      if (a.payout === b.payout) {
        return 0;
      }
      return a.payout > b.payout ? -1 : 1;
    })[0];
    if (!bestTrade?.payout) {
      this.checkMinMaxError(trades as unknown[] as OnramperError[], fromFiat, fromAmount);
      throw new RubicError('Trade is not available');
    }
    return new BigNumber(bestTrade.payout);
  }

  private checkMinMaxError(
    trades: OnramperError[],
    fromFiat: string,
    fromAmount: string
  ): void | never {
    const minMaxAmountTrades = trades.filter(trade =>
      trade.errors.some(error => error.errorId === 6101)
    );
    const fromAmountBn = new BigNumber(fromAmount);

    const minAmount = minMaxAmountTrades.sort((a, b) =>
      new BigNumber(a.errors[0].minAmount).comparedTo(b.errors[0].minAmount)
    )[0]?.errors[0].minAmount;
    if (fromAmountBn.lt(minAmount)) {
      throw new MinAmountError(new BigNumber(minAmount + 0.01), fromFiat);
    }
    const maxAmount = minMaxAmountTrades.sort((a, b) =>
      new BigNumber(b.errors[0].maxAmount).comparedTo(a.errors[0].maxAmount)
    )[0]?.errors[0]?.maxAmount;
    if (fromAmountBn.gt(maxAmount)) {
      throw new MaxAmountError(new BigNumber(maxAmount), fromFiat);
    }
  }

  private async checkForDirectSwap(toToken: TokenAmount): Promise<string | null> {
    const toTokenChainId = blockchainId[toToken.blockchain];
    const supportedTokens = await firstValueFrom(this.onramperApiService.fetchSupportedCrypto());
    const supportedToToken = supportedTokens.message.crypto.find(
      crypto =>
        compareAddresses(crypto.address, toToken.address) && toTokenChainId === crypto.chainId
    );
    return supportedToToken ? supportedToToken.id : null;
  }
}
