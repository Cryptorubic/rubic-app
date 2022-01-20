import { Inject, Injectable } from '@angular/core';
import { GoogleTagManagerService as AngularGoogleTagManagerService } from 'angular-google-tag-manager';
import { WALLET_NAME } from '@core/wallets/components/wallets-modal/models/wallet-name';
import { BehaviorSubject } from 'rxjs';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/models/swap-provider-type';
import { CookieService } from 'ngx-cookie-service';
import { addMinutes } from 'date-and-time';
import { StoreService } from '@core/services/store/store.service';
import { FormSteps } from '@core/services/google-tag-manager/models/google-tag-manager';
import { WINDOW } from '@ng-web-apis/common';

const formEventCategoryMap = {
  [SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING]: 'multi-chain-swap',
  [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: 'swap',
  [SWAP_PROVIDER_TYPE.BRIDGE]: 'bridge'
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
  private readonly instantTradeSteps$ = new BehaviorSubject<FormSteps>(formStepsInitial);

  private readonly bridgeSteps$ = new BehaviorSubject<FormSteps>(formStepsInitial);

  private readonly multiChainSteps$ = new BehaviorSubject<FormSteps>(formStepsInitial);

  private readonly forms = {
    [SWAP_PROVIDER_TYPE.BRIDGE]: this.bridgeSteps$,
    [SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING]: this.multiChainSteps$,
    [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: this.instantTradeSteps$
  };

  private _windowBeforeUnloadAdded$ = new BehaviorSubject<boolean>(false);

  private _localStorageDataFetched$ = new BehaviorSubject<boolean>(false);

  get isGtmSessionActive(): boolean {
    return Boolean(this.cookieService.get('gtmSessionActive'));
  }

  constructor(
    private readonly angularGtmService: AngularGoogleTagManagerService,
    private readonly cookieService: CookieService,
    private readonly storeService: StoreService,
    @Inject(WINDOW) private window: Window
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
   * Stops GTM session.
   */
  public stopGtmSession(): void {
    this.cookieService.delete('gtmSessionActive');
  }

  /**
   * Reloads GTM session.
   */
  public reloadGtmSession(): void {
    if (!this.isGtmSessionActive) {
      this.clearPassedFormSteps();
    }

    this.stopGtmSession();
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
  public fireFormInteractionEvent(eventCategory: SWAP_PROVIDER_TYPE, value: string): void {
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
  public updateFormStep(swapMode: SWAP_PROVIDER_TYPE, step: keyof FormSteps): void {
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
   * @param revenue Platform's commission.
   * @param fromToken What token user wants to sell.
   * @param toToken What token user wants to buy.
   * @param txUsdAmount Amount of trade in USD.
   */
  public fireTxSignedEvent(
    eventCategory: SWAP_PROVIDER_TYPE,
    txId: string,
    revenue: number,
    fromToken: string,
    toToken: string,
    txUsdAmount: number
  ): void {
    this.forms[eventCategory].next(formStepsInitial);
    this.angularGtmService.pushTag({
      event: 'transactionSigned',
      ecategory: eventCategory,
      eaction: `${eventCategory}_success`,
      elabel: undefined,
      eventNoninteraction: false,
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
              price: txUsdAmount,
              category: eventCategory,
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
   * Fetches passed form steps from local storage.
   */
  public fetchPassedFormSteps(): void {
    if (!this._localStorageDataFetched$.value && this.isGtmSessionActive) {
      const data = this.storeService.fetchData();
      Object.keys(this.forms).forEach((key: SWAP_PROVIDER_TYPE) => {
        if (data[key]) {
          this.forms[key].next(data[key]);
        }
      });
      this._localStorageDataFetched$.next(true);
    }
  }

  /**
   * Puts passed form steps in local storage.
   */
  public savePassedFormSteps(): void {
    Object.keys(this.forms).forEach((key: SWAP_PROVIDER_TYPE) => {
      const formSteps = this.forms[key].getValue();
      this.storeService.setItem(key, formSteps);
    });
  }

  /**
   * Clears passed form steps in local storage and within current session.
   */
  public clearPassedFormSteps(): void {
    Object.keys(this.forms).forEach((key: SWAP_PROVIDER_TYPE) => {
      this.forms[key].next(formStepsInitial);
      this.storeService.deleteItem(key);
    });
  }

  /**
   * Adds google tag manager to DOM immediately.
   */
  public addGtmToDom(): void {
    this.angularGtmService.addGtmToDom();
  }
}
