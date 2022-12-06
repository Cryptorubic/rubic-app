import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { OptionsComponent } from '@core/header/models/settings-component';

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

  constructor() {}
}
