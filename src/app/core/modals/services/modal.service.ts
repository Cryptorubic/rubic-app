import { Inject, Injectable, Injector, Type } from '@angular/core';
import { RubicMenuComponent } from '@app/core/header/components/header/components/rubic-menu/rubic-menu.component';
import { IframeService } from '@app/core/services/iframe/iframe.service';
import { SettingsItComponent } from '@app/features/swaps/features/swap-form/components/swap-settings/settings-it/settings-it.component';
import { AssetsSelectorComponent } from '@app/features/swaps/shared/components/assets-selector/components/assets-selector/assets-selector.component';
import { Asset } from '@app/features/swaps/shared/models/form/asset';
import { Observable } from 'rxjs';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { AbstractModalService } from './abstract-modal.service';
import { SettingsComponent } from '@app/core/header/components/header/components/settings/settings.component';
import { MobileLiveChatComponent } from '@app/core/header/components/header/components/mobile-live-chat/mobile-live-chat.component';
import { MobileUserProfileComponent } from '@app/core/header/components/header/components/mobile-user-profile/mobile-user-profile.component';

@Injectable()
export class ModalService {
  constructor(
    private readonly iframeService: IframeService,
    private readonly modalService: AbstractModalService,
    @Inject(Injector) private readonly injector: Injector
  ) {}

  /**
   * Show tokens dialog.
   * @param formType Tokens type (from || to).
   * @param idPrefix Id prefix for GA.
   */
  public openAssetsSelector(formType: 'from' | 'to', idPrefix: string = ''): Observable<Asset> {
    const size = this.iframeService.isIframe ? 'fullscreen' : 'l';
    return this.showDialog<
      AssetsSelectorComponent,
      { size: string; data: { formType: string; idPrefix: string } },
      Asset
    >(AssetsSelectorComponent, {
      size,
      data: {
        formType,
        idPrefix
      }
    });
  }

  public openRubicMenu(): Observable<void> {
    return this.showDialog<RubicMenuComponent, { title: string; fitContent: boolean }, void>(
      RubicMenuComponent,
      {
        fitContent: true,
        title: 'Menu'
      }
    );
  }

  public openSettings(): Observable<void> {
    return this.showDialog<SettingsComponent, { fitContent: boolean }, void>(SettingsComponent, {
      fitContent: true
    });
  }

  public openLiveChat(): Observable<void> {
    return this.showDialog(MobileLiveChatComponent, {
      fitContent: true
    });
  }

  public openSwapSettings(component: Type<SettingsItComponent>): Observable<void> {
    return this.showDialog<SettingsItComponent, { title: string; fitContent: boolean }, void>(
      component,
      {
        fitContent: true,
        title: 'Transaction details'
      }
    );
  }

  public openUserProfile(): Observable<void> {
    return this.showDialog(MobileUserProfileComponent, {
      fitContent: true,
      title: 'Account'
    });
  }

  private showDialog<Component, Options, Resolver>(
    component: Type<Component & object>,
    options?: Options
  ): Observable<Resolver> {
    return this.modalService.open(new PolymorpheusComponent(component, this.injector), {
      ...options
    });
  }
}
