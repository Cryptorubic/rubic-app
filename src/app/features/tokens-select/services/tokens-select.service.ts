import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { Inject, Injectable, Injector } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { Observable } from 'rxjs';
import { TokensSelectComponent } from '../components/tokens-select/tokens-select.component';
import { TokenAmount } from '../../../shared/models/tokens/TokenAmount';

@Injectable()
export class TokensSelectService {
  constructor(
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private injector: Injector
  ) {}

  showDialog(): Observable<TokenAmount> {
    return this.dialogService.open(
      new PolymorpheusComponent(TokensSelectComponent, this.injector),
      { size: 's' }
    );
  }
}
