import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-window-container',
  templateUrl: './window-container.component.html',
  styleUrls: ['./window-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WindowContainerComponent {}
