import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-staking-lp-page',
  templateUrl: './staking-lp-page.component.html',
  styleUrls: ['./staking-lp-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakingLpPageComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    return undefined;
  }
}
