import { Inject, Injectable, Injector, INJECTOR } from '@angular/core';
import { Observable } from 'rxjs';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { WalletsModalComponent } from 'src/app/core/wallets-modal/components/wallets-modal/wallets-modal.component';
import { ModalService } from '@app/core/modals/services/modal.service';

@Injectable()
export class WalletsModalService {
  constructor(
    @Inject(INJECTOR) private readonly injector: Injector,
    private readonly dialogService: ModalService,
    private readonly iframeService: IframeService
  ) {}

  public open(): Observable<void> {
    const size = this.iframeService.isIframe ? 'fullscreen' : 's';
    return this.dialogService.showDialog(
      WalletsModalComponent,
      { title: 'Connect Wallet', size, fitContent: true },
      this.injector
    );
  }

  public open$(): void {
    this.open().subscribe();
  }
}
