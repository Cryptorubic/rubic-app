import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { Inject, Injectable, Injector } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { Observable } from 'rxjs';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { FormGroup } from '@ngneat/reactive-forms';
import { ISwapFormInput } from 'src/app/shared/models/swaps/ISwapForm';
import { TokensSelectComponent } from '../components/tokens-select/tokens-select.component';

@Injectable()
export class TokensSelectService {
  constructor(
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private injector: Injector
  ) {}

  showDialog(
    tokens: Observable<AvailableTokenAmount[]>,
    formType: 'from' | 'to',
    currentBlockchain: BLOCKCHAIN_NAME,
    form: FormGroup<ISwapFormInput>
  ): Observable<TokenAmount> {
    return this.dialogService.open(
      new PolymorpheusComponent(TokensSelectComponent, this.injector),
      {
        size: 's',
        data: {
          tokens,
          currentBlockchain,
          formType,
          form
        }
      }
    );
  }
}
