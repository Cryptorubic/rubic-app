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
  UnsupportedReceiverAddressError
} from '@cryptorubic/web3';
import { catchError, concatMap, firstValueFrom, from, fromEvent, map, Observable, of } from 'rxjs';
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

@Injectable({
  providedIn: 'root'
})
export class RubicApiService {
  constructor(private readonly sdkLegacyService: SdkLegacyService) {}

  private get apiUrl(): string {
    const rubicApiLink = rubicApiLinkMapping[ENVIRONMENT.environmentName];

    return rubicApiLink ? rubicApiLink : 'https://dev1-api-v2.rubic.exchange';
  }

  private readonly client = this.getSocket();

  private latestQuoteParams: QuoteRequestInterface | null = null;

  private getSocket(): Socket {
    const ioClient = io(this.apiUrl, {
      reconnectionDelayMax: 10000,
      path: '/api/routes/ws/',
      transports: ['websocket']
    });
    return ioClient;
  }

  public calculateAsync(params: WsQuoteRequestInterface, attempt = 0): void {
    this.latestQuoteParams = params;
    if (attempt > 2) {
      return;
    }
    if (this.client.connected) {
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
      this.client.emit('stopCalculation');
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

  public fetchCelerRefundData(): void {
    // return Injector.httpClient.post<TransactionInterface>(
    //     `${this.apiUrl}/api/routes/swap`,
    //     body
    // );
  }

  public disconnectSocket(): void {
    this.client.disconnect();
  }

  public closetSocket(): void {
    this.client.close();
  }

  public handleQuotesAsync(): Observable<WrappedAsyncTradeOrNull> {
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
          this.latestQuoteParams?.srcTokenBlockchain !== this.latestQuoteParams?.dstTokenBlockchain
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
            console.log(err);
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
  }

  public fetchCrossChainTxStatus(srcTxHash: string): Promise<CrossChainTxStatusConfig> {
    return firstValueFrom(
      this.sdkLegacyService.httpClient.get<CrossChainTxStatusConfig>(
        `${this.apiUrl}/api/info/status?srcTxHash=${srcTxHash}`
      )
    );
  }

  public fetchCrossChainTxStatusExtended(
    srcTxHash: string,
    rubicId: string
  ): Promise<CrossChainTxStatusConfig> {
    return firstValueFrom(
      this.sdkLegacyService.httpClient.get<CrossChainTxStatusConfig>(
        `${this.apiUrl}/api/info/statusExtended?srcTxHash=${srcTxHash}&rubicId=${rubicId}`
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
