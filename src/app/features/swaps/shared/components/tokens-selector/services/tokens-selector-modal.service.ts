import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { Inject, Injectable, Injector } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { Observable } from 'rxjs';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { IframeService } from '@core/services/iframe/iframe.service';
import { TokensSelectorComponent } from '@features/swaps/shared/components/tokens-selector/components/tokens-selector/tokens-selector.component';
import { SwapFormInputControl } from '@app/features/swaps/core/services/swap-form-service/models/swap-form-controls';
import { FormGroup } from '@angular/forms';

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
   * @param form Swap form information.
   * @param idPrefix Id prefix for GA.
   */
  public showDialog(
    formType: 'from' | 'to',
    form: FormGroup<SwapFormInputControl>,
    idPrefix: string = ''
  ): Observable<TokenAmount> {
    const size = this.iframeService.isIframe ? 'fullscreen' : 'l';
    return this.dialogService.open(
      new PolymorpheusComponent(TokensSelectorComponent, this.injector),
      {
        size,
        data: {
          formType,
          form,
          idPrefix
        }
      }
    );
  }
}
