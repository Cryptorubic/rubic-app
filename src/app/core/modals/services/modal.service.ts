import { Component, Inject, Injectable, Injector, Type } from '@angular/core';
import { RubicMenuComponent } from '@app/core/header/components/header/components/rubic-menu/rubic-menu.component';
import { BehaviorSubject, catchError, finalize, firstValueFrom, Observable, of } from 'rxjs';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { AbstractModalService } from './abstract-modal.service';
import { SettingsComponent } from '@app/core/header/components/header/components/settings/settings.component';
import { MobileUserProfileComponent } from '@app/core/header/components/header/components/mobile-user-profile/mobile-user-profile.component';
import { MobileNativeModalService } from './mobile-native-modal.service';
import { WalletsModalComponent } from '@app/core/wallets-modal/components/wallets-modal/wallets-modal.component';
import {
  IMobileNativeOptions,
  INextModal,
  ModalName,
  ModalStruct
} from '../models/mobile-native-options';
import { TuiDialogOptions } from '@taiga-ui/core';
import { MobileNavigationMenuComponent } from '@app/core/header/components/header/components/mobile-navigation-menu/mobile-navigation-menu.component';
import { TradesHistory } from '@core/header/components/header/components/mobile-user-profile/models/tradeHistory';
import { ArbitrumBridgeWarningModalComponent } from '@shared/components/arbitrum-bridge-warning-modal/arbitrum-bridge-warning-modal.component';
import { SettingsCcrComponent } from '@features/trade/components/settings-ccr/settings-ccr.component';
import { SettingsItComponent } from '@features/trade/components/settings-it/settings-it.component';
import { RateChangedModalComponent } from '@shared/components/rate-changed-modal/rate-changed-modal.component';
import BigNumber from 'bignumber.js';
import { ClaimContainerComponent } from '@features/airdrop/components/claim-container/claim-container.component';
import { ProvidersListComponent } from '@features/trade/components/providers-list/providers-list.component';
import { TradeState } from '@features/trade/models/trade-state';
import { TradeProvider } from '@features/trade/models/trade-provider';
import { CalculationProgress } from '@features/trade/models/calculationProgress';
import { TokenSelectorPageComponent } from '@features/trade/components/token-selector-page/token-selector-page.component';
import { BlockchainsListComponent } from '@features/trade/components/assets-selector/components/blockchains-list/blockchains-list.component';
import { MevBotModalComponent } from '@shared/components/mev-bot-modal/mev-bot-modal.component';
import { FormType } from '@app/features/trade/models/form-type';
import { HeaderStore } from '@core/header/services/header.store';
import { WcChangeNetworkModalComponent } from '@shared/components/wc-change-network-modal/wc-change-network-modal.component';
import { BlockchainName, TonOnChainTrade } from 'rubic-sdk';
import { TonSlippageWarnModalComponent } from '@app/shared/components/ton-slippage-warn-modal/ton-slippage-warn-modal.component';
import { DepositRateChangedModalComponent } from '@app/shared/components/deposit-rate-update-modal/deposit-rate-changed-modal.component';
import { SelectedTrade } from '@app/features/trade/models/selected-trade';
import { DOCUMENT } from '@angular/common';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { MetamaskModalComponent } from '@shared/components/metamask-modal/metamask-modal.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private _openedModal$ = new BehaviorSubject<ModalStruct | null>(null);

  public get openedModal(): ModalStruct | null {
    return this._openedModal$.value;
  }

  public setOpenedModalName(modalName: ModalName | null): void {
    this._openedModal$.next({ ...this.openedModal, name: modalName });
  }

  public setModalEl(modalElData: Omit<ModalStruct, 'name'>): void {
    this._openedModal$.next({ ...this.openedModal, ...modalElData });
  }

  public closeModal(): void {
    if (!this.openedModal) return;
    this.openedModal.elRef.nativeElement.classList.add('hidden');
    this.openedModal.elRef.nativeElement.classList.remove('opened');
    this.openedModal.elRef.nativeElement.classList.remove('collapsed');
    this.openedModal.context.completeWith(null);
  }

  constructor(
    private readonly modalService: AbstractModalService,
    private readonly mobileModalService$: MobileNativeModalService,
    private readonly headerStore: HeaderStore,
    @Inject(Injector) private readonly injector: Injector,
    @Inject(DOCUMENT) private document: Document
  ) {}

  /**
   * Show tokens dialog.
   */
  public openAssetsSelector(formType: FormType, injector: Injector): Observable<void> {
    this.setOpenedModalName('token-selector');
    return this.showDialog<TokenSelectorPageComponent, void>(
      TokenSelectorPageComponent,
      {
        title: '',
        size: 'l',
        showMobileMenu: true,
        data: {
          formType
        }
      },
      injector
    );
  }

  /**
   * Show Old claims dialog.
   */
  public openOldClaims(isModal: boolean, injector: Injector): Observable<void> {
    this.setOpenedModalName('claim');
    return this.showDialog<ClaimContainerComponent, void>(
      ClaimContainerComponent,
      {
        title: 'Old Claims',
        scrollableContent: true,
        data: { isModal }
      },
      injector
    );
  }

  /**
   * Show Other providers list dialog.
   */
  public openOtherProvidersList(
    states: TradeState[],
    selectedTradeType: TradeProvider,
    calculationProgress: CalculationProgress,
    isModal: true,
    injector: Injector,
    noRoutes: boolean
  ): Observable<TradeProvider> {
    this.setOpenedModalName('other-provider-list');
    return this.showDialog<ProvidersListComponent, TradeProvider>(
      ProvidersListComponent,
      {
        title: 'Available Cross-Chain Providers',
        scrollableContent: true,
        data: {
          states,
          selectedTradeType,
          calculationProgress,
          isModal,
          shortedInfo: false,
          noRoutes
        }
      },
      injector
    );
  }

  /**
   * Show Rubic Menu dialog.
   */
  public openRubicMenu(): Observable<void> {
    this.setOpenedModalName('rubic-menu');
    return this.showDialog<RubicMenuComponent, void>(RubicMenuComponent, {
      title: 'Menu',
      scrollableContent: true
    });
  }

  /**
   * Show Settings dialog.
   */
  public openSettings(injector: Injector): Observable<void> {
    this.setOpenedModalName('settings');
    return this.showDialog<SettingsComponent, void>(
      SettingsComponent,
      {
        title: 'Settings',
        fitContent: true
      },
      injector
    );
  }

  /**
   * Show Mobile navigation menu dialog.
   */
  public openMobileNavigationMenu(): Observable<void> {
    this.setOpenedModalName('navigation');
    return this.showDialog<MobileNavigationMenuComponent, void>(MobileNavigationMenuComponent, {
      title: 'Main Menu',
      fitContent: true
    });
  }

  /**
   * Show Cross-Chain Settings dialog.
   */
  public openCcrSettings(injector: Injector): Observable<void> {
    this.setOpenedModalName('ccr-settings');
    return this.showDialog(
      SettingsCcrComponent,
      {
        title: 'Cross-chain Settings',
        fitContent: true
      },
      injector
    );
  }

  /**
   * Show Instant Trade Settings dialog.
   */
  public openItSettings(injector: Injector): Observable<void> {
    this.setOpenedModalName('onchain-settings');
    return this.showDialog<SettingsItComponent, void>(
      SettingsItComponent,
      {
        title: 'On-chain Settings',
        fitContent: true
      },
      injector
    );
  }

  /**
   * Show User Profile dialog.
   */
  public openUserProfile(tradesHistory: TradesHistory): Observable<void> {
    this.setOpenedModalName('profile');
    return this.showDialog<MobileUserProfileComponent, void>(MobileUserProfileComponent, {
      title: 'Account',
      fitContent: true,
      data: {
        tradesHistory
      }
    });
  }

  /**
   * Show Blockchain List dialog.
   * @param _injector Injector.
   */
  public openMobileBlockchainList(_injector: Injector): void {
    this.mobileModalService$.openNextModal(
      BlockchainsListComponent,
      {
        title: '',
        scrollableContent: true
      },
      _injector
    );
  }

  /**
   * Show Wallet Modal dialog.
   * @param injector Injector
   */
  public openWalletModal(injector: Injector): Observable<void> {
    this.setOpenedModalName('wallet');
    return this.showDialog<WalletsModalComponent, void>(
      WalletsModalComponent,
      { title: 'Connect wallet', size: 'm', fitContent: true },
      injector
    );
  }

  /**
   * Show Next Modal dialog.
   * @param component Next Modal component
   * @param options Next Modal data.
   * @param injector Injector
   */
  public openNextModal(
    component: Type<Component & object>,
    options?: INextModal,
    injector?: Injector
  ): Observable<void> {
    return this.showDialog(
      component,
      {
        ...options
      },
      injector
    );
  }

  /**
   *
   * @param component Modal Component
   * @param options Modal options
   * @param injector Injector
   */
  public showDialog<Component, Output>(
    component: Type<Component & object>,
    options?: IMobileNativeOptions & Partial<TuiDialogOptions<object>>,
    injector?: Injector
  ): Observable<Output> {
    //@ts-ignore
    return this.modalService
      .open(new PolymorpheusComponent(component, injector || this.injector), {
        currentComponent: component,
        ...options
      })
      .pipe(finalize(() => this.setOpenedModalName(null)));
  }

  /**
   * Show Wallet Modal dialog.
   */
  public openArbitrumWarningModal(): Observable<void> {
    this.setOpenedModalName('arbitrum-warning');
    return this.showDialog(ArbitrumBridgeWarningModalComponent, { size: 's' });
  }

  public openDepositTradeRateChangedModal(trade: SelectedTrade): Promise<boolean> {
    this.setOpenedModalName('deposit-trade-rate-change');
    return firstValueFrom(
      this.showDialog(DepositRateChangedModalComponent, {
        size: 's',
        closeable: false,
        required: true,
        data: { trade }
      }).pipe(catchError(() => of(false))) as Observable<boolean>
    );
  }

  public openRateChangedModal(
    oldAmount: BigNumber,
    newAmount: BigNumber,
    tokenSymbol: string
  ): Observable<boolean> {
    this.setOpenedModalName('rate-change');
    return this.showDialog(RateChangedModalComponent, {
      size: 's',
      data: { oldAmount, newAmount, tokenSymbol },
      required: true
    });
  }

  public openMevBotModal(): Observable<boolean> {
    this.setOpenedModalName('mev-bot');
    return this.showDialog(MevBotModalComponent, {
      size: 's',
      scrollableContent: true
    });
  }

  public openWcChangeNetworkModal(
    oldBlockchain: BlockchainName,
    newBlockchain: BlockchainName
  ): Observable<boolean> {
    this.setOpenedModalName('wc-change-network');
    return this.showDialog(WcChangeNetworkModalComponent, {
      size: 's',
      data: { oldBlockchain, newBlockchain }
    });
  }

  /**
   * @param slippage from 0 to 1
   */
  public openTonSlippageWarning(trade: TonOnChainTrade): Promise<boolean> {
    this.setOpenedModalName('ton-slippage-warning');
    return firstValueFrom(
      this.showDialog(TonSlippageWarnModalComponent, {
        size: 'm',
        data: { trade },
        closeable: false
      })
    );
  }

  public openMetamaskModal(): Promise<WALLET_NAME> {
    return firstValueFrom(
      this.showDialog(MetamaskModalComponent, {
        size: 'auto',
        closeable: true,
        fitContent: true
      })
    );
  }
}
