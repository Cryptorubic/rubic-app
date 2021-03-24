import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { HeaderStore } from 'src/app/core/header/services/header.store';

@Component({
  selector: 'app-header-navigation',
  templateUrl: './header-navigation.component.html',
  styleUrls: ['./header-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderNavigationComponent {
  public readonly $isMobile: Observable<boolean>;

  constructor(private readonly headerStore: HeaderStore) {
    this.$isMobile = this.headerStore.getMobileMenuOpeningStatus();
  }
}
