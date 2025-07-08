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

  constructor(
    private readonly httpService: HttpService,
    @Inject(WINDOW) private window: RubicWindow
  ) {}

  public fetchUserTickets(address: string): Observable<ApiUserTickets | null> {
    return this.httpService
      .get<ApiUserTickets>(`user_tickets?address=${address}`, {}, '', this.defaultRetryOptions)
      .pipe(catchError(() => of(null)));
  }

  public fetchStats(): Observable<ApiTicketsStats | null> {
    return this.httpService
      .get<ApiUserTickets>(`tickets_stats`, {}, '', this.defaultRetryOptions)
      .pipe(catchError(() => of(null)));
  }

  public fetchMessage(info: ApiMessageRequest): Observable<ApiMessageResponse | null> {
    return this.httpService
      .post<ApiMessageResponse>(`generate_message`, info, '', this.defaultRetryOptions)
      .pipe(catchError(() => of(null)));
  }

  public verifySignature(data: ApiVerifySignatureRequest): Observable<ApiVerifySignatureResponse> {
    return this.httpService
      .post<ApiVerifySignatureResponse>(`verify_signature`, data, '', this.defaultRetryOptions)
      .pipe(catchError(() => of(null)));
  }

  public sendDiscordInfo(
    data: ApiDiscordSignatureRequest
  ): Observable<ApiDiscordSignatureResponse> {
    return this.httpService
      .post<ApiDiscordSignatureResponse>(
        'v3/discord_users/add_discord_user',
        data,
        '',
        this.defaultRetryOptions
      )
      .pipe(catchError(() => of(null)));
  }

  public checkDiscordConnection(wallet: string): Observable<boolean> {
    return this.httpService
      .get<{ discordIsConnected: boolean }>(
        `v3/discord_users/check_discord_user/${wallet}`,
        {},
        '',
        this.defaultRetryOptions
      )
      .pipe(map(res => res?.discordIsConnected));
  }
}
