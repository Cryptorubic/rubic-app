import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { HeaderStore } from '@app/core/header/services/header.store';

@Component({
  selector: 'app-chart-toggler',
  templateUrl: './chart-toggler.component.html',
  styleUrls: ['./chart-toggler.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartTogglerComponent {
  @Input() showChart: boolean = false;

  @Output() handleClick: EventEmitter<void> = new EventEmitter();

  public get icon(): string {
    return this.showChart
      ? 'assets/images/icons/chart-active.svg'
      : 'assets/images/icons/chart-inactive.svg';
  }

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  constructor(private readonly headerStore: HeaderStore) {}
}
