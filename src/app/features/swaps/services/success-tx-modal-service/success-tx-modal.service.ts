import { Inject, Injectable, Injector, INJECTOR } from '@angular/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { SuccessTxModalComponent } from 'src/app/shared/components/success-tx-modal/success-tx-modal.component';
import { TuiDialogService } from '@taiga-ui/core';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';

@Injectable()
export class SuccessTxModalService {
  constructor(
    @Inject(INJECTOR) private readonly injector: Injector,
    private readonly dialogService: TuiDialogService,
    private readonly iframeService: IframeService
  ) {}

  public open(): void {
    const size = this.iframeService.isIframe ? 'fullscreen' : 's';
    this.dialogService
      .open(new PolymorpheusComponent(SuccessTxModalComponent, this.injector), {
        size,
        data: { idPrefix: '' }
      })
      .subscribe();
  }
}
