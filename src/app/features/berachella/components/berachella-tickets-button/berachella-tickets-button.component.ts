import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { BerachellaStateService } from '@features/berachella/services/berachella-state.service';
import { BerachellaActionService } from '@features/berachella/services/berachella-action.service';

@Component({
  selector: 'app-berachella-tickets-button',
  templateUrl: './berachella-tickets-button.component.html',
  styleUrls: ['./berachella-tickets-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BerachellaTicketsButtonComponent {
  public readonly isValid$ = this.stateService.isValid$;

  @Output() public readonly handleClick = new EventEmitter<void>();

  public readonly buttonState$ = this.actionService.buttonState$;

  constructor(
    private readonly stateService: BerachellaStateService,
    private readonly actionService: BerachellaActionService
  ) {}
}
