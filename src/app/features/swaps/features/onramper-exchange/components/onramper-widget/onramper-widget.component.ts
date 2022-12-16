import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { OnramperFormService } from '@features/swaps/features/onramper-exchange/services/onramper-form-service/onramper-form.service';
import { OnramperWidgetService } from '@features/swaps/features/onramper-exchange/services/onramper-widget-service/onramper-widget.service';
import { WINDOW } from '@ng-web-apis/common';
import { fromEvent } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { IframeService } from '@core/services/iframe/iframe.service';

@Component({
  selector: 'app-onramper-widget',
  templateUrl: './onramper-widget.component.html',
  styleUrls: ['./onramper-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnramperWidgetComponent {
  public readonly widgetUrl$ = this.onramperWidgetService.getWidgetUrl();

  public readonly widgetWidth$ = fromEvent(this.window, 'resize').pipe(
    startWith(null),
    map(() => Math.min(565, this.window.innerWidth - 40) + 'px')
  );

  public readonly isIframe = this.iframeService.isIframe;

  public readonly iframeSize = {
    width: '350px',
    height: '500px'
  };

  constructor(
    private readonly onramperFormService: OnramperFormService,
    private readonly onramperWidgetService: OnramperWidgetService,
    private readonly iframeService: IframeService,
    @Inject(WINDOW) private readonly window: Window
  ) {}

  public closeWidget(): void {
    this.onramperFormService.widgetOpened = false;
  }
}
