import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-withdraw-modal',
  templateUrl: './withdraw-modal.component.html',
  styleUrls: ['./withdraw-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WithdrawModalComponent {
  constructor() {}
}
