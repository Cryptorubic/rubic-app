import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { OptionsComponent } from '@core/header/models/settings-component';
import { HeaderStore } from '@core/header/services/header.store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ThemeService } from '@core/services/theme/theme.service';

@Component({
  selector: 'app-settings-element',
  templateUrl: './settings-element.component.html',
  styleUrls: ['./settings-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsElementComponent {
  @Input() title: string;

  @Input() desc: string;

  @Input() component: PolymorpheusComponent<OptionsComponent, object>;

  @Input() withAction: boolean;

  public readonly isMobile = this.headerStore.isMobile;

  public readonly isDark$: Observable<boolean> = this.themeService.theme$.pipe(
    map(theme => theme === 'dark')
  );

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly themeService: ThemeService
  ) {}
}
