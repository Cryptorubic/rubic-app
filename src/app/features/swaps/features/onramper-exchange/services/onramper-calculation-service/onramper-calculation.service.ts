import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import BigNumber from 'bignumber.js';
import {
  BlockchainName,
  EvmBlockchainName,
  EvmWeb3Pure,
  MaxAmountError,
  MinAmountError,
  OnChainTrade
} from 'rubic-sdk';
import { SdkService } from '@core/services/sdk/sdk.service';
import { RubicError } from '@core/errors/models/rubic-error';
import { cryptoCode } from '@features/swaps/features/onramper-exchange/constants/crypto-code';
import { OnramperRateResponse } from '@features/swaps/features/onramper-exchange/services/onramper-calculation-service/models/onramper-rate-response';
import { onramperApiKey } from '@app/shared/constants/onramper/onramper-api-key';
import { SwapFormInputFiats } from '@core/services/swaps/models/swap-form-fiats';
import {
  OnramperSupportedBlockchain,
  onramperSupportedBlockchains
} from '@features/swaps/features/onramper-exchange/models/onramper-supported-blockchain';
import { GasService } from '@core/services/gas-service/gas.service';
import { OnramperService } from '@core/services/onramper/onramper.service';
import { PlatformConfigurationService } from '@core/services/backend/platform-configuration/platform-configuration.service';

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
    private readonly platformConfigurationService: PlatformConfigurationService
  ) {}

  public async getOutputTokenAmount(input: SwapFormInputFiats): Promise<BigNumber | null> {
    const receivedNativeAmount = await this.getOutputNativeAmount(input);
    if (EvmWeb3Pure.isNativeAddress(input.toToken.address)) {
      return receivedNativeAmount;
    }

    const fromFee = await this.onramperService.getFromFees(input.toBlockchain as EvmBlockchainName);
    const useProxy = this.platformConfigurationService.useOnChainProxy;
    const onChainTrades = await this.sdkService.instantTrade.calculateTrade(
      {
        address: EvmWeb3Pure.nativeTokenAddress,
        blockchain: input.toToken.blockchain
      },
      receivedNativeAmount.minus(fromFee).toFixed(),
      input.toToken.address,
      {
        gasCalculation: 'disabled',
        useProxy
      }
    );
    const bestTrade = onChainTrades[onChainTrades.length - 1];
    if (bestTrade instanceof OnChainTrade) {
      return bestTrade.to.tokenAmount;
    } else {
      throw bestTrade.error;
    }
  }

  private async getOutputNativeAmount(input: SwapFormInputFiats): Promise<BigNumber> {
    const fromFiat = input.fromFiat.symbol;
    const toCrypto = cryptoCode[input.toToken.blockchain as OnramperSupportedBlockchain];
    const fromAmount = input.fromAmount.toFixed();

    const trades = await firstValueFrom(
      this.httpClient.get<OnramperRateResponse>(
        `https://onramper.tech/rate/${fromFiat}/${toCrypto}/creditCard/${fromAmount}`,
        {
          headers: { Authorization: `Basic ${onramperApiKey}` }
        }
      )
    );
    const bestTrade = trades
      .filter(trade => trade.available)
      .sort((a, b) => {
        if (a.receivedCrypto === b.receivedCrypto) {
          return 0;
        }
        return a.receivedCrypto > b.receivedCrypto ? -1 : 1;
      })[0];
    if (!bestTrade?.receivedCrypto) {
      this.checkMinMaxError(trades, input);
      throw new RubicError('Trade is not available');
    }
    return new BigNumber(bestTrade.receivedCrypto);
  }

  private checkMinMaxError(trades: OnramperRateResponse, input: SwapFormInputFiats): void | never {
    const minAmount = trades
      .filter(
        trade => trade.error?.type === 'MIN' && trade.error.message?.includes(input.fromFiat.symbol)
      )
      .sort((a, b) => new BigNumber(a.error.limit).comparedTo(b.error.limit))[0]?.error?.limit;
    if (minAmount) {
      throw new MinAmountError(new BigNumber(minAmount + 0.01), input.fromFiat.symbol);
    }

    const maxAmount = trades
      .filter(trade => trade.error?.type === 'MAX')
      .sort((a, b) => new BigNumber(b.error.limit).comparedTo(a.error.limit))[0]?.error?.limit;
    if (maxAmount) {
      throw new MaxAmountError(new BigNumber(maxAmount), input.fromFiat.symbol);
    }
  }
}
