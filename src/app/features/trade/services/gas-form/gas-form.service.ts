import { Injectable } from '@angular/core';
import { SwapsStateService } from '../swaps-state/swaps-state.service';
import { map } from 'rxjs';

@Injectable()
export class GasFormService {
  public readonly bestTrade$ = this.swapsStateService.tradesStore$.pipe(
    map(trades => trades.filter(t => t.trade && !t.error)),
    map(trades => trades[0])
  );

  constructor(private readonly swapsStateService: SwapsStateService) {}
}
