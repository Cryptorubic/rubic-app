import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-warning-disclaimer',
  templateUrl: './warning-disclaimer.component.html',
  styleUrls: ['./warning-disclaimer.component.scss']
})
export class WarningDisclaimerComponent {
  @Input() warningText: string;

  @Input() tooltipText? = '';

  constructor() {}
}
