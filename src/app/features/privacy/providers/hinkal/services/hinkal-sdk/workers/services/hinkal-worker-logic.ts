import { Hinkal } from '@hinkal/common';
import { HinkalWorkerSnapshotService } from './hinkal-snapshot.service';
import { HinkalWorkerSwapService } from './hinkal-swap.sevice';
import { HinkalWorkerBalanceService } from './hinkal-balance.service';
import { HinkalWorkerQuoteService } from './hinkal-quote.service';

export class HinkalWorkerLogic {
  private readonly hinkal: Hinkal<unknown>;

  public readonly snapshotService: HinkalWorkerSnapshotService;

  public readonly swapService: HinkalWorkerSwapService;

  public readonly balanceService: HinkalWorkerBalanceService;

  public readonly quoteService: HinkalWorkerQuoteService;

  constructor() {
    this.hinkal = new Hinkal({
      generateProofRemotely: true
    });

    this.snapshotService = new HinkalWorkerSnapshotService(this.hinkal);
    this.balanceService = new HinkalWorkerBalanceService(this.hinkal);
    this.quoteService = new HinkalWorkerQuoteService();
    this.swapService = new HinkalWorkerSwapService(this.hinkal, this.quoteService);
  }
}
