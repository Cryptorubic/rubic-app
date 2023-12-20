import { ChangeDetectionStrategy, Component, Inject, Input } from '@angular/core';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import { HeaderStore } from '@core/header/services/header.store';
import { CalculationStatus } from '@features/trade/models/calculation-status';

@Component({
  selector: 'app-layer3-widget',
  templateUrl: './layer3-widget.component.html',
  styleUrls: ['./layer3-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Layer3WidgetComponent {
  @Input({ required: true }) isTradeCalculating: CalculationStatus;

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

    layerWidget.style.width = '100%';
    layerWidget.style.zIndex = '1000';
    layerWidget.style.position = 'relative';
    layerWidget.style.pointerEvents = 'auto';

    this.window.addEventListener('message', event => {
      if (event.data === 'closeModal') {
        if (this.isMobile) {
          layerWidget.style.position = 'static';
          layerWidget.style.top = 'initial';
          layerWidget.style.height = 'initial';
          layerWidget.style.marginTop = '-95px';
        } else {
          layerWidget.style.position = 'relative';
          layerWidget.style.height = 'auto';
          layerWidget.style.width = '100%';
          layerWidget.style.left = '0';
          layerWidget.style.top = '0';
        }
      }

      if (event.data === 'modalOpened') {
        if (this.isMobile) {
          layerWidget.style.position = 'absolute';
          layerWidget.style.top = '0';
          layerWidget.style.left = '0';
          layerWidget.style.height = '100vh';
        } else {
          layerWidget.style.position = 'absolute';
          layerWidget.style.height = '656px';
          layerWidget.style.width = '700px';
          layerWidget.style.borderRadius = '15px';
          layerWidget.style.left = this.isTradeCalculating.activeCalculation ? '22%' : '-10%';
          layerWidget.style.top = '-10%';
        }
      }
    });
  }
}
