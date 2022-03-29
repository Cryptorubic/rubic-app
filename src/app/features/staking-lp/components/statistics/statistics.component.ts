import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatisticsComponent implements OnInit {
  chips = [
    {
      value: '1',
      label: 'first'
    },
    { value: '2', label: 'second' }
  ];

  constructor() {}

  ngOnInit(): void {
    return undefined;
  }

  s(value: string): void {
    console.log(value);
  }

  refreshStatistics(): void {}
}
