import { Injectable } from '@angular/core';
import {
  EvmBlockchainName,
  QuoteAllInterface,
  QuoteRequestInterface,
  SwapRequestInterface,
  WsQuoteRequestInterface,
  WsQuoteResponseInterface
} from '@cryptorubic/core';
import {
  EvmTransactionConfig,
  InsufficientFundsError,
  InsufficientFundsGasPriceValueError,
  rubicApiLinkMapping,
  RubicSdkError,
  SimulationFailedError,
  TradeExpiredError,
  UnapprovedContractError,
  UnapprovedMethodError,
  UnlistedError,
  UnsupportedReceiverAddressError,
  waitFor
} from '@cryptorubic/web3';
import {
  BehaviorSubject,
  catchError,
  concatMap,
  firstValueFrom,
  from,
  fromEvent,
  map,
  Observable,
  of,
  throwError
} from 'rxjs';
import { ENVIRONMENT } from 'src/environments/environment';
import { SwapResponseInterface } from '../features/ws-api/models/swap-response-interface';
import { TransferSwapRequestInterface } from '../features/ws-api/chains/transfer-trade/models/transfer-swap-request-interface';
import { SwapErrorResponseInterface } from '../features/ws-api/models/swap-error-response-interface';
import { WrappedAsyncTradeOrNull } from '../features/ws-api/models/wrapped-async-trade-or-null';
import { RubicApiErrorDto } from '../features/ws-api/models/rubic-api-error';
import { WrappedCrossChainTradeOrNull } from '../features/cross-chain/calculation-manager/models/wrapped-cross-chain-trade-or-null';
import { WrappedOnChainTradeOrNull } from '../features/on-chain/calculation-manager/models/wrapped-on-chain-trade-or-null';
import { TransformUtils } from '../features/ws-api/transform-utils';
import { CrossChainTxStatusConfig } from '../features/ws-api/models/cross-chain-tx-status-config';
import { io, Socket } from 'socket.io-client';
import { SdkLegacyService } from '../sdk-legacy.service';
import { DeflationTokenLowSlippageError } from '@app/core/errors/models/common/deflation-token-low-slippage.error';
import { RubicAny } from '@app/shared/models/utility-types/rubic-any';
import { TurnstileService } from '@core/services/turnstile/turnstile.service';
import { exhaustMap, filter, first, retry, switchMap, throttleTime } from 'rxjs/operators';
import { WsErrorResponseInterface } from '../features/ws-api/models/ws-error-response-interface';

@Injectable({
  providedIn: 'root'
})
export class RubicApiService {
  private get apiUrl(): string {
    const rubicApiLink = rubicApiLinkMapping[ENVIRONMENT.environmentName];

    return rubicApiLink ? rubicApiLink : 'https://dev1-api-v2.rubic.exchange';
  }

  private readonly _socket$ = new BehaviorSubject<Socket | null>(null);

  public readonly socket$ = this._socket$.asObservable();

  private get client(): Socket | null {
    return this._socket$.value;
  }

  private setClient(socket: Socket): void {
    this._socket$.next(socket);
  }

  private latestQuoteParams: QuoteRequestInterface | null = null;

  constructor(
    private readonly sdkLegacyService: SdkLegacyService,
    private readonly turnstileService: TurnstileService
  ) {}

  public initSocket(): void {
    const ioClient = io(this.apiUrl, {
      reconnectionDelayMax: 10000,
      path: `/api/routes/ws/`,
      transports: ['websocket'],
      reconnection: false
    });

    this.setClient(ioClient);
  }

  public async tryConnectSocket(): Promise<boolean> {
    /**
     * @TODO FEATURE AFTER Python API updates:
     * Add optional cloudflare token requirement
     * only when in admin's dashboard checklLoudflare is set to true
     */
    const sucess = await this.turnstileService.askForCloudflareToken().catch(() => false);
    if (!sucess) {
      await waitFor(5_000);
      return this.tryConnectSocket();
    }

    const cloudflareToken = await firstValueFrom(
      this.turnstileService.token$.pipe(first(el => el !== null))
    );

    const ioClient = io(this.apiUrl, {
      path: `/api/routes/ws/`,
      transports: ['websocket'],
      reconnection: false,
      autoConnect: true,
      auth: { cloudflareToken }
    });
    this.setClient(ioClient);

    return true;
  }

  public calculateAsync(params: WsQuoteRequestInterface, attempt = 0): void {
    this.latestQuoteParams = params;
    if (attempt > 2) return;
    if (this.client?.connected) {
      this.client.emit('calculate', params);
    } else {
      const repeatInterval = 3_000;
      setTimeout(() => {
        this.calculateAsync(params, attempt + 1);
      }, repeatInterval);
    }
  }

