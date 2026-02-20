import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';
import { SwapsControllerService } from '@app/features/trade/services/swaps-controller/swaps-controller.service';
import { Subscription } from 'rxjs';

export abstract class ApiSocketManager {
  protected subs: Subscription[] = [];

  constructor(
    protected readonly rubicApiService: RubicApiService,
    protected readonly swapsControllerService: SwapsControllerService
  ) {}

  public abstract allowCalculation(): boolean;

  public abstract initSubs(): void;

  public removeSubs(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}
