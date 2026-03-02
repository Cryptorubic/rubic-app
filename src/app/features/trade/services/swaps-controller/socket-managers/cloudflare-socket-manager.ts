import { Subscription, switchMap } from 'rxjs';
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
    const onlineSub = this.rubicApiService
      .handleOnlineChange()
      .pipe(switchMap(() => this.rubicApiService.refreshCloudflareToken(true)))
      .subscribe();
    const disconnSub = this.rubicApiService
      .handleSocketDisconnect()
      .pipe(switchMap(() => this.rubicApiService.refreshCloudflareToken(true)))
      .subscribe();
    const connErrSub = this.rubicApiService
      .handleSocketConnectError()
      .pipe(switchMap(() => this.rubicApiService.refreshCloudflareToken(true)))
      .subscribe();
    const autoRefreshSub = this.rubicApiService.initCfTokenAutoRefresh().subscribe();
    const cfTokenRespSub = this.rubicApiService.handleCloudflareTokenResponse().subscribe(res => {
      if (res.success) {
        console.debug('[CloudflareSocketManager_initSubs] CF_SUCCESS', {
          sessionID: this.turnstileService.sessionID
        });
        if (res.needRecalculation) {
          this.swapsControllerService.startRecalculation(true);
        }
      } else {
        console.debug('[CloudflareSocketManager_initSubs] CF_ERROR', {
          sessionID: this.turnstileService.sessionID
        });
        this.rubicApiService.refreshCloudflareToken(true);
      }
    });
    const connSub = this.rubicApiService
      .handleSocketConnected()
      .pipe(switchMap(() => this.rubicApiService.refreshCloudflareToken(true)))
      .subscribe(() => {
        this.swapsControllerService.handleWs();
      });
    this.subs.push(onlineSub, disconnSub, autoRefreshSub, connErrSub, cfTokenRespSub, connSub);
  }
}
