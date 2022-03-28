import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-staking-card',
  templateUrl: './staking-card.component.html',
  styleUrls: ['./staking-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakingCardComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    return undefined;
  }
}
