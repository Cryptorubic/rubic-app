import { Inject, Injectable, Injector, INJECTOR } from '@angular/core';
import { Observable } from 'rxjs';
import { WalletsModalComponent } from 'src/app/core/wallets-modal/components/wallets-modal/wallets-modal.component';
import { ModalService } from '@app/core/modals/services/modal.service';

@Injectable()
export class WalletsModalService {
  constructor(
    @Inject(INJECTOR) private readonly injector: Injector,
    private readonly dialogService: ModalService
  ) {}

  public open(): Observable<void> {
    return this.dialogService.showDialog(
      WalletsModalComponent,
      { title: 'Connect Wallet', size: 'l', fitContent: true },
      this.injector
    );
  }

  public open$(): void {
    this.open().subscribe();
  }
}
