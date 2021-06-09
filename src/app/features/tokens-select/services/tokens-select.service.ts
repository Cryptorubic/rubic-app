import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { Inject, Injectable, Injector } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { TokensSelectComponent } from '../components/tokens-select/tokens-select.component';

@Injectable()
export class TokensSelectService {
  constructor(
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private injector: Injector
  ) {}

  showDialog() {
    this.dialogService
      .open(new PolymorpheusComponent(TokensSelectComponent, this.injector), { size: 's' })
      .subscribe();
  }
}
