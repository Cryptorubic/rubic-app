import { Component, ChangeDetectionStrategy, Inject, Injector, Input } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { WalletsModalComponent } from 'src/app/core/header/components/header/components/wallets-modal/wallets-modal.component';
import { SwapsService } from 'src/app/features/swaps/services/swaps-service/swaps.service';

@Component({
  selector: 'app-swaps-button',
  templateUrl: './swaps-button.component.html',
  styleUrls: ['./swaps-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapsButtonComponent {
  @Input() disabled: boolean;

  public get allowSwap(): boolean {
    return Boolean(this.authService?.user);
  }

  constructor(
    private readonly authService: AuthService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private injector: Injector,
    private readonly swapsService: SwapsService
  ) {}

  public async handleClick(): Promise<void> {
    if (!this.allowSwap) {
      this.showModal();
      // eslint-disable-next-line no-empty
    } else {
      this.swapsService.createTrade();
    }
  }

  private showModal(): void {
    this.dialogService
      .open(new PolymorpheusComponent(WalletsModalComponent, this.injector), { size: 's' })
      .subscribe();
  }
}
