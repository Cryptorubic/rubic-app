import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { WINDOW } from '@ng-web-apis/common';
import { fromEvent, timer } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { OnramperFormService } from '@features/swaps/features/onramper-exchange/services/onramper-form.service';
import { OnramperWidgetService } from '@features/swaps/features/onramper-exchange/services/onramper-widget.service';

@Component({
  selector: 'app-onramper-widget',
  templateUrl: './onramper-widget.component.html',
  styleUrls: ['./onramper-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnramperWidgetComponent {
  public readonly showBackButton$ = timer(2500).pipe(
    map(() => true),
    startWith(false)
  );

  public readonly widgetUrl$ = this.onramperWidgetService.getWidgetUrl();

  public readonly widgetWidth$ = fromEvent(this.window, 'resize').pipe(
    startWith(null),
    map(() => Math.min(565, this.window.innerWidth - 40) + 'px')
  );

  constructor(
    private readonly onramperFormService: OnramperFormService,
    private readonly onramperWidgetService: OnramperWidgetService,
    @Inject(WINDOW) private readonly window: Window
  ) {}

  public closeWidget(): void {
    this.onramperFormService.widgetOpened = false;
  }
}
