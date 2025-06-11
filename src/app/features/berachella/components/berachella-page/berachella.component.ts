import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { BerachellaStateService } from '@features/berachella/services/berachella-state.service';
import { BerachellaActionService } from '@features/berachella/services/berachella-action.service';

@Component({
  selector: 'app-berachella-page',
  templateUrl: './berachella.component.html',
  styleUrls: ['./berachella.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class BerachellaComponent {
  public readonly userTickets$ = this.stateService.userTickets$;

  public readonly winChance$ = this.stateService.winChances$;

  constructor(
    private readonly stateService: BerachellaStateService,
    private readonly actionService: BerachellaActionService
  ) {}

  public signMessage(): void {
    this.actionService.signMessage().then(el => {
      console.log(el);
    });
  }
}
