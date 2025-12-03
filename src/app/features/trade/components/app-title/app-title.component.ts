import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-title',
  templateUrl: './app-title.component.html',
  styleUrls: ['./app-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppTitleComponent {}
