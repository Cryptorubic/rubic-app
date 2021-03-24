import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-warning-label',
  templateUrl: './warning-label.component.html',
  styleUrls: ['./warning-label.component.scss']
})
export class WarningLabelComponent {
  @Input() warningText: string;

  constructor() {}
}
