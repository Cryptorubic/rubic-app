import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeaderStore } from 'src/app/core/header/services/header.store';

@Component({
  selector: 'app-mobile-menu-toggler',
  templateUrl: './mobile-menu-toggler.component.html',
  styleUrls: ['./mobile-menu-toggler.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileMenuTogglerComponent {
  public readonly isMobileMenuOpened$ = this.headerStore.isMobileMenuOpened$;

  constructor(private readonly headerStore: HeaderStore) {}

  public toggleMenu(): void {
    this.headerStore.toggleMobileMenuOpeningStatus();
  }
}
