import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActionButtonService } from '@features/trade/services/action-button-service/action-button.service';

@Component({
  selector: 'app-action-button',
  templateUrl: './action-button.component.html',
  styleUrls: ['./action-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionButtonComponent {
  public readonly buttonState$ = this.actionButtonService.buttonState$;

  constructor(private readonly actionButtonService: ActionButtonService) {}
}
