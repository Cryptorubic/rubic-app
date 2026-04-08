import { Injectable } from '@angular/core';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { BehaviorSubject } from 'rxjs';
import { SWAP_PROVIDER_TYPE } from '@features/trade/models/swap-provider-type';
import {
  FormSteps,
  PrivateFlowTabEvent,
  SwitchModeEvent
} from '@core/services/google-tag-manager/models/google-tag-manager';
import { GoogleAnalyticsService } from '@hakimio/ngx-google-analytics';
import BigNumber from 'bignumber.js';
import { RubicError } from '@app/core/errors/models/rubic-error';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import { CrossChainTrade } from '../sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { OnChainTrade } from '../sdk/sdk-legacy/features/on-chain/calculation-manager/common/on-chain-trade/on-chain-trade';
import { BlockchainName, nativeTokensList, PriceTokenAmount, Token } from '@cryptorubic/core';
import { SdkLegacyService } from '../sdk/sdk-legacy/sdk-legacy.service';
import { RubicAny } from '@app/shared/models/utility-types/rubic-any';
import { ActivatedRoute, Router } from '@angular/router';

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

  constructor(
    private readonly angularGtmService: GoogleAnalyticsService,
    private readonly sdkLegacyService: SdkLegacyService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute
  ) {}

  private getCurrentPage(): string {
    const pathWithoutQuery = this.router.url.split('?')[0].split('#')[0];
    const segments = pathWithoutQuery.split('/').filter(segment => segment.length > 0);
    const lastSegment = segments[segments.length - 1] ?? '';
    return lastSegment ? `${lastSegment}_page` : 'main_page';
  }

  /**
   * Fires when clicking on banner.
   */
  public fireClickOnBannerEvent(bannerText: string, bannerLink: string): void {
    this.angularGtmService.gtag('event', 'click_banner', {
      page: this.getCurrentPage(),
      page_section: 'top_banner',
      banner_text: bannerText,
      destination: bannerLink
    });
  }

  /**
   * Fires click on tokenIn/tokenOut rate chart.
   */
  public fireOpenChart(from: BalanceToken | null, to: BalanceToken | null): void {
    this.angularGtmService.gtag('event', 'open_chart', {
      input: from ? JSON.stringify({ blockchain: from.blockchain, symbol: from.symbol }) : null,
      output: to ? JSON.stringify({ blockchain: to.blockchain, symbol: to.symbol }) : null
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
   * Fires when clicking on connect wallet button.
   */
  public fireClickOnConnectWalletButtonEvent(buttonHierarchy: 'header' | 'form'): void {
    this.angularGtmService.gtag('event', 'click_connect_wallet', {
      page: this.getCurrentPage(),
      button_hierarchy: buttonHierarchy
    });
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
    const adapter = this.sdkLegacyService.adaptersFactoryService.getAdapter(
      fromToken.blockchain as RubicAny
    );
    const [nativeBalanceWei, fromTokenBalanceWei] = await Promise.all([
      adapter.getBalance(walletAddress),
      adapter.getBalance(walletAddress, fromToken.address)
    ]);

    const nativeToken = nativeTokensList[fromToken.blockchain];
    const nativeBalance = Token.fromWei(nativeBalanceWei, nativeToken.decimals).toFixed();
    const fromTokenBalance = Token.fromWei(fromTokenBalanceWei, fromToken.decimals).toFixed();

    return [nativeBalance, fromTokenBalance];
  }

  public fireClickOnVerifyEvent(): void {
    this.angularGtmService.gtag('event', 'click_verify');
  }

  /**
   * Fires when the private mode page is opened.
   */
  public fireViewPrivateModePageEvent(entrySource?: string): void {
    entrySource =
      entrySource ?? this.activatedRoute.snapshot.queryParamMap.get('entry_source') ?? 'direct';
    this.angularGtmService.gtag('event', 'view_private_mode_page', {
      page: this.getCurrentPage(),
      entry_source: entrySource
    });
  }

  /**
   * Fires when switching app mode from header (Regular / Private / Testnets).
   */
  public fireSwitchModeEvent(selectedMode: SwitchModeEvent): void {
    this.angularGtmService.gtag('event', 'switch_mode', {
      page: this.getCurrentPage(),
      selected_mode: selectedMode
    });
  }

  /**
   * Fires when switching private flow tab (On-Chain / Cross-Chain / Transfer).
   */
  public fireSelectPrivateFlowTabEvent(flowType: PrivateFlowTabEvent): void {
    this.angularGtmService.gtag('event', 'select_private_flow_tab', {
      page: this.getCurrentPage(),
      flow_type: flowType
    });
  }

  /**
   * Fires when toggling "Show all … providers" on the private swap form.
   */
  public fireToggleShowAllProvidersEvent(flowType: PrivateFlowTabEvent, isEnabled: boolean): void {
    this.angularGtmService.gtag('event', 'toggle_show_all_providers', {
      page: this.getCurrentPage(),
      flow_type: flowType,
      is_enabled: isEnabled
    });
  }

  /**
   * Fires when floating live chat is opened.
   */
  public fireOpenChatEvent(): void {
    this.angularGtmService.gtag('event', 'open_chat', {
      page: this.getCurrentPage(),
      page_section: 'floating_chat'
    });
  }
}
