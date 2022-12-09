import { ChangeDetectionStrategy, Component } from '@angular/core';
import { OnramperFormService } from '@features/swaps/features/onramper-exchange/services/onramper-bottom-form-service/onramper-form.service';
import { OnramperWidgetService } from '@features/swaps/features/onramper-exchange/services/onramper-widget-service/onramper-widget.service';

@Component({
  selector: 'app-onramper-widget',
  templateUrl: './onramper-widget.component.html',
  styleUrls: ['./onramper-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnramperWidgetComponent {
  public readonly widgetUrl$ = this.onramperWidgetService.getWidgetUrl();

  constructor(
    private readonly onramperFormService: OnramperFormService,
    private readonly onramperWidgetService: OnramperWidgetService
  ) {}

  public closeWidget(): void {
    this.onramperFormService.widgetOpened = false;
  }
}
