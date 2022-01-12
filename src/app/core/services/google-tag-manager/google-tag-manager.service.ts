import { Injectable } from '@angular/core';
import { GoogleTagManagerService as AngularGoogleTagManagerService } from 'angular-google-tag-manager';
import { WALLET_NAME } from '@core/wallets/components/wallets-modal/models/wallet-name';
import { BehaviorSubject, EMPTY, interval } from 'rxjs';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/models/swap-provider-type';
import { switchMap, take, tap } from 'rxjs/operators';

const formEventCategoryMap = {
  [SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING]: 'multi-chain-swap',
  [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: 'swap',
  [SWAP_PROVIDER_TYPE.BRIDGE]: 'bridge'
};

const formStepsInitial = {
  fromTokenSelected: false,
  toTokenSelected: false
};

interface IFormSteps {
  fromTokenSelected: boolean;
  toTokenSelected: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleTagManagerService {
  private instantTradeSteps$ = new BehaviorSubject<IFormSteps>(formStepsInitial);

  private bridgeSteps$ = new BehaviorSubject<IFormSteps>(formStepsInitial);

  private multiChainSteps$ = new BehaviorSubject<IFormSteps>(formStepsInitial);

  private forms = {
    [SWAP_PROVIDER_TYPE.BRIDGE]: this.bridgeSteps$,
    [SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING]: this.multiChainSteps$,
    [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: this.instantTradeSteps$
  };

  private toggleGtmSessionTimer$ = new BehaviorSubject<boolean>(false);

  public gtmSessionTimer$ = this.toggleGtmSessionTimer$.pipe(
    switchMap(toggle => {
      return toggle
        ? interval(1000).pipe(
            take(1860),
            tap(v => {
              if (v === 1800) {
                Object.values(this.forms).forEach(form$ => form$.next(formStepsInitial));
              }
            })
          )
        : EMPTY;
    })
  );

  constructor(private readonly angularGtmService: AngularGoogleTagManagerService) {}

  /**
   * Reloads GTM session timer.
   */
  public reloadGtmTimer(): void {
    this.toggleGtmSessionTimer$.next(true);
  }

  /**
   * Starts GTM session timer.
   */
  public startGtmTimer(): void {
    this.gtmSessionTimer$.subscribe();
    this.reloadGtmTimer();
  }

  /**
   * Fires GTM event when user interacts with form.
   * @param eventCategory Swap type.
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
   * Updates steps passed by user in any from.
   * @param swapMode Form type.
   * @param step Which token selected.
   * @param value Selected token.
   */
  public updateFormStep(swapMode: SWAP_PROVIDER_TYPE, step: keyof IFormSteps, value: string): void {
    const formStep$ = this.forms[swapMode];
    if (!formStep$.getValue()[step]) {
      formStep$.next({ ...formStep$.getValue(), [step]: true });
      this.fireFormInteractionEvent(swapMode, value);
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
    this.angularGtmService.pushTag({
      event: 'GAevent',
      ecategory: 'wallet',
      eaction: `connect_wallet_${walletName}`,
      elabel: undefined
    });
  }
}
