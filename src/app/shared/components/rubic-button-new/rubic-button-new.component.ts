import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TuiSizeL, TuiSizeM, TuiSizeS } from '@taiga-ui/core';

@Component({
  selector: 'app-rubic-button-new',
  standalone: false,
  templateUrl: './rubic-button-new.component.html',
  styleUrl: './rubic-button-new.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicButtonNewComponent {
  @Input() disabled: boolean = false;

  @Input() loading: boolean = false;

  @Input() appearance: 'primary' | 'secondary' = 'primary';

  @Input() size: TuiSizeL | TuiSizeM | TuiSizeS = 'm';

  @Output() onClick: EventEmitter<void> = new EventEmitter();

  public handleClick(): void {
    if (!this.disabled) {
      this.onClick.emit();
    }
  }
}
