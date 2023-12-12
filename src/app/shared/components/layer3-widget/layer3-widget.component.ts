import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import { WindowWidthService } from '@core/services/widnow-width-service/window-width.service';

@Component({
  selector: 'app-layer3-widget',
  templateUrl: './layer3-widget.component.html',
  styleUrls: ['./layer3-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Layer3WidgetComponent {
  constructor(
    @Inject(WINDOW) private readonly window: RubicWindow,
    private readonly windowWidth: WindowWidthService
  ) {}

  public setupIframe(): void {
    const layerWidget = this.window.document.querySelector(
      'iframe#layer3-widget'
    ) as HTMLIFrameElement;
    console.log(layerWidget);

    this.window.addEventListener('message', event => {
      if (event) {
        console.log(event);
      }
    });
  }
}
