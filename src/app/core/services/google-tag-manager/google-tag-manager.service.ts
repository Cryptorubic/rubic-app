import { Injectable } from '@angular/core';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { BehaviorSubject } from 'rxjs';
import { SWAP_PROVIDER_TYPE } from '@features/trade/models/swap-provider-type';
import { CookieService } from 'ngx-cookie-service';
import { addMinutes } from 'date-and-time';
import { FormSteps } from '@core/services/google-tag-manager/models/google-tag-manager';
import { GoogleAnalyticsService } from '@hakimio/ngx-google-analytics';
import BigNumber from 'bignumber.js';
import {
  BlockchainName,
  CrossChainTrade,
  Injector,
  nativeTokensList,
  OnChainTrade,
  PriceTokenAmount,
  Web3Public,
  Web3Pure
} from 'rubic-sdk';
import { RubicError } from '@app/core/errors/models/rubic-error';

type SupportedSwapProviderType =
  | SWAP_PROVIDER_TYPE.INSTANT_TRADE
  | SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING;

const formStepsInitial = {
  token1: false,
  token2: false,
  approve: false
};

@Injectable({
  providedIn: 'root'
})
export class GoogleTagManagerService {
  private readonly _instantTradeSteps$ = new BehaviorSubject<FormSteps>(formStepsInitial);

  private readonly _multiChainSteps$ = new BehaviorSubject<FormSteps>(formStepsInitial);

