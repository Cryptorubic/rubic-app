import { Inject, Injectable, Injector, Component, Type } from '@angular/core';
import { RubicMenuComponent } from '@app/core/header/components/header/components/rubic-menu/rubic-menu.component';
import { AssetsSelectorComponent } from '@app/features/swaps/shared/components/assets-selector/components/assets-selector/assets-selector.component';
import { Asset } from '@app/features/swaps/shared/models/form/asset';
import { Observable } from 'rxjs';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { AbstractModalService } from './abstract-modal.service';
import { SettingsComponent } from '@app/core/header/components/header/components/settings/settings.component';
import { MobileUserProfileComponent } from '@app/core/header/components/header/components/mobile-user-profile/mobile-user-profile.component';
import { BlockchainsListComponent } from '@app/features/swaps/shared/components/assets-selector/components/blockchains-list/blockchains-list.component';
import { MobileNativeModalService } from './mobile-native-modal.service';
import { InstantTradeProviderData } from '@app/features/swaps/features/instant-trade/models/providers-controller-data';
import { ProvidersListMobileComponent } from '@app/features/swaps/features/instant-trade/components/providers-panels/components/providers-list-mobile/providers-list-mobile.component';
import { WalletsModalComponent } from '@app/core/wallets-modal/components/wallets-modal/wallets-modal.component';
import { SwapInfoContainerComponent } from '@app/features/swaps/features/swap-form/components/swap-info/components/swap-info-container/swap-info-container.component';
import { TradesListComponent } from '@app/features/swaps/features/cross-chain/components/cross-chain-bottom-form/components/best-trade-panel/components/trades-list/trades-list.component';
import { ExpirationOptionalComponent } from '@app/features/swaps/features/limit-order/components/expiration-optional/expiration-optional.component';
import { ExpirationCustomComponent } from '@app/features/swaps/features/limit-order/components/expiration-custom/expiration-custom.component';
import { IMobileNativeOptions, INextModal } from '../models/mobile-native-options';
import { CrossChainTaggedTrade } from '@app/features/swaps/features/cross-chain/models/cross-chain-tagged-trade';
import { SWAP_PROVIDER_TYPE } from '@app/features/swaps/features/swap-form/models/swap-provider-type';
import { TRADE_STATUS } from '@app/shared/models/swaps/trade-status';
import { InstantTradeInfo } from '@app/features/swaps/features/instant-trade/models/instant-trade-info';
import { RecentCrosschainTxComponent } from '@app/core/recent-trades/components/recent-crosschain-tx/recent-crosschain-tx.component';
import { TuiDialogOptions, TuiDialogSize } from '@taiga-ui/core';
import { MobileNavigationMenuComponent } from '@app/core/header/components/header/components/mobile-navigation-menu/mobile-navigation-menu.component';
import { TradesHistory } from '@core/header/components/header/components/mobile-user-profile/models/tradeHistory';
import { ArbitrumBridgeWarningModalComponent } from '@shared/components/arbitrum-bridge-warning-modal/arbitrum-bridge-warning-modal.component';
import { SettingsCcrComponent } from '@features/trade/components/settings-ccr/settings-ccr.component';
import { SettingsItComponent } from '@features/trade/components/settings-it/settings-it.component';

@Injectable()
export class ModalService {
  constructor(
    private readonly modalService: AbstractModalService,
    private readonly mobileModalService$: MobileNativeModalService,
    @Inject(Injector) private readonly injector: Injector
  ) {}

  /**
   * Show tokens dialog.
   * @param formType Tokens type (from || to).
   * @param idPrefix Id prefix for GA.
   */
  public openAssetsSelector(formType: 'from' | 'to', idPrefix: string = ''): Observable<Asset> {
    return this.showDialog<AssetsSelectorComponent, Asset>(AssetsSelectorComponent, {
      title: 'Select token',
      size: 'l',
      data: {
        formType,
        idPrefix
      }
    });
  }

  /**
   * Show Rubic Menu dialog.
   */
  public openRubicMenu(): Observable<void> {
    return this.showDialog<RubicMenuComponent, void>(RubicMenuComponent, {
      title: 'Menu',
      scrollableContent: true
    });
  }

