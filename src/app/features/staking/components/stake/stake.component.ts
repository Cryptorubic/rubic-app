import { Component, ChangeDetectionStrategy, Inject, Injector } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { FormControl } from '@angular/forms';

import { StakingService } from '../../services/staking.service';
import { STAKING_TOKENS } from '../../constants/STAKING_TOKENS';
import { TuiDestroyService } from '@taiga-ui/cdk';
import BigNumber from 'bignumber.js';
import { WalletsModalService } from '@app/core/wallets/services/wallets-modal.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-stake',
  templateUrl: './stake.component.html',
  styleUrls: ['./stake.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeComponent {
  public readonly DEFAULT_DECIMALS = 18;

  public loading$ = new BehaviorSubject<boolean>(false);

  public needLogin$ = this.stakingService.needLogin$;

  public amount = new FormControl('');

  public token = new FormControl(STAKING_TOKENS[0]);

  public selectedTokenBalance$ = this.stakingService.selectedTokenBalance$;

  constructor(
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector,
    private readonly stakingService: StakingService,
    private readonly destroy$: TuiDestroyService,
    private readonly walletsModalService: WalletsModalService
  ) {}

  public confirmStake(): void {
    this.stakingService
      .enterStake(new BigNumber(this.amount.value.split(',').join('')))
      .subscribe(console.log);
  }

  public login(): void {
    this.walletsModalService.open().subscribe();
  }

  // public openSwapModal(): void {
  //   console.log('work');
  //   this.dialogService
  //     .open(new PolymorpheusComponent(SwapModalComponent, this.injector), {
  //       size: 'l'
  //     })
  //     .subscribe((confirm: boolean) => {
  //       if (confirm) {
  //         console.log('work');
  //       }
  //     });
  // }
}
