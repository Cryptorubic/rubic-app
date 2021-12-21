// TODO refactor
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { Router } from '@angular/router';
import { StakingService } from '@features/staking/services/staking.service';

@Component({
  selector: 'app-swap-modal',
  templateUrl: './swap-modal.component.html',
  styleUrls: ['./swap-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapModalComponent {
  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean, null>,
    private readonly router: Router,
    private readonly stakingService: StakingService
  ) {}

  public navigateToSwaps(): void {
    this.router.navigate(['swaps']);
  }

  public swapViaPlatform(): void {}
}
