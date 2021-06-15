import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { SettingsComponent } from 'src/app/features/swaps/components/settings/settings.component';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';

@Component({
  selector: 'app-settings-container',
  templateUrl: './settings-container.component.html',
  styleUrls: ['./settings-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsContainerComponent implements OnInit {
  public settingsComponent: PolymorpheusComponent<SettingsComponent, any>;

  readonly items = ['Edit', 'Download', 'Rename', 'Delete'];

  public open: boolean;

  constructor() {
    this.open = false;
  }

  ngOnInit(): void {
    this.settingsComponent = new PolymorpheusComponent(SettingsComponent);
  }

  public optionChange(): void {}
}
