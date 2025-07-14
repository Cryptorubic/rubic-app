import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-berachella-tickets-info',
  templateUrl: './berachella-tickets-info.component.html',
  styleUrls: ['./berachella-tickets-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BerachellaTicketsInfoComponent {
  @Input({ required: true }) public readonly tickets: number | null;
}
