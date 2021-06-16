import { Component, ChangeDetectionStrategy, Inject, Injector } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { WalletsModalComponent } from 'src/app/core/header/components/header/components/wallets-modal/wallets-modal.component';

@Component({
  selector: 'app-swaps-button',
  templateUrl: './swaps-button.component.html',
  styleUrls: ['./swaps-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapsButtonComponent {
  public get allowSwap(): boolean {
    return Boolean(this.authService?.user);
  }

  constructor(
    public authService: AuthService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private injector: Injector
  ) {}

  public async handleClick(): Promise<void> {
    if (!this.allowSwap) {
      this.showModal();
      // eslint-disable-next-line no-empty
    } else {
    }
  }

  private showModal(): void {
    this.dialogService
      .open(new PolymorpheusComponent(WalletsModalComponent, this.injector), { size: 's' })
      .subscribe();
  }
}
