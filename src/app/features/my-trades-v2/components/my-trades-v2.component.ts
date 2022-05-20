import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MyTradesV2Service } from '../services/my-trades-v2.service';

@Component({
  selector: 'app-my-trades-v2',
  templateUrl: './my-trades-v2.component.html',
  styleUrls: ['./my-trades-v2.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyTradesV2Component implements OnInit {
  constructor(private readonly myTradesV2Service: MyTradesV2Service) {}

  ngOnInit(): void {
    return undefined;
  }
}