  public stopCalculation(): void {
    if (this.latestQuoteParams) {
      this.client?.emit('stopCalculation');
      this.latestQuoteParams = null;
    }
  }

  public async fetchSwapData<T>(
    body: SwapRequestInterface | TransferSwapRequestInterface
  ): Promise<SwapResponseInterface<T>> {
    try {
      const result = await firstValueFrom(
        this.sdkLegacyService.httpClient.post<
          SwapResponseInterface<T> | SwapErrorResponseInterface
        >(`${this.apiUrl}/api/routes/swap`, body)
      );
      if ('error' in result) {
        throw this.getApiError(result);
      }
      return result;
    } catch (err: RubicAny) {
      if (err instanceof RubicSdkError) {
        throw err;
      }
      if ('error' in err) {
        throw this.getApiError((err as { error: SwapErrorResponseInterface }).error);
      }
      throw this.getApiError(err);
    }
  }

  public fetchRoutes(body: QuoteRequestInterface): Promise<QuoteAllInterface> {
    return firstValueFrom(
      this.sdkLegacyService.httpClient.post<QuoteAllInterface>(
        `${this.apiUrl}/api/routes/quoteAll`,
        body
      )
    );
  }

  public async fetchBestSwapData<T>(
    body: SwapRequestInterface | TransferSwapRequestInterface
  ): Promise<SwapResponseInterface<T>> {
    try {
      const result = await firstValueFrom(
        this.sdkLegacyService.httpClient.post<
          SwapResponseInterface<T> | SwapErrorResponseInterface
        >(`${this.apiUrl}/api/routes/swapBest`, body)
      );
      if ('error' in result) {
        throw this.getApiError(result);
      }
      return result;
    } catch (err: RubicAny) {
      if (err instanceof RubicSdkError) {
        throw err;
      }
      if ('error' in err) {
        throw this.getApiError((err as { error: SwapErrorResponseInterface }).error);
      }
      throw this.getApiError(err);
    }
  }

  public handleSocketConnectionError(): Observable<boolean> {
    return this.socket$.pipe(
      filter(socket => !!socket),
      switchMap(socket =>
        fromEvent(socket, 'connect_error').pipe(
          throttleTime(3_000),
          exhaustMap(err => {
            console.debug('[RubicApiService_handleSocketConnectionError] connect_error:', err);
            return this.tryConnectSocket();
          })
        )
      )
    );
  }

  public handleSocketConnected(): Observable<void> {
    return this.socket$.pipe(
      filter(socket => !!socket),
      switchMap(socket => fromEvent(socket, 'connect'))
    );
  }

  public handleSocketDisconnected(): Observable<boolean> {
    return this.socket$.pipe(
      filter(socket => !!socket),
      switchMap(socket =>
        fromEvent<string[]>(socket, 'disconnect').pipe(
          switchMap(reason => {
            if (reason[0] !== 'io client disconnect') {
              console.debug('[RubicApiService_handleSocketConnectionError] disconnect:', reason);
              return this.tryConnectSocket();
            }
          })
        )
      )
    );
  }

  public handleQuotesAsync(): Observable<WrappedAsyncTradeOrNull> {
    return this.turnstileService.token$.pipe(
      first(el => el !== null),
      switchMap(token => {
        if (!token) return throwError(() => 'cloudflare token is undefined');

        return fromEvent<
          WsQuoteResponseInterface & {
            data: RubicApiErrorDto;
            type: string;
          }
        >(this.client, 'events').pipe(
          concatMap(wsResponse => {
            const { trade, total, calculated, data } = wsResponse;
            let promise: Promise<null | WrappedCrossChainTradeOrNull | WrappedOnChainTradeOrNull> =
              Promise.resolve(null);

            const rubicApiError = data
              ? {
                  ...data,
                  type: wsResponse.type
                }
              : data;

            promise =
              this.latestQuoteParams?.srcTokenBlockchain !==
              this.latestQuoteParams?.dstTokenBlockchain
                ? TransformUtils.transformCrossChain(
                    trade!,
                    this.latestQuoteParams!,
                    this.latestQuoteParams!.integratorAddress!,
                    this.sdkLegacyService,
                    this,
                    rubicApiError as RubicAny
                  )
                : TransformUtils.transformOnChain(
                    trade!,
                    this.latestQuoteParams!,
                    this.latestQuoteParams!.integratorAddress!,
                    this.sdkLegacyService,
                    this,
                    rubicApiError as RubicAny
                  );
            return from(promise).pipe(
              catchError(err => {
                console.dir('[RubicApiService_handleQuotesAsync] socket error:', err);
                return of(null);
              }),
              map(wrappedTrade => ({
                total,
                calculated,
                wrappedTrade,
                ...(data && { tradeType: wsResponse.type })
              }))
            );
          })
        );
      }),
      retry({ delay: 1_000 })
    );
  }

