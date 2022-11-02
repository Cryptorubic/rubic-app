/* eslint-disable rxjs/finnish */
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { Inject, Injectable, Injector } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { Observable } from 'rxjs';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { BlockchainName } from 'rubic-sdk';
import { FormGroup } from '@ngneat/reactive-forms';
import { ISwapFormInput } from '@shared/models/swaps/swap-form';
import { IframeService } from '@core/services/iframe/iframe.service';
import { TokensSelectComponent } from '@features/swaps/shared/components/tokens-select/components/tokens-select/tokens-select.component';

@Injectable()
export class TokensSelectService {
  constructor(
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private injector: Injector,
    private readonly iframeService: IframeService
  ) {}

  /**
   * Show tokens dialog.
   * @param tokens$ Tokens to show.
   * @param favoriteTokens$ Favorite tokens to show.
   * @param formType Tokens type (from || to)
   * @param currentBlockchain Tokens blockchain.
   * @param form Swap form information.
   * @param idPrefix Id prefix for GA.
   */
  public showDialog(
    tokens$: Observable<AvailableTokenAmount[]>,
    favoriteTokens$: Observable<AvailableTokenAmount[]>,
    formType: 'from' | 'to',
    currentBlockchain: BlockchainName,
    form: FormGroup<ISwapFormInput>,
    idPrefix: string = ''
  ): Observable<TokenAmount> {
    const size = this.iframeService.isIframe ? 'fullscreen' : 'l';
    return this.dialogService.open(
      new PolymorpheusComponent(TokensSelectComponent, this.injector),
      {
        size,
        data: {
          tokens$,
          favoriteTokens$,
          currentBlockchain,
          formType,
          form,
          idPrefix
        }
      }
    );
  }
}
