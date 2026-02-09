import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-wrong-receiver-error',
  templateUrl: './wrong-receiver-error.component.html',
  styleUrls: ['./wrong-receiver-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WrongReceiverErrorComponent {}
