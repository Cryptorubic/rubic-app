import { inject, Injectable } from '@angular/core';
import { PrivacyAuthService } from '@app/features/privacy/services/privacy-auth.service';
import { HttpService } from '@core/services/http/http.service';
import {
  PrivateAction,
  PrivateProvider
} from '@features/privacy/services/models/private-statistics-types';

@Injectable()
export class PrivateStatisticsService {
  private readonly httpService = inject(HttpService);

  private readonly privacyAuthService = inject(PrivacyAuthService);

  public saveAction(
    action: PrivateAction,
    provider: PrivateProvider,
    userAddress: string,
    tokenAddress: string,
    tokenAmountWei: string,
    network: string,
    successfulSteps: string[] = [],
    failedSteps: string[] = []
  ): void {
    this.httpService
      .post('v3/tmp/private_actions/save_action', {
        action,
        provider,
        network,
        userAddress,
        tokenAddress,
        tokenAmountWei,
        successfulSteps,
        failedSteps,
        refCode: this.privacyAuthService.refCode
      })
      .subscribe();
  }
}
