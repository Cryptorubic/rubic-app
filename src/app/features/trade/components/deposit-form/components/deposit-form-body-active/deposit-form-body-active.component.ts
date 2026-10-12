import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DepositFormManager } from '../../services/injectable/deposit-form-manager';

@Component({
  selector: 'app-deposit-form-body-active',
  standalone: false,
  templateUrl: './deposit-form-body-active.component.html',
  styleUrl: './deposit-form-body-active.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositFormBodyActiveComponent {
  constructor(private readonly depositFormManager: DepositFormManager) {}
}
