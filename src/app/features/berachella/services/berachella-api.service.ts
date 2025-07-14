import { Inject, Injectable } from '@angular/core';
import { HttpService } from '@core/services/http/http.service';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  ApiDiscordSignatureRequest,
  ApiDiscordSignatureResponse,
  ApiMessageRequest,
  ApiMessageResponse,
  ApiTicketsStats,
  ApiUserTickets,
  ApiVerifySignatureRequest,
  ApiVerifySignatureResponse
} from '@features/berachella/interfaces/berachella-api-models';

@Injectable()
export class BerachellaApiService {
  private readonly defaultRetryOptions = {
    timeoutMs: 5_000,
    retry: 1,
    external: true
  };

  private readonly v2ApiBaseUrl = 'v2/promo_campaigns/berachella';

  private readonly v3ApiBaseUrl = 'v3/discord_users';

  constructor(
    private readonly httpService: HttpService,
    @Inject(WINDOW) private window: RubicWindow
  ) {}

  public fetchUserTickets(address: string): Observable<ApiUserTickets | null> {
    return this.httpService
      .get<ApiUserTickets>(
        `${this.v2ApiBaseUrl}/user_tickets?address=${address}`,
        {},
        '',
        this.defaultRetryOptions
      )
      .pipe(catchError(() => of(null)));
  }

  public fetchStats(): Observable<ApiTicketsStats | null> {
    return this.httpService
      .get<ApiUserTickets>(`${this.v2ApiBaseUrl}/tickets_stats`, {}, '', this.defaultRetryOptions)
      .pipe(catchError(() => of(null)));
  }

  public fetchMessage(info: ApiMessageRequest): Observable<ApiMessageResponse | null> {
    return this.httpService
      .post<ApiMessageResponse>(
        `${this.v2ApiBaseUrl}/generate_message`,
        info,
        '',
        this.defaultRetryOptions
      )
      .pipe(catchError(() => of(null)));
  }

  public verifySignature(data: ApiVerifySignatureRequest): Observable<ApiVerifySignatureResponse> {
    return this.httpService
      .post<ApiVerifySignatureResponse>(
        `${this.v2ApiBaseUrl}/verify_signature`,
        data,
        '',
        this.defaultRetryOptions
      )
      .pipe(catchError(() => of(null)));
  }

  public sendDiscordInfo(
    data: ApiDiscordSignatureRequest
  ): Observable<ApiDiscordSignatureResponse> {
    return this.httpService
      .post<ApiDiscordSignatureResponse>(
        `${this.v3ApiBaseUrl}/add_discord_user`,
        data,
        '',
        this.defaultRetryOptions
      )
      .pipe(catchError(() => of(null)));
  }

  public checkDiscordConnection(wallet: string): Observable<boolean> {
    return this.httpService
      .get<{ discordIsConnected: boolean }>(
        `${this.v3ApiBaseUrl}/check_discord_user/${wallet}`,
        {},
        '',
        this.defaultRetryOptions
      )
      .pipe(map(res => res?.discordIsConnected));
  }
}