  /**
   * Show Settings dialog.
   */
  public openSettings(injector: Injector): Observable<void> {
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
    return this.showDialog<MobileNavigationMenuComponent, void>(MobileNavigationMenuComponent, {
      title: 'Main Menu',
      fitContent: true
    });
  }

  /**
   * Show Cross-Chain Settings dialog.
   */
  public openCcrSettings(): Observable<void> {
    return this.showDialog(SettingsCcrComponent, {
      title: 'Cross-chain Settings',
      fitContent: true
    });
  }

  /**
   * Show Instant Trade Settings dialog.
   */
  public openItSettings(): Observable<void> {
    return this.showDialog<SettingsItComponent, void>(SettingsItComponent, {
      title: 'Instant Trade Settings',
      fitContent: true
    });
  }

  /**
   * Show User Profile dialog.
   */
  public openUserProfile(tradesHistory: TradesHistory): Observable<void> {
    return this.showDialog(MobileUserProfileComponent, {
      title: 'Account',
      fitContent: true,
      data: {
        tradesHistory
      }
    });
  }

  /**
   * Show Blockchain List dialog.
   * @param injector Injector.
   */
  public openBlockchainList(injector: Injector): void {
    this.mobileModalService$.openNextModal(
      BlockchainsListComponent,
      {
        title: 'Select Blockchain',
        scrollableContent: true
      },
      injector
    );
  }

  /**
   * Show Instant Trade Providers dialog.
   * @param data Instant Trade Providers data
   * @param injector Injector
   */
  public openProvidersModal(
    data: InstantTradeProviderData[],
    injector: Injector
  ): Observable<InstantTradeProviderData> {
    return this.showDialog(
      ProvidersListMobileComponent,
      {
        title: 'Available Providers',
        scrollableContent: true,
        data
      },
      injector
    );
  }

  /**
   * Show Cross Chain Providers dialog.
   * @param data Cross Chain Tagged Trades data
   * @param injector Injector
   */
  public openCrossChainProvidersModal(
    data: { taggedTrades: CrossChainTaggedTrade[] },
    injector?: Injector
  ): Observable<void> {
    return this.showDialog(
      TradesListComponent,
      {
        title: 'Available Cross-Chain Providers',
        scrollableContent: true,
        data
      },
      injector
    );
  }

  /**
   * Show Transaction Details dialog.
   * @param data Transaction Details data
   */
  public openSwapInfoModal(data: {
    swapType: SWAP_PROVIDER_TYPE;
    currentInstantTradeInfo: InstantTradeInfo;
    tradeStatus: TRADE_STATUS;
  }): Observable<void> {
    return this.showDialog(SwapInfoContainerComponent, {
      title: 'Transaction Details',
      fitContent: true,
      data
    });
  }

  /**
   * Show Limit Order Expiration Settings dialog.
   */
  public openExpirationalSettingsModal(): Observable<void> {
    return this.showDialog(ExpirationOptionalComponent, {
      title: 'Expires in',
      fitContent: true
    });
  }

  /**
   * Show Limit Order Expiration Custom dialog.
   * @param injector Injector
   */
  public openExpirationalCustomModal(injector: Injector): void {
    this.mobileModalService$.openNextModal(
      ExpirationCustomComponent,
      {
        title: 'Custom Expiration',
        fitContent: true
      },
      injector
    );
  }

  /**
   * Show Wallet Modal dialog.
   * @param injector Injector
   */
  public openWalletModal(injector: Injector): Observable<void> {
    return this.showDialog(WalletsModalComponent, { size: 's' }, injector);
  }

  /**
   * Show Recent Trades Modal dialog.
   */
  public openRecentTradesModal(data: { size: TuiDialogSize }): Observable<void> {
    return this.showDialog(RecentCrosschainTxComponent, {
      size: data.size
    });
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
    return this.modalService.open(new PolymorpheusComponent(component, injector || this.injector), {
      currentComponent: component,
      ...options
    });
  }

  /**
   * Show Wallet Modal dialog.
   */
  public openArbitrumWarningModal(): Observable<void> {
    return this.showDialog(ArbitrumBridgeWarningModalComponent, { size: 's' });
  }
}
