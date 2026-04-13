import { Component } from '@angular/core';
import { MobileNativeModalService } from '@app/core/modals/services/mobile-native-modal.service';
import { GoogleTagManagerService } from '@app/core/services/google-tag-manager/google-tag-manager.service';
import { MOBILE_NAVIGATION_LIST } from 'src/app/core/header/components/header/components/rubic-menu/constants/navigation-list';
import { NavigationItem } from '../rubic-menu/models/navigation-item';
import { ROUTE_PATH } from '@app/shared/constants/common/links';

@Component({
  selector: 'app-mobile-navigation-menu',
  templateUrl: './mobile-navigation-menu.component.html',
  styleUrls: ['./mobile-navigation-menu.component.scss']
})
export class MobileNavigationMenuComponent {
  public readonly mobileNavigationList = MOBILE_NAVIGATION_LIST.Trade.filter(
    listItem => listItem.translateKey !== 'ChangeNow Tx'
  );

  constructor(
    private readonly mobileNativeService: MobileNativeModalService,
    private readonly gtmService: GoogleTagManagerService
  ) {}

  public mobileClose(item: NavigationItem): void {
    if (item.link === ROUTE_PATH.PRIVACY) {
      this.gtmService.fireSwitchModeEvent('private');
    } else if (item.link === ROUTE_PATH.NONE) {
      this.gtmService.fireSwitchModeEvent('regular');
    }
    this.mobileNativeService.forceClose();
  }
}
