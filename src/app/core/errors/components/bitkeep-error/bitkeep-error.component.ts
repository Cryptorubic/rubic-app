import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-bitkeep-error',
  templateUrl: './bitkeep-error.component.html',
  styleUrls: ['./bitkeep-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BitKeepErrorComponent {
  constructor() {}
}
