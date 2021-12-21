import { ChangeDetectionStrategy, Component, Self } from '@angular/core';
import { FormControl } from '@ngneat/reactive-forms';
import { StakingService } from '@features/staking/services/staking.service';
import { map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { WalletsModalService } from '@core/wallets/services/wallets-modal.service';
import BigNumber from 'bignumber.js';
import { ProviderConnectorService } from '@core/services/blockchain/providers/provider-connector-service/provider-connector.service';
import { combineLatest } from 'rxjs';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Component({
  selector: 'app-withdraw',
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class WithdrawComponent {
  public readonly DEFAULT_DECIMALS = 18;

  public readonly amount = new FormControl<string>('');

  public readonly needLogin$ = this.stakingService.needLogin$;

  public readonly needChangeNetwork$ = combineLatest([
    this.stakingService.selectedToken$,
    this.providerConnectorService.networkChange$.pipe(
      startWith(this.providerConnectorService.network)
    )
  ]).pipe(
    map(([selectedToken, network]) => {
      return selectedToken.blockchain !== network.name;
    }),
    tap(needChangeNetwork => console.log('need change network', needChangeNetwork)),
    takeUntil(this.destroy$)
  );

  public readonly stakingTokenBalance$ = this.stakingService.stakingTokenBalance$;

  public readonly canReceive$ = this.amount.valueChanges.pipe(
    startWith(this.amount.value),
    map(value => (value ? new BigNumber(value.split(',').join('')) : new BigNumber(0))),
    switchMap(amount => this.stakingService.calculateLeaveReward(amount)),
    takeUntil(this.destroy$)
  );

  constructor(
    private readonly stakingService: StakingService,
    private readonly walletsModalService: WalletsModalService,
    private readonly providerConnectorService: ProviderConnectorService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit() {
    this.needChangeNetwork$.subscribe();
  }

  public withdraw(): void {
    this.stakingService.leaveStake(new BigNumber(this.amount.value)).subscribe(console.log);
  }

  public login(): void {
    this.walletsModalService.open().subscribe();
  }

  public async changeNetwork(): Promise<void> {
    try {
      await this.providerConnectorService.switchChain(this.stakingService.selectedToken.blockchain);
    } finally {
      console.log('switched');
    }
  }
}
