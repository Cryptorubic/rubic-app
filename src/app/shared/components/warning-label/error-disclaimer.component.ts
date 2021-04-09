import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-disclaimer',
  templateUrl: './error-disclaimer.component.html',
  styleUrls: ['./error-disclaimer.component.scss']
})
export class ErrorDisclaimerComponent {
  @Input() errorText: string;

  @Input() tooltipText? = '';

  constructor() {}
}
