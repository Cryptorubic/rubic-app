import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-stake-modal',
  templateUrl: './stake-modal.component.html',
  styleUrls: ['./stake-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeModalComponent {
  constructor() {}
}