  public handleWsExceptions(): Observable<boolean> {
    return fromEvent<WsErrorResponseInterface>(this.client, 'exception').pipe(
      exhaustMap(wsError => {
        console.debug('[RubicApiService_handleWsExceptions] err:', wsError);
        return this.handleWsApiError(wsError);
      })
    );
  }

  public fetchCrossChainTxStatus(srcTxHash: string): Promise<CrossChainTxStatusConfig> {
    return firstValueFrom(
      this.sdkLegacyService.httpClient.get<CrossChainTxStatusConfig>(
        `${this.apiUrl}/api/info/status?srcTxHash=${srcTxHash}`
      )
    );
  }

  /**
   * @param rubicId Id of rubic-api trade
   * @param {optional} srcTxHash  Hash of source transaction to use old search endpoint via hash on python api. Not needed for deposit providers.
   * @returns
   */
  public fetchCrossChainTxStatusExtended(
    rubicId: string,
    srcTxHash?: string
  ): Promise<CrossChainTxStatusConfig> {
    const params = new URLSearchParams({
      rubicId,
      ...(srcTxHash && { srcTxHash })
    }).toString();

    return firstValueFrom(
      this.sdkLegacyService.httpClient.get<CrossChainTxStatusConfig>(
        `${this.apiUrl}/api/info/statusExtended?${params}`
      )
    );
  }

  public getMessageToAuthWallet(walletAddress: string): Promise<{ messageToAuth: string }> {
    return firstValueFrom(
      this.sdkLegacyService.httpClient.get<{ messageToAuth: string }>(
        `${this.apiUrl}/api/utility/authWalletMessage?walletAddress=${walletAddress}`
      )
    );
  }

  public sendToRelay(id: string, data: string): Promise<{ signature: string }> {
    return firstValueFrom(
      this.sdkLegacyService.httpClient.post<{ signature: string }>(
        `${this.apiUrl}/api/utility/solana/relay`,
        {
          data,
          id
        }
      )
    );
  }

  public claimOrRedeemCoins(
    srcTxHash: string,
    srcBlockchain: EvmBlockchainName
  ): Promise<SwapResponseInterface<EvmTransactionConfig>> {
    return firstValueFrom(
      this.sdkLegacyService.httpClient.get<SwapResponseInterface<EvmTransactionConfig>>(
        `${this.apiUrl}/api/utility/claim`,
        {
          params: { sourceTransactionHash: srcTxHash, fromBlockchain: srcBlockchain }
        }
      )
    );
  }

  /**
   * @returns whether should recalculate quote after handling
   */
  private async handleWsApiError(err: WsErrorResponseInterface): Promise<boolean> {
    const result = err.error;
    switch (result.code) {
      case 6001:
      case 6002: {
        return this.tryConnectSocket();
      }
      default:
        return false;
    }
  }

  private getApiError(err: SwapErrorResponseInterface): RubicSdkError {
    const result = err.error;
    switch (result.code) {
      case 3003: {
        return new InsufficientFundsError((result.data as { tokenSymbol: string }).tokenSymbol);
      }
      case 3004: {
        return new InsufficientFundsGasPriceValueError();
      }
      case 3005: {
        return new SimulationFailedError(err);
      }
      case 3006: {
        return new UnsupportedReceiverAddressError();
      }
      case 3007: {
        return new SimulationFailedError(err);
      }
      case 3008: {
        // RubicError
        return new DeflationTokenLowSlippageError(
          (result.data as { tokenAddress: string }).tokenAddress
        );
      }
      case 4001: {
        return new RubicSdkError('Meson only supports proxy swaps!');
      }
      case 4002: {
        const method = result.reason.split('Selector - ')?.[1]?.slice(0, -1);
        return new UnapprovedMethodError(method || 'Unknown');
      }
      case 4003: {
        const contract = result.reason.split('Contract - ')[1]?.slice(0, -1);
        return new UnapprovedContractError(contract || 'Unknown');
      }
      case 4004: {
        const contractAndSelector = result.reason.split('Selector - ')?.[1]?.slice(0, -1);
        const [method, contract] = contractAndSelector?.split('. Contract - ') || [
          'Unknown',
          'Unknown'
        ];
        return new UnlistedError(contract || 'Unknown', method || 'Unknown');
      }
      case 1004: {
        return new TradeExpiredError();
      }
    }
    return new RubicSdkError(JSON.stringify(err));
  }
}
