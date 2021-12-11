import { Component, ChangeDetectionStrategy, Inject, Injector } from '@angular/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { TuiDialogService } from '@taiga-ui/core';
import { SwapModalComponent } from '@features/staking/components/swap-modal/swap-modal.component';

@Component({
  selector: 'app-stake',
  templateUrl: './stake.component.html',
  styleUrls: ['./stake.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeComponent {
  constructor(
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector
  ) {}

  public openSwapModal(): void {
    console.log('work');
    this.dialogService
      .open(new PolymorpheusComponent(SwapModalComponent, this.injector), {
        size: 'l'
      })
      .subscribe((confirm: boolean) => {
        if (confirm) {
          console.log('work');
        }
      });
  }
}
