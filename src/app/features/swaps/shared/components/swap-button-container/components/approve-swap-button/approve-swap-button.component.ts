import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-approve-swap-button',
  templateUrl: './approve-swap-button.component.html',
  styleUrls: ['./approve-swap-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApproveSwapButtonComponent {
  @Output() readonly onApproveClick = new EventEmitter<void>();

  @Output() readonly onSwapClick = new EventEmitter<void>();

  @Input() buttonText: string;
}
