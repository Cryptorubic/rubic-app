import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-volume-cell',
  templateUrl: './volume-cell.component.html',
  styleUrls: ['./volume-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VolumeCellComponent {
  @Input() element: any;

  constructor() {}
}
