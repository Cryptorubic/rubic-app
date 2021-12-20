import { ChangeDetectionStrategy, Component, Inject, Injector, Self } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class StakeComponent {
  public readonly DEFAULT_DECIMALS = 18;

  public readonly loading$ = new BehaviorSubject<boolean>(false);

  public readonly needLogin$ = this.stakingService.needLogin$;

  public readonly amount = new FormControl('');

  public readonly token = new FormControl(STAKING_TOKENS[0]);

  public readonly selectedTokenBalance$ = this.stakingService.selectedTokenBalance$;

  public readonly userEnteredAmount$ = this.stakingService.userEnteredAmount$;

  constructor(
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly stakingService: StakingService,
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
}
