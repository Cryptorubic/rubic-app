import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import networks from '@app/shared/constants/blockchain/networks';
import { RecentTrade } from '@app/shared/models/my-trades/recent-trades.interface';
import { RecentTradesService } from '@app/shared/services/recent-trades.service';
import { asyncMap } from '@app/shared/utils/utils';
import { BehaviorSubject, map } from 'rxjs';

@Component({
  selector: 'app-recent-crosschain-tx',
  templateUrl: './recent-crosschain-tx.component.html',
  styleUrls: ['./recent-crosschain-tx.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecentCrosschainTxComponent implements OnInit {
  private readonly _loading$ = new BehaviorSubject<boolean>(false);

  public readonly loading$ = this._loading$.asObservable();

  public readonly recentTrades$ = this.recentTradesService.recentTrades$.pipe(
    map(trades => asyncMap(trades, this.parseRecentTrade))
  );

  constructor(private readonly recentTradesService: RecentTradesService) {}

  ngOnInit(): void {
    return undefined;
  }

  private async parseRecentTrade(tx: RecentTrade): Promise<unknown> {
    const { fromBlockchain, toBlockchain, toToken, fromToken } = tx;
    return {
      fromBlockchain: networks.find(network => network.name === fromBlockchain),
      toBlockchain: networks.find(network => network.name === toBlockchain),
      fromToken,
      toToken
    };
  }
}
