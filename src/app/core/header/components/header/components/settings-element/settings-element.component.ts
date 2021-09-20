import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ComponentType } from '@angular/cdk/overlay';

@Component({
  selector: 'app-settings-element',
  templateUrl: './settings-element.component.html',
  styleUrls: ['./settings-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsElementComponent {
  @Input() title: string;

  @Input() desc: string;

  @Input() component: ComponentType<object>;

  @Input() withAction: boolean;

  constructor() {}
}
