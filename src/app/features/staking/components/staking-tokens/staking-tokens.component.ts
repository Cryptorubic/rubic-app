import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-staking-tokens',
  templateUrl: './staking-tokens.component.html',
  styleUrls: ['./staking-tokens.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakingTokensComponent {
  public stakingTokens = [
    {
      symbol: 'RBC',
      name: 'Rubic',
      img: 'assets/images/icons/staking/rbc-eth.svg',
      address: '0x000'
    },
    {
      symbol: 'BRBC',
      name: 'Rubic',
      img: 'assets/images/icons/staking/brbc-bsc.svg',
      address: '0x111'
    },
    {
      symbol: 'RBC',
      name: 'Rubic (PoS)',
      img: 'assets/images/icons/staking/rbc-pos.svg',
      address: '0x222'
    }
  ];

  public selectedToken = new FormControl(this.stakingTokens[0]);

  constructor() {}
}
