import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-deposit-info-readonly-detail',
  standalone: false,
  templateUrl: './deposit-info-readonly-detail.component.html',
  styleUrl: './deposit-info-readonly-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositInfoReadonlyDetailComponent {
  @Input() labelTop: string = '';

  @Input() labelBottom: string = '';
}
