import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-onramper-exchanger',
  templateUrl: './onramper-exchanger.component.html',
  styleUrls: ['./onramper-exchanger.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnramperExchangerComponent {
  public isWidgetOpened = false;

  constructor() {}

  public onSwapClick(): void {
    this.isWidgetOpened = true;
  }
}
