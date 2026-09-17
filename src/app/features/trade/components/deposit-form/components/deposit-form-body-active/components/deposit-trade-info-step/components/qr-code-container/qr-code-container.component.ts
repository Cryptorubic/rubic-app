import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-qr-code-container',
  standalone: false,
  templateUrl: './qr-code-container.component.html',
  styleUrl: './qr-code-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QrCodeContainerComponent {
  @Output() btnClicked: EventEmitter<void> = new EventEmitter();
}
