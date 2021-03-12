import {
  Component,
  Inject,
  PLATFORM_ID,
  ViewChild,
  ChangeDetectorRef,
  HostListener,
  TemplateRef
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UserInterface } from 'src/app/core/services/user/user.interface';
import { UserService } from 'src/app/core/services/user/user.service';
import { Observable } from 'rxjs';
import { HeaderStore } from '../../services/header.store';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  public readonly $isMobileMenuOpened: Observable<boolean>;

  public readonly $isMobile: Observable<boolean>;

  @ViewChild('headerPage') public headerPage: TemplateRef<any>;

  public pageScrolled: boolean;

  public currentUser: UserInterface;

  constructor(
    @Inject(PLATFORM_ID) platformId,
    private readonly userService: UserService,
    private readonly cdr: ChangeDetectorRef,
    private readonly headerStore: HeaderStore
  ) {
    this.pageScrolled = false;
    this.$isMobileMenuOpened = this.headerStore.getMobileMenuOpeningStatus();
    this.$isMobile = this.headerStore.getMobileDisplayStatus();
    this.headerStore.setMobileDisplayStatus(window.innerWidth <= this.headerStore.mobileWidth);
    this.currentUser = this.userService.getUserModel();
    this.userService.getCurrentUser().subscribe((userProfile: UserInterface) => {
      this.currentUser = userProfile;
      this.cdr.detectChanges();
    });
    if (isPlatformBrowser(platformId)) {
      const scrolledHeight = 50;
      window.onscroll = () => {
        const scrolled = window.pageYOffset || document.documentElement.scrollTop;
        this.pageScrolled = scrolled > scrolledHeight;
      };
    }
  }

  /**
   * Triggering redefining status of using mobile.
   */
  @HostListener('window:resize', ['$event'])
  public onResize() {
    this.headerStore.setMobileDisplayStatus(window.innerWidth <= this.headerStore.mobileWidth);
  }
}
