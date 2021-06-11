import { ChangeDetectionStrategy, Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-cross-button',
  templateUrl: './cross-button.component.html',
  styleUrls: ['./cross-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrossButtonComponent {
  @Output() crossButtonClick = new EventEmitter<void>();

  constructor() {}

  onClick() {
    this.crossButtonClick.emit();
  }
}
