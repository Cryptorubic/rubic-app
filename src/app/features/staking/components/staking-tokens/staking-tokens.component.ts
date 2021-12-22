import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { startWith, takeUntil } from 'rxjs/operators';

import { STAKING_TOKENS } from '../../constants/STAKING_TOKENS';
import { StakingService } from '../../services/staking.service';
import { TokensService } from '@core/services/tokens/tokens.service';

@Component({
  selector: 'app-staking-tokens',
  templateUrl: './staking-tokens.component.html',
  styleUrls: ['./staking-tokens.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakingTokensComponent {
  @Input() tokenFormControl: FormControl;

  @Input() amountFormControl: FormControl;

  public readonly availableTokens = STAKING_TOKENS;

  constructor(
    private readonly stakingService: StakingService,
    private readonly tokensService: TokensService,
    private readonly destroy$: TuiDestroyService
  ) {}

  public ngOnInit() {
    this.tokenFormControl.valueChanges
      .pipe(startWith(this.tokenFormControl.value), takeUntil(this.destroy$))
      .subscribe(token => {
        this.stakingService.setToken(token);
        this.amountFormControl.setValue('');
      });
  }
}
