import { Inject, Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProviderConnectorService } from '@core/services/blockchain/providers/provider-connector-service/provider-connector.service';
import { TUI_IS_MOBILE } from '@taiga-ui/cdk';

type HttpRequestType = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface EndpointData {
  route: string;
  methods: Set<HttpRequestType>;
}

interface WalletInfo {
  walletName: string;
  deviceType: 'mobile' | 'desktop';
}

/**
 * Intercepts add transaction requests targeted to 'rubic.exchange'.
 */
@Injectable()
export class WalletsInfoInterceptor implements HttpInterceptor {
  private readonly DOMAIN_SUBSTRING = 'rubic.exchange';

  private readonly endpoints: EndpointData[];

  constructor(
    @Inject(TUI_IS_MOBILE) private readonly isMobile: boolean,
    private readonly providerConnectorService: ProviderConnectorService
  ) {
    this.endpoints = [
      {
        route: '/api/bridges/transactions',
        methods: new Set(['POST'])
      },
      {
        route: '/api/instant_trades/',
        methods: new Set(['POST'])
      },
      {
        route: '/api/trades/',
        methods: new Set(['PATCH'])
      }
    ];
  }

  intercept(httpRequest: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!httpRequest.url.includes(this.DOMAIN_SUBSTRING)) {
      return next.handle(httpRequest);
    }

    if (this.isTransactionOperation(httpRequest)) {
      return next.handle(this.addWalletInfoToRequest(httpRequest));
    }

    return next.handle(httpRequest);
  }

  private isTransactionOperation(request: HttpRequest<unknown>): boolean {
    return this.endpoints.some(
      endpoint =>
        request.url.includes(endpoint.route) &&
        endpoint.methods.has(request.method as HttpRequestType)
    );
  }

  private addWalletInfoToRequest(request: HttpRequest<unknown>): HttpRequest<unknown> {
    const walletsInfo: WalletInfo = {
      walletName: this.providerConnectorService.provider.detailedWalletName,
      deviceType: this.isMobile ? 'mobile' : 'desktop'
    };
    return request.clone({
      body: { ...(request.body as object), ...walletsInfo }
    });
  }
}
