import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { PrivateActionButtonService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-action-button/private-action-button.service';

@Component({
  selector: 'app-private-action-button',
  templateUrl: './private-action-button.component.html',
  styleUrls: ['./private-action-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivateActionButtonComponent {
  @Input() showLoader = false;

  @Output() onClick = new EventEmitter<void>();

  public readonly buttonState$ = this.privateationButtonService.buttonState$;

  constructor(private readonly privateationButtonService: PrivateActionButtonService) {}
}
