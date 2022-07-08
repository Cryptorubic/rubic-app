import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-bitkeep-error',
  templateUrl: './bitkeep-error.component.html',
  styleUrls: ['./bitkeep-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BitKeepErrorComponent {
  constructor() {}
}
