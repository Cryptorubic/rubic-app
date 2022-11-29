import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { Inject, Injectable, Injector } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { Observable } from 'rxjs';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { IframeService } from '@core/services/iframe/iframe.service';
import { TokensSelectorComponent } from '@features/onramper-exchange/components/onramper-exchanger/components/exchanger-form/components/tokens-selector/components/tokens-selector/tokens-selector.component';

@Injectable({
  providedIn: 'root'
})
export class TokensSelectorService {
  constructor(
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private injector: Injector,
    private readonly iframeService: IframeService
  ) {}

  /**
   * Show tokens dialog.
   */
  public showDialog(): Observable<TokenAmount> {
    const size = this.iframeService.isIframe ? 'fullscreen' : 'l';
    return this.dialogService.open(
      new PolymorpheusComponent(TokensSelectorComponent, this.injector),
      {
        size
      }
    );
  }
}
