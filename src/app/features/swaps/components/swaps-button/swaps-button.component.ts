import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-swaps-button',
  templateUrl: './swaps-button.component.html',
  styleUrls: ['./swaps-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapsButtonComponent {
  public get allowSwap(): boolean {
    return true;
  }

  constructor() {}
}
