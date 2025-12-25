import { AfterViewInit, ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';

@Component({
  selector: 'app-cf-widget',
  templateUrl: './cf-widget.component.html',
  styleUrls: ['./cf-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CfWidgetComponent implements AfterViewInit {
  constructor(@Inject(WINDOW) private window: RubicWindow) {}

  /**
   * Multiple
   * Lines
   * Comment
   */
  ngAfterViewInit(): void {
    // this.window.turnstile.ready(() => {
    //   const widgetId = this.window.turnstile.render('#turnstile-container', {
    //     sitekey: '0x4AAAAAACHJ5X5WghmT8crG',
    //     callback: (token: RubicAny) => {
    //       console.log('Success:', token);
    //     },
    //     'error-callback': (error: unknown) => {
    //       console.error('Error:', error);
    //     }
    //   });
    // });
  }
}
