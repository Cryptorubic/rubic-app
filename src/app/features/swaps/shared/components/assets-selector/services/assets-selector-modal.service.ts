import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { Inject, Injectable, Injector } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { Observable } from 'rxjs';
import { IframeService } from '@core/services/iframe/iframe.service';
import { AssetsSelectorComponent } from '@features/swaps/shared/components/assets-selector/components/assets-selector/assets-selector.component';
import { Asset } from '@features/swaps/shared/models/form/asset';
import { WindowWidthService } from '@app/core/services/widnow-width-service/window-width.service';
import { WindowSize } from '@app/core/services/widnow-width-service/models/window-size';
import { MobileNativeModalService } from '@app/core/services/modal/mobile-native-modal.service';

@Injectable()
export class AssetsSelectorModalService {
  constructor(
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private injector: Injector,
    private readonly iframeService: IframeService,
    private readonly windowWidthService: WindowWidthService,
    private readonly mobileNativeService: MobileNativeModalService
  ) {}

  /**
   * Show tokens dialog.
   * @param formType Tokens type (from || to).
   * @param idPrefix Id prefix for GA.
   */
  public showDialog(formType: 'from' | 'to', idPrefix: string = ''): Observable<Asset> {
    const size = this.iframeService.isIframe ? 'fullscreen' : 'l';

    if (this.windowWidthService.windowSize <= WindowSize.MOBILE_MD) {
      return this.mobileNativeService.open(
        new PolymorpheusComponent(AssetsSelectorComponent, this.injector),
        {
          size,
          data: {
            formType,
            idPrefix
          }
        }
      );
    }

    return this.dialogService.open(
      new PolymorpheusComponent(AssetsSelectorComponent, this.injector),
      {
        size,
        data: {
          formType,
          idPrefix
        }
      }
    );
  }
}
