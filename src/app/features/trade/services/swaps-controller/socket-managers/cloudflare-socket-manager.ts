import { Subscription } from 'rxjs';
import { ApiSocketManager } from './socket-manager';
import { TurnstileService } from '@app/core/services/turnstile/turnstile.service';
import { SwapsControllerService } from '@app/features/trade/services/swaps-controller/swaps-controller.service';
import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';

export class CloudflareSocketManager extends ApiSocketManager {
  protected subs: Subscription[];

  public allowCalculation(): boolean {
    return !!this.turnstileService.token;
  }

  constructor(
    rubicApiService: RubicApiService,
    swapsControllerService: SwapsControllerService,
    private readonly turnstileService: TurnstileService
  ) {
    super(rubicApiService, swapsControllerService);
  }

  public initSubs(): void {
    const autoRefreshSub = this.rubicApiService.initCfTokenAutoRefresh();
    const connErrSub = this.rubicApiService.handleSocketConnectionError().subscribe();
    const cfTokenRespSub = this.rubicApiService.handleCloudflareTokenResponse().subscribe(res => {
      if (res.success) {
        if (res.needRecalculation) {
          this.swapsControllerService.startRecalculation(true);
        }
      } else {
        this.rubicApiService.refreshCloudflareToken(true);
      }
    });
    const connSub = this.rubicApiService.handleSocketConnected().subscribe(() => {
      this.swapsControllerService.handleWs();
      this.swapsControllerService.startRecalculation(true);
    });
    this.subs.push(autoRefreshSub, connErrSub, cfTokenRespSub, connSub);
  }
}
