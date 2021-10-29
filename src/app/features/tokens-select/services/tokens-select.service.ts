import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { Inject, Injectable, Injector } from '@angular/core';
import { TuiDialogService, TuiDialogSize } from '@taiga-ui/core';
import { Observable } from 'rxjs';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { FormGroup } from '@ngneat/reactive-forms';
import { ISwapFormInput } from 'src/app/shared/models/swaps/ISwapForm';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { TokensSelectComponent } from '../components/tokens-select/tokens-select.component';

@Injectable()
export class TokensSelectService {
  constructor(
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private injector: Injector,
    private readonly iframeService: IframeService
  ) {}

  /**
   * Show tokens dialog.
   * @param tokens Tokens to show.
   * @param formType Tokens type (from || to)
   * @param currentBlockchain Tokens blockchain.
   * @param form Swap form information.
   * @param allowedBlockchains Allowed blockchains for list.
   * @param idPrefix Id prefix for GA.
   */
  public showDialog(
    tokens: Observable<AvailableTokenAmount[]>,
    formType: 'from' | 'to',
    currentBlockchain: BLOCKCHAIN_NAME,
    form: FormGroup<ISwapFormInput>,
    allowedBlockchains: BLOCKCHAIN_NAME[] | undefined,
    idPrefix: string = ''
  ): Observable<TokenAmount> {
    const size = (this.iframeService.isIframe ? 'fullscreen' : 'm') as TuiDialogSize;
    return this.dialogService.open(
      new PolymorpheusComponent(TokensSelectComponent, this.injector),
      {
        size,
        data: {
          tokens,
          currentBlockchain,
          formType,
          form,
          allowedBlockchains,
          idPrefix
        }
      }
    );
  }
}
