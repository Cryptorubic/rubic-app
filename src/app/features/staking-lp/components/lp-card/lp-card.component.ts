import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-lp-card',
  templateUrl: './lp-card.component.html',
  styleUrls: ['./lp-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LpCardComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    return undefined;
  }
}
