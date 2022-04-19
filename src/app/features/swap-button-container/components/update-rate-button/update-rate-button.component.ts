import { Component, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-update-rate-button',
  templateUrl: './update-rate-button.component.html',
  styleUrls: ['./update-rate-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpdateRateButtonComponent {
  @Output() onClick = new EventEmitter<void>();

  constructor() {}
}