  private readonly forms = {
    [SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING]: this._multiChainSteps$,
    [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: this._instantTradeSteps$
  };

  private readonly _needTrackFormEventsNow$ = new BehaviorSubject<boolean>(true);

  set needTrackFormEventsNow(value: boolean) {
    this._needTrackFormEventsNow$.next(value);
  }

  get isGtmSessionActive(): boolean {
    return Boolean(this.cookieService.get('gtmSessionActive'));
  }

  constructor(
    private readonly cookieService: CookieService,
    private readonly angularGtmService: GoogleAnalyticsService
  ) {}

  /**
   * Reloads GTM session.
   */
  public reloadGtmSession(): void {
    if (!this.isGtmSessionActive) {
      return;
    }

    this.cookieService.delete('gtmSessionActive');

    this.cookieService.set(
      'gtmSessionActive',
      'true',
      addMinutes(new Date(), 30),
      null,
      null,
      null,
      null
    );
  }

  /**
   * Fires click on banner GTM event.
   */
  public fireClickOnBannerEvent(banner_type: string): void {
    this.angularGtmService.gtag('event', 'click_banner', {
      banner_type
    });
  }

  /**
   * Fires click on swap button GTM event.
   */
  public fireClickOnSwapButtonEvent(tokenInName: string, tokenOutName: string): void {
    this.angularGtmService.gtag('event', 'click_swap', {
      input_token: tokenInName,
      output_token: tokenOutName
    });
  }

  /**
   * Fires wallet GTM event.
   */
  public fireClickOnConnectWalletButtonEvent(): void {
    this.angularGtmService.gtag('event', 'click_connect_wallet');
  }

  /**
   * Fires click on wallet provider GTM event.
   * @param walletName User's wallet provider.
   */
  public fireClickOnWalletProviderEvent(walletName: WALLET_NAME): void {
    this.angularGtmService.gtag('event', 'select_wallet', {
      wallet_type: walletName
    });
  }

  /**
   * Fires wallet GTM event.
   * @param walletName User's wallet provider.
   */
  public fireConnectWalletEvent(walletName: WALLET_NAME): void {
    this.angularGtmService.gtag('event', 'connect_wallet', {
      wallet_type: walletName
    });
  }

  /**
   * Fires token select GTM event.
   * @param tokenName Token name.
   */
  public fireSelectInputTokenEvent(tokenName: string): void {
    this.angularGtmService.gtag('event', `select_input_token`, {
      input_token: tokenName
    });
  }

  /**
   * Fires token select GTM event.
   * @param tokenName Token name.
   */
  public fireSelectOutputTokenEvent(tokenName: string): void {
    this.angularGtmService.gtag('event', `select_output_token`, {
      output_token: tokenName
    });
  }

  /**
   * Fires "transaction signed" GTM event and resets steps of swap type's form.
   * @param eventCategory Swap type.
   * @param txId Transaction hash.
   * @param fromToken Source token.
   * @param toToken End Token.
   * @param revenue System commission in USD.
   * @param price The actual cost of the sent volume of tokens.
   * @param swapType Type of swap.
   * @param useMevBotProtection Is MEV-bot protection used.
   */
  public fireTxSignedEvent(
    eventCategory: SupportedSwapProviderType,
    txId: string,
    fromToken: string,
    toToken: string,
    revenue: BigNumber,
    price: BigNumber,
    swapType: 'crosschain' | 'onchain',
    useMevBotProtection?: boolean
  ): void {
    this.forms[eventCategory].next(formStepsInitial);
    const item = [
      {
        item_id: swapType === 'crosschain' ? '00002' : '00001', // ID продукта
        item_name: `${swapType}_swap`, // Название свапа
        item_category: fromToken, // Начальный токен
        item_category2: toToken, // Конечный токен
        price: price.toFixed(), // общая сумма операции в USD
        quantity: 1
      }
    ];

    const options = {
      transaction_id: txId, //id транзакции в системе
      value: revenue.toFixed(), //комиссия системы в USD
      currency: 'USD',
      ...(useMevBotProtection && { use_mev_bot_protection: useMevBotProtection }),
      items: JSON.stringify(item)
    };

    this.angularGtmService.gtag('event', 'purchase', options);
  }

  /**
   * Fires GTM event on swap error.
   */
  public async fireSwapError(
    trade: CrossChainTrade | OnChainTrade,
    walletAddress: string,
    error: Error
  ): Promise<void> {
    const [nativeBalance, srcTokenBalance] = await this.getBalancesForGtagSwapError(
      trade.from,
      walletAddress
    );
    const isErrorDefined = error instanceof RubicError;
    const errorName = isErrorDefined ? error.constructor.name : error?.name;

    this.angularGtmService.gtag('event', 'swap_error', {
      input_token: trade.from.name,
      input_token_address: trade.from.address,
      input_token_amount: trade.from.tokenAmount.toFixed(),
      output_token: trade.to.name,
      output_token_address: trade.to.address,
      output_token_amount: trade.to.tokenAmount.toFixed(),
      network_from: trade.from.blockchain,
      network_to: trade.to.blockchain,
      provider: trade.type,
      wallet_address: walletAddress,
      token_from_ballance: srcTokenBalance,
      token_native_ballance: nativeBalance,
      identified_app_error: !isErrorDefined,
      identified_error_name: errorName
    });
  }

  private async getBalancesForGtagSwapError(
    fromToken: PriceTokenAmount<BlockchainName>,
    walletAddress: string
  ): Promise<[string, string]> {
    const web3Public = Injector.web3PublicService.getWeb3Public(fromToken.blockchain) as Web3Public;
    const [nativeBalanceWei, fromTokenBalanceWei] = await Promise.all([
      web3Public.getBalance(walletAddress),
      web3Public.getBalance(walletAddress, fromToken.address)
    ]);

    const nativeToken = nativeTokensList[fromToken.blockchain];
    const nativeBalance = Web3Pure.fromWei(nativeBalanceWei, nativeToken.decimals).toFixed();
    const fromTokenBalance = Web3Pure.fromWei(fromTokenBalanceWei, fromToken.decimals).toFixed();

    return [nativeBalance, fromTokenBalance];
  }

  public fireClickOnVerifyEvent(): void {
    this.angularGtmService.gtag('event', 'click_verify');
  }
}
