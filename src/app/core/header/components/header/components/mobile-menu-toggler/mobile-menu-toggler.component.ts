import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { HeaderStore } from 'src/app/core/header/services/header.store';

@Component({
  selector: 'app-mobile-menu-toggler',
  templateUrl: './mobile-menu-toggler.component.html',
  styleUrls: ['./mobile-menu-toggler.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileMenuTogglerComponent {
  public readonly isMobileMenuOpened$: Observable<boolean>;

  constructor(private readonly headerStore: HeaderStore) {
    this.isMobileMenuOpened$ = this.headerStore.getMobileMenuOpeningStatus();
  }

  public toggleMenu(): void {
    this.headerStore.toggleMobileMenuOpeningStatus();
  }
}
