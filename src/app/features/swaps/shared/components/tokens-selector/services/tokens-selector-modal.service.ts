import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { Inject, Injectable, Injector } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { Observable } from 'rxjs';
import { IframeService } from '@core/services/iframe/iframe.service';
import { TokensSelectorComponent } from '@features/swaps/shared/components/tokens-selector/components/tokens-selector/tokens-selector.component';
import { FromAsset } from '@features/swaps/shared/models/form/asset';

@Injectable()
export class TokensSelectorModalService {
  constructor(
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private injector: Injector,
    private readonly iframeService: IframeService
  ) {}

  /**
   * Show tokens dialog.
   * @param formType Tokens type (from || to).
   * @param idPrefix Id prefix for GA.
   */
  public showDialog(formType: 'from' | 'to', idPrefix: string = ''): Observable<FromAsset> {
    const size = this.iframeService.isIframe ? 'fullscreen' : 'l';
    return this.dialogService.open(
      new PolymorpheusComponent(TokensSelectorComponent, this.injector),
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
