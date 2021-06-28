import { HttpClient } from '@angular/common/http';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import { WalletError } from 'src/app/core/errors/models/provider/WalletError';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { OneinchQuoteError } from 'src/app/core/errors/models/provider/OneinchQuoteError';
import InstantTradeToken from 'src/app/features/swaps-page-old/instant-trades/models/InstantTradeToken';
import InstantTrade from 'src/app/features/swaps-page-old/instant-trades/models/InstantTrade';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { NetworkError } from 'src/app/core/errors/models/provider/NetworkError';
import { NotSupportedNetworkError } from 'src/app/core/errors/models/provider/NotSupportedNetwork';
import { WALLET_NAME } from 'src/app/core/header/components/header/components/wallets-modal/models/providers';
import InsufficientFundsError from 'src/app/core/errors/models/instant-trade/InsufficientFundsError';
import { AccountError } from 'src/app/core/errors/models/provider/AccountError';
import { catchError, map } from 'rxjs/operators';
import { BlockchainsInfo } from 'src/app/core/services/blockchain/blockchain-info';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { CoingeckoApiService } from 'src/app/core/services/external-api/coingecko-api/coingecko-api.service';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { Injectable } from '@angular/core';
import CustomError from 'src/app/core/errors/models/custom-error';
import {
  OneInchApproveResponse,
  OneInchQuoteResponse,
  OneInchSwapResponse,
  OneInchTokensResponse
} from 'src/app/features/instant-trade/services/instant-trade-service/models/one-inch-types';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import {
  ItSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';

@Injectable({
  providedIn: 'root'
})
export class OneInchBscService {
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
    private readonly settingsService: SettingsService
  ) {
    this.blockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;
    const network = BlockchainsInfo.getBlockchainByName(this.blockchain);
    this.apiBaseUrl = `https://api.1inch.exchange/v3.0/${network.id}/`;
    this.web3Public = this.web3PublicService[this.blockchain];
    useTestingModeService.isTestingMode.subscribe(value => {
      if (value) {
        this.web3Public = this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET];
      }
    });
    this.settings = this.settingsService.settingsForm.controls.INSTANT_TRADE.value;
    this.settingsService.settingsForm.controls.INSTANT_TRADE.valueChanges.subscribe(form => {
      this.settings = form;
    });
    this.loadSupportedTokens();
  }

  private loadSupportedTokens(): void {
    this.httpClient.get(`${this.apiBaseUrl}tokens`).subscribe((response: OneInchTokensResponse) => {
      this.supportedTokensAddresses = Object.keys(response.tokens);
    });
  }

  private loadApproveAddress(): Promise<string> {
    return this.httpClient
      .get(`${this.apiBaseUrl}approve/spender`)
      .pipe(map((response: OneInchApproveResponse) => response.address))
      .toPromise();
  }

  public async calculateTrade(
    fromAmount: BigNumber,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken
  ): Promise<InstantTrade> {
    const { fromTokenAddress, toTokenAddress } = this.getOneInchTokenSpecificAddresses(
      fromToken,
      toToken
    );

    if (!this.supportedTokensAddresses.length) {
      await this.tokensLoadingProcess;
    }

    if (
      !this.supportedTokensAddresses.includes(fromTokenAddress) ||
      !this.supportedTokensAddresses.includes(toTokenAddress)
    ) {
      console.error(`One inch not support ${fromToken.address} or ${toToken.address}`);
      return null;
    }

    const oneInchTrade: OneInchQuoteResponse = (await this.httpClient
      .get(`${this.apiBaseUrl}quote`, {
        params: {
          fromTokenAddress,
          toTokenAddress,
          amount: fromAmount.multipliedBy(10 ** fromToken.decimals).toFixed(0)
        }
      })
      .pipe(
        catchError(err => {
          throw new CustomError(err.error.message);
        })
      )
      .toPromise()) as OneInchQuoteResponse;

    if (oneInchTrade.hasOwnProperty('errors') || !oneInchTrade.toTokenAmount) {
      this.errorsService.throw$(new OneinchQuoteError());
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
    await this.checkSettings(this.blockchain);

    const { fromTokenAddress, toTokenAddress } = this.getOneInchTokenSpecificAddresses(
      trade.from.token,
      trade.to.token
    );

    const fromAmount = trade.from.amount.multipliedBy(10 ** trade.from.token.decimals).toFixed(0);

    if (fromTokenAddress !== this.oneInchNativeAddress) {
      const approveAddress = await this.loadApproveAddress();
      await this.provideAllowance(
        fromTokenAddress,
        new BigNumber(fromAmount),
        approveAddress,
        options.onApprove
      );
    }

    const oneInchTrade: OneInchSwapResponse = (await this.httpClient
      .get(`${this.apiBaseUrl}swap`, {
        params: {
          fromTokenAddress,
          toTokenAddress,
          amount: fromAmount,
          slippage: this.settings.slippageTolerance.toString(),
          fromAddress: this.providerConnectorService.address
        }
      })
      .pipe(
        catchError(err => {
          throw new CustomError(err.error.message);
        })
      )
      .toPromise()) as OneInchSwapResponse;

    const increasedGas = new BigNumber(oneInchTrade.tx.gas).multipliedBy(1.25).toFixed(0);

    if (fromTokenAddress !== this.oneInchNativeAddress) {
      await this.provideAllowance(
        trade.from.token.address,
        new BigNumber(fromAmount),
        oneInchTrade.tx.to,
        options.onApprove
      );

      return this.web3Private.sendTransaction(oneInchTrade.tx.to, '0', {
        onTransactionHash: options.onConfirm,
        data: oneInchTrade.tx.data,
        gas: increasedGas,
        gasPrice: oneInchTrade.tx.gasPrice
      });
    }

    return this.web3Private.sendTransaction(oneInchTrade.tx.to, fromAmount, {
      onTransactionHash: options.onConfirm,
      data: oneInchTrade.tx.data,
      gas: increasedGas,
      gasPrice: oneInchTrade.tx.gasPrice,
      inWei: true
    });
  }

  private getOneInchTokenSpecificAddresses(
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken
  ): { fromTokenAddress: string; toTokenAddress: string } {
    const fromTokenAddress = this.web3Public.isNativeAddress(fromToken.address)
      ? this.oneInchNativeAddress
      : fromToken.address;
    const toTokenAddress = this.web3Public.isNativeAddress(toToken.address)
      ? this.oneInchNativeAddress
      : toToken.address;
    return { fromTokenAddress, toTokenAddress };
  }

  protected checkSettings(selectedBlockchain: BLOCKCHAIN_NAME) {
    if (!this.providerConnectorService.isProviderActive) {
      throw new WalletError();
    }
    if (!this.providerConnectorService.address) {
      throw new AccountError();
    }
    if (this.providerConnectorService.networkName !== selectedBlockchain) {
      if (this.providerConnectorService.networkName !== `${selectedBlockchain}_TESTNET`) {
        if (this.providerConnectorService.providerName === WALLET_NAME.METAMASK) {
          throw new NetworkError(selectedBlockchain);
        } else {
          throw new NotSupportedNetworkError(selectedBlockchain);
        }
      }
    }
  }

  protected async checkBalance(trade: InstantTrade): Promise<void> {
    const amountIn = trade.from.amount.multipliedBy(10 ** trade.from.token.decimals).toFixed(0);

    if (this.web3Public.isNativeAddress(trade.from.token.address)) {
      const balance = await this.web3Public.getBalance(this.providerConnectorService.address, {
        inWei: true
      });
      if (balance.lt(amountIn)) {
        const formattedBalance = this.web3Public.weiToEth(balance);
        throw new InsufficientFundsError(
          trade.from.token.symbol,
          formattedBalance,
          trade.from.amount.toString()
        );
      }
    } else {
      const tokensBalance = await this.web3Public.getTokenBalance(
        this.providerConnectorService.address,
        trade.from.token.address
      );
      if (tokensBalance.lt(amountIn)) {
        const formattedTokensBalance = tokensBalance
          .div(10 ** trade.from.token.decimals)
          .toString();
        throw new InsufficientFundsError(
          trade.from.token.symbol,
          formattedTokensBalance,
          trade.from.amount.toString()
        );
      }
    }
  }

  protected async provideAllowance(
    tokenAddress: string,
    value: BigNumber,
    targetAddress: string,
    onApprove?: (hash: string) => void
  ): Promise<void> {
    const allowance = await this.web3Public.getAllowance(
      tokenAddress,
      this.providerConnectorService.address,
      targetAddress
    );
    if (value.gt(allowance)) {
      const uintInfinity = new BigNumber(2).pow(256).minus(1);
      await this.web3Private.approveTokens(tokenAddress, targetAddress, uintInfinity, {
        onTransactionHash: onApprove
      });
    }
  }
}
