import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-rubic-toggler-theme',
  templateUrl: './rubic-toggler-theme.component.html',
  styleUrls: ['./rubic-toggler-theme.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicTogglerThemeComponent {
  get isDark(): boolean {
    return this.themeForm.get('themeControl').value;
  }

  @Output() onClickEmit: EventEmitter<MouseEvent> = new EventEmitter();

  public themeForm = new FormGroup({
    themeControl: new FormControl(true)
  });

  onClick(event: MouseEvent) {
    this.onClickEmit.emit(event);
  }
}
