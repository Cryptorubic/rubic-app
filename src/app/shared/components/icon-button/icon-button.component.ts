import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-icon-button',
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconButtonComponent {
  public _disabled: boolean;

  @Input() icon: string;

  @Input() scale: number = 1;

  @Input('disabled') set setDisabled(disabled: boolean | '') {
    this._disabled = disabled === '' || disabled;
  }

  @Output()
  iconButtonClick = new EventEmitter<void>();

  public onClick() {
    this.iconButtonClick.emit();
  }

  constructor() {}
}
