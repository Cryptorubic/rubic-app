import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-history-view',
  templateUrl: './history-view.component.html',
  styleUrls: ['./history-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryViewComponent {}
