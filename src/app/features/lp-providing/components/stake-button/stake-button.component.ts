import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-stake-button',
  templateUrl: './stake-button.component.html',
  styleUrls: ['./stake-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeButtonComponent {
  constructor() {}
}
