import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';
import { ApiSocketManager } from './socket-manager';
import { SwapsControllerService } from '@app/features/trade/services/swaps-controller/swaps-controller.service';

export class DefaultSocketManager extends ApiSocketManager {
  public allowCalculation(): boolean {
    return true;
  }

  constructor(rubicApiService: RubicApiService, swapsControllerService: SwapsControllerService) {
    super(rubicApiService, swapsControllerService);
  }

  public initSubs(): void {
    const connSub = this.rubicApiService.handleSocketConnected().subscribe(() => {
      this.swapsControllerService.handleWs();
      this.swapsControllerService.startRecalculation(true);
    });
    this.subs.push(connSub);
  }
}
