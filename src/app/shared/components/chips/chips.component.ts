import { EventEmitter, ChangeDetectionStrategy, Component, Input, Output } from '@angular/core';
import { compareObjects } from '@app/shared/utils/utils';

interface Chip {
  label: string;
  value: unknown;
}

@Component({
  selector: 'app-chips',
  templateUrl: './chips.component.html',
  styleUrls: ['./chips.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChipsComponent {
  @Input() chips: Chip[];

  @Input('value')
  set initialValue(chip: Chip) {
    if (chip) {
      this.selectedValue = chip.value;
    }
  }

  @Output() onSelect = new EventEmitter<unknown>();

  public selectedValue: unknown;

  constructor() {}

  public isSelected(value: unknown): boolean {
    return compareObjects(value as object, this.selectedValue as object);
  }

  public select(value: unknown): void {
    if (this.isSelected(value)) {
      return;
    }

    this.selectedValue = value;
    this.onSelect.emit(value);
  }
}
