import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BerachellaStateService } from '@features/berachella/services/berachella-state.service';

@Component({
  selector: 'app-berachella-tickets-input',
  templateUrl: './berachella-tickets-input.component.html',
  styleUrls: ['./berachella-tickets-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BerachellaTicketsInputComponent {
  public readonly ticketsForm = this.berachellaStateService.ticketsForm;

  @Input({ required: true }) public readonly tickets: number = 100000;

  constructor(private readonly berachellaStateService: BerachellaStateService) {}
}
