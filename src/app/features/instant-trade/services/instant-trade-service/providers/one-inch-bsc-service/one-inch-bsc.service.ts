import { HttpClient } from '@angular/common/http';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { OneinchQuoteError } from 'src/app/core/errors/models/provider/OneinchQuoteError';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { catchError, first } from 'rxjs/operators';
import { BlockchainsInfo } from 'src/app/core/services/blockchain/blockchain-info';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { CoingeckoApiService } from 'src/app/core/services/external-api/coingecko-api/coingecko-api.service';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { Injectable } from '@angular/core';
import CustomError from 'src/app/core/errors/models/custom-error';
import {
  OneInchQuoteResponse,
  OneInchSwapResponse
} from 'src/app/features/instant-trade/services/instant-trade-service/models/one-inch.types';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import {
  ItSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';
import { ItProvider } from 'src/app/features/instant-trade/services/instant-trade-service/models/it-provider';
import { Observable, throwError } from 'rxjs';
import { CommonOneinchService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common-oneinch/common-oneinch.service';
import { OneinchRefreshError } from 'src/app/core/errors/models/instant-trade/oneinch-refresh.error';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class OneInchBscService implements ItProvider {
  private readonly oneInchNativeAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

  private supportedTokensAddresses: string[];

  private tokensLoadingProcess: Promise<void>;

  protected apiBaseUrl: string;

  protected blockchain: BLOCKCHAIN_NAME;

  protected web3Public: Web3Public;

  private settings: ItSettingsForm;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly coingeckoApiService: CoingeckoApiService,
    private readonly useTestingModeService: UseTestingModeService,
    private readonly web3Private: Web3PrivateService,
    private readonly web3PublicService: Web3PublicService,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly errorsService: ErrorsService,
    private readonly settingsService: SettingsService,
    private readonly commonOneinch: CommonOneinchService,
    private translateService: TranslateService
  ) {
    this.blockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;
    const network = BlockchainsInfo.getBlockchainByName(BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN);
    this.apiBaseUrl = `https://api.1inch.exchange/v3.0/${network.id}/`;
    this.web3Public = this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN];
    useTestingModeService.isTestingMode.subscribe(value => {
      if (value) {
        this.web3Public = this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET];
      }
    });
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
    this.loadSupportedTokens();
  }

  private loadSupportedTokens(): void {
    this.commonOneinch
      .loadSupportedTokens(BlockchainsInfo.getBlockchainByName(this.blockchain).id)
      .pipe(first())
      .subscribe(addresses => {
        this.supportedTokensAddresses = addresses;
      });
  }

  public getAllowance(tokenAddress: string): Observable<BigNumber> {
    return this.commonOneinch.getAllowance(
      tokenAddress,
      this.web3Public,
      this.blockchain,
      this.providerConnectorService.address
    );
  }

  public async approve(
    tokenAddress: string,
    options: {
      onTransactionHash?: (hash: string) => void;
    }
  ): Promise<void> {
    await this.commonOneinch.checkSettings(this.blockchain, this.providerConnectorService);
    return this.commonOneinch.approve(tokenAddress, this.blockchain, options);
  }

  public async calculateTrade(
    fromAmount: BigNumber,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken
  ): Promise<InstantTrade> {
    const { fromTokenAddress, toTokenAddress } =
      this.commonOneinch.getOneInchTokenSpecificAddresses(fromToken, toToken, this.web3Public);

    if (!this.supportedTokensAddresses.length) {
      await this.tokensLoadingProcess;
    }

    if (
      !this.supportedTokensAddresses.includes(fromTokenAddress) ||
      !this.supportedTokensAddresses.includes(toTokenAddress)
    ) {
      throw new CustomError(this.translateService.instant('errors.1inchNotSupportedToken'));
    }

    const tradeParams = {
      params: {
        fromTokenAddress,
        toTokenAddress,
        amount: fromAmount.multipliedBy(10 ** fromToken.decimals).toFixed(0)
      } as {
        [param: string]: string;
      }
    };
    if (this.settings.disableMultihops) {
      tradeParams.params.mainRouteParts = '1';
    }

    const oneInchTrade: OneInchQuoteResponse = (await this.httpClient
      .get(`${this.apiBaseUrl}quote`, tradeParams)
      .pipe(
        catchError(err => {
          if (err.status === 500) {
            return throwError(new OneinchRefreshError());
          }
          return throwError(new CustomError(err.error.message));
        })
      )
      .toPromise()) as OneInchQuoteResponse;

    if (oneInchTrade.hasOwnProperty('errors') || !oneInchTrade.toTokenAmount) {
      throw new OneinchQuoteError();
    }

    const estimatedGas = new BigNumber(0);
    const gasFeeInUsd = new BigNumber(0);
    const gasFeeInEth = new BigNumber(0);

    return {
      from: {
        token: fromToken,
        amount: fromAmount
      },
      to: {
        token: toToken,
        amount: new BigNumber(oneInchTrade.toTokenAmount).div(10 ** toToken.decimals)
      },
      estimatedGas,
      gasFeeInUsd,
      gasFeeInEth
    };
  }

  public async createTrade(
    trade: InstantTrade,
    options: { onConfirm?: (hash: string) => void; onApprove?: (hash: string | null) => void }
  ): Promise<TransactionReceipt> {
    await this.commonOneinch.checkSettings(this.blockchain, this.providerConnectorService);

    const { fromTokenAddress, toTokenAddress } =
      this.commonOneinch.getOneInchTokenSpecificAddresses(
        trade.from.token,
        trade.to.token,
        this.web3Public
      );

    const fromAmount = trade.from.amount.multipliedBy(10 ** trade.from.token.decimals).toFixed(0);

    const tradeParams = {
      params: {
        fromTokenAddress,
        toTokenAddress,
        amount: fromAmount,
        slippage: this.settings.slippageTolerance.toString(),
        fromAddress: this.providerConnectorService.address
      } as {
        [param: string]: string;
      }
    };
    if (this.settings.disableMultihops) {
      tradeParams.params.mainRouteParts = '1';
    }
    const oneInchTrade: OneInchSwapResponse = (await this.httpClient
      .get(`${this.apiBaseUrl}swap`, tradeParams)
      .pipe(catchError(err => this.commonOneinch.specifyError(err, this.blockchain)))
      .toPromise()) as OneInchSwapResponse;

    const increasedGas = new BigNumber(oneInchTrade.tx.gas).multipliedBy(1.25).toFixed(0);

    const trxOptions = {
      onTransactionHash: options.onConfirm,
      data: oneInchTrade.tx.data,
      gas: increasedGas,
      gasPrice: oneInchTrade.tx.gasPrice,
      inWei: fromTokenAddress === this.oneInchNativeAddress || undefined
    };

    return this.web3Private.sendTransaction(
      oneInchTrade.tx.to,
      fromTokenAddress !== this.oneInchNativeAddress ? '0' : fromAmount,
      trxOptions
    );
  }
}
