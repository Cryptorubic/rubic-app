import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import { HeaderStore } from '@core/header/services/header.store';

@Component({
  selector: 'app-layer3-widget',
  templateUrl: './layer3-widget.component.html',
  styleUrls: ['./layer3-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Layer3WidgetComponent {
  public isMobile = false;

  constructor(
    private readonly headerStore: HeaderStore,
    @Inject(WINDOW) private readonly window: RubicWindow
  ) {
    this.isMobile = headerStore.isMobile;
  }

  public setupIframe(): void {
    const layerWidget = this.window.document.querySelector(
      'iframe#layer3-widget'
    ) as HTMLIFrameElement;

    if (this.isMobile) {
      layerWidget.style.width = '100%';
      layerWidget.style.marginBottom = '60px';
      layerWidget.style.marginTop = '-95px';
      layerWidget.style.zIndex = '1000';
    } else {
      layerWidget.style.width = '310px';
      layerWidget.style.position = 'absolute';
      layerWidget.style.top = '435px';
      layerWidget.style.left = '15px';
      layerWidget.style.zIndex = '1000';
    }

    this.window.addEventListener('message', event => {
      if (event.data === 'closeModal') {
        if (this.isMobile) {
          layerWidget.style.position = 'static';
          layerWidget.style.top = 'initial';
          layerWidget.style.height = 'initial';
          layerWidget.style.marginTop = '-95px';
        } else {
          layerWidget.style.height = 'auto';
          layerWidget.style.width = '310px';
          layerWidget.style.left = '15px';
          layerWidget.style.top = '435px';
          layerWidget.style.transform = 'translate(0, 0)';
        }
      }

      if (event.data === 'modalOpened') {
        if (this.isMobile) {
          layerWidget.style.position = 'absolute';
          layerWidget.style.top = '0';
          layerWidget.style.height = '100vh';
          layerWidget.style.marginTop = '0';
        } else {
          layerWidget.style.height = '656px';
          layerWidget.style.width = '700px';
          layerWidget.style.borderRadius = '15px';
          layerWidget.style.left = '50%';
          layerWidget.style.top = '50%';
          layerWidget.style.transform = 'translate(-50%, -50%)';
        }
      }
    });
  }
}
