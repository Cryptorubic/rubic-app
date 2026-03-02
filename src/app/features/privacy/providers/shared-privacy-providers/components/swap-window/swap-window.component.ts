import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-swap-window',
  templateUrl: './swap-window.component.html',
  styleUrls: ['./swap-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapWindowComponent {}
