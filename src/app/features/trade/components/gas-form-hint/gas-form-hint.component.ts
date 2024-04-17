import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-gas-form-hint',
  templateUrl: './gas-form-hint.component.html',
  styleUrls: ['./gas-form-hint.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GasFormHintComponent {
  @Input({ required: true }) text: string;
}
