import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-berachella-winning-chances',
  templateUrl: './berachella-winning-chances.component.html',
  styleUrls: ['./berachella-winning-chances.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BerachellaWinningChancesComponent {
  @Input({ required: true }) public readonly winningChance: number | null;
}
