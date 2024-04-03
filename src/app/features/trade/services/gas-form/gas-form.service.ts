import { Injectable } from '@angular/core';
import { SwapsStateService } from '../swaps-state/swaps-state.service';
import { filter, map } from 'rxjs';

@Injectable()
export class GasFormService {
  public readonly bestTrade$ = this.swapsStateService.tradesStore$.pipe(
    map(trades => trades.filter(t => t.trade && !t.error)),
    map(trades => trades?.[0]),
    filter(Boolean)
  );

  constructor(private readonly swapsStateService: SwapsStateService) {}
}
