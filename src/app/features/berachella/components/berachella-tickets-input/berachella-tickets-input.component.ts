import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BerachellaStateService } from '@features/berachella/services/berachella-state.service';
import { first } from 'rxjs/operators';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';

@Component({
  selector: 'app-berachella-tickets-input',
  templateUrl: './berachella-tickets-input.component.html',
  styleUrls: ['./berachella-tickets-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BerachellaTicketsInputComponent {
  public readonly ticketsForm = this.berachellaStateService.ticketsForm;

  @Input({ required: true }) public readonly tickets: number = 100000;

  constructor(
    private readonly berachellaStateService: BerachellaStateService,
    private readonly gtmService: GoogleTagManagerService
  ) {
    this.ticketsForm.controls.tickets.valueChanges
      .pipe(first(Boolean))
      .subscribe(() => this.gtmService.fireBerachaellaEvent('input_click'));
  }
}
