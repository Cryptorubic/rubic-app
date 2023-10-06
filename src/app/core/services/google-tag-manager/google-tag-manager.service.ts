import { Inject, Injectable } from '@angular/core';
import { GoogleTagManagerService as AngularGoogleTagManagerService } from 'angular-google-tag-manager';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { BehaviorSubject } from 'rxjs';
import BigNumber from 'bignumber.js';
import { CookieService } from 'ngx-cookie-service';
import { addMinutes } from 'date-and-time';
import { StoreService } from '@core/services/store/store.service';
import { FormSteps } from '@core/services/google-tag-manager/models/google-tag-manager';
import { WINDOW } from '@ng-web-apis/common';
import { HttpService } from 'src/app/core/services/http/http.service';
import { RubicWindow } from '@shared/utils/rubic-window';
import { SWAP_PROVIDER_TYPE } from '@features/trade/models/swap-provider-type';

type SupportedSwapProviderType =
  | SWAP_PROVIDER_TYPE.INSTANT_TRADE
  | SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING;

const formEventCategoryMap = {
  [SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING]: 'multi-chain-swap',
  [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: 'swap'
};

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

  private readonly _windowBeforeUnloadAdded$ = new BehaviorSubject<boolean>(false);

  private readonly _localStorageDataFetched$ = new BehaviorSubject<boolean>(false);

  private readonly _needTrackFormEventsNow$ = new BehaviorSubject<boolean>(true);

  set needTrackFormEventsNow(value: boolean) {
    this._needTrackFormEventsNow$.next(value);
  }

  get needTrackFormEventsNow(): boolean {
    return this._needTrackFormEventsNow$.getValue();
  }

  get isGtmSessionActive(): boolean {
    return Boolean(this.cookieService.get('gtmSessionActive'));
  }

  constructor(
    private readonly angularGtmService: AngularGoogleTagManagerService,
    private readonly cookieService: CookieService,
    private readonly storeService: StoreService,
    private readonly httpService: HttpService,
    @Inject(WINDOW) private readonly window: RubicWindow
  ) {}

  /**
   * Starts GTM session.
   */
  public startGtmSession(): void {
    if (!this.isGtmSessionActive) {
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

    if (!this._windowBeforeUnloadAdded$.value) {
      this.window.addEventListener('beforeunload', () => {
        if (this.isGtmSessionActive) {
          this.savePassedFormSteps();
        } else {
          this.clearPassedFormSteps();
        }
      });
      this._windowBeforeUnloadAdded$.next(true);
    }
  }

  /**
   * Reloads GTM session.
   */
  public reloadGtmSession(): void {
    if (!this.isGtmSessionActive) {
      this.clearPassedFormSteps();
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
   * Fires GTM event when user interacts with form.
   * @param eventCategory Form type.
   * @param value User's selected token or approve action.
   */
  public fireFormInteractionEvent(eventCategory: SupportedSwapProviderType, value: string): void {
    this.angularGtmService.pushTag({
      event: 'GAevent',
      ecategory: formEventCategoryMap[eventCategory],
      eaction: `${formEventCategoryMap[eventCategory]}_${value}`,
      elabel: undefined
    });
  }

  /**
   * Updates step passed by user in any from.
   * @param swapMode Form type.
   * @param step Which token selected.
   */
  public updateFormStep(swapMode: SupportedSwapProviderType, step: keyof FormSteps): void {
    const formStep$ = this.forms[swapMode];
    if (!formStep$.getValue()[step]) {
      formStep$.next({ ...formStep$.getValue(), [step]: true });
      this.fireFormInteractionEvent(swapMode, step);
    }
  }

  /**
   * Fires "transaction signed" GTM event and resets steps of swap type's form.
   * @param eventCategory Swap type.
   * @param txId Transaction hash.
   * @param fromToken Source token.
   * @param toToken End Token.
   * @param revenue System commission in USD.
   * @param price The actual cost of the sent volume of tokens.
   */
  public fireTxSignedEvent(
    eventCategory: SupportedSwapProviderType,
    txId: string,
    fromToken: string,
    toToken: string,
    revenue: BigNumber,
    price: BigNumber
  ): void {
    this.forms[eventCategory].next(formStepsInitial);
    this.angularGtmService.pushTag({
      event: 'transactionSigned',
      ecategory: formEventCategoryMap[eventCategory],
      eaction: `${formEventCategoryMap[eventCategory]}_success`,
      elabel: undefined,
      interactionType: false,
      ecommerce: {
        currencyCode: 'USD',
        purchase: {
          actionField: {
            id: txId,
            revenue: revenue
          },
          products: [
            {
              name: `${fromToken} to ${toToken}`,
              price: price,
              category: formEventCategoryMap[eventCategory],
              quantity: 1
            }
          ]
        }
      }
    });
  }

  /**
   * Fires wallet GTM event.
   * @param walletName User's wallet provider.
   */
  public fireConnectWalletEvent(walletName: WALLET_NAME): void {
    this.reloadGtmSession();
    this.angularGtmService.pushTag({
      event: 'GAevent',
      ecategory: 'wallet',
      eaction: `connect_wallet_${walletName}`,
      elabel: undefined
    });
  }

  /**
   * Fires GTM event when user clicks.
   */
  public fireClickEvent(ecategory: string, eaction: string): void {
    this.angularGtmService.pushTag({
      event: 'GAevent',
      ecategory: ecategory,
      eaction: eaction,
      elabel: undefined
    });
  }

  /**
   * Fires GTM event on transaction error.
   */
  public fireTransactionError(ecategory: string, eaction: string): void {
    this.angularGtmService.pushTag({
      event: 'GAevent',
      ecategory: ecategory,
      eaction: eaction.toLowerCase().split(' ').join('_'),
      elabel: undefined
    });
  }

  /**
   * Fetches passed form steps from local storage.
   */
  public fetchPassedFormSteps(): void {
    if (!this._localStorageDataFetched$.value && this.isGtmSessionActive) {
      const data = this.storeService.fetchData();
      Object.keys(this.forms).forEach((key: SupportedSwapProviderType) => {
        if (key === SWAP_PROVIDER_TYPE.INSTANT_TRADE && data?.['RUBIC_TRADES_INSTANT_TRADE']) {
          this.forms[key].next(data?.['RUBIC_TRADES_INSTANT_TRADE']);
        }
        if (
          key === SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING &&
          data?.['RUBIC_TRADES_CROSS_CHAIN_ROUTING']
        ) {
          this.forms[key].next(data?.['RUBIC_TRADES_CROSS_CHAIN_ROUTING']);
        }
      });
      this._localStorageDataFetched$.next(true);
    }
  }

  /**
   * Puts passed form steps in local storage.
   */
  public savePassedFormSteps(): void {
    Object.keys(this.forms).forEach((key: SupportedSwapProviderType) => {
      const formSteps = this.forms[key].getValue();
      if (key === SWAP_PROVIDER_TYPE.INSTANT_TRADE) {
        this.storeService.setItem('RUBIC_TRADES_INSTANT_TRADE', formSteps);
      }
      if (key === SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING) {
        this.storeService.setItem('RUBIC_TRADES_CROSS_CHAIN_ROUTING', formSteps);
      }
    });
  }

  /**
   * Clears passed form steps in local storage and within current session.
   */
  public clearPassedFormSteps(): void {
    Object.keys(this.forms).forEach((key: SupportedSwapProviderType) => {
      this.forms[key].next(formStepsInitial);

      if (key === SWAP_PROVIDER_TYPE.INSTANT_TRADE) {
        this.storeService.deleteItem('RUBIC_TRADES_INSTANT_TRADE');
      }
      if (key === SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING) {
        this.storeService.deleteItem('RUBIC_TRADES_CROSS_CHAIN_ROUTING');
      }
    });
  }

  /**
   * Adds google tag manager to DOM immediately.
   */
  public addGtmToDom(): void {
    this.angularGtmService.addGtmToDom();
  }
}
