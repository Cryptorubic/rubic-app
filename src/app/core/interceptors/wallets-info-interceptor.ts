import { Inject, Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProviderConnectorService } from '@core/services/blockchain/providers/provider-connector-service/provider-connector.service';
import { TUI_IS_MOBILE } from '@taiga-ui/cdk';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface EndpointData {
  route: string;
  methods: Set<HttpMethod>;
}

interface WalletInfo {
  walletName: string;
  deviceType: 'mobile' | 'desktop';
}

/**
 * Intercepts add transaction requests targeted to '*.rubic.exchange'.
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

  intercept(httpRequest: HttpRequest<object>, next: HttpHandler): Observable<HttpEvent<object>> {
    if (
      httpRequest.url.includes(this.DOMAIN_SUBSTRING) &&
      this.isTransactionOperation(httpRequest)
    ) {
      return next.handle(this.addWalletInfoToRequest(httpRequest));
    }
    return next.handle(httpRequest);
  }

  /**
   * Checks if request is create transaction operation.
   * @param request Pending http request.
   * @return boolean Is request create transaction or not.
   */
  private isTransactionOperation(request: HttpRequest<object>): boolean {
    return this.endpoints.some(
      endpoint =>
        request.url.includes(endpoint.route) && endpoint.methods.has(request.method as HttpMethod)
    );
  }

  /**
   * Adds wallet info to create transaction request body.
   * @param request Pending request.
   * @return HttpRequest<unknown> New request with appended body params.
   */
  private addWalletInfoToRequest(request: HttpRequest<object>): HttpRequest<object> {
    const walletsInfo: WalletInfo = {
      walletName: this.providerConnectorService.provider.detailedWalletName,
      deviceType: this.isMobile ? 'mobile' : 'desktop'
    };
    return request.clone({
      body: { ...request.body, ...walletsInfo }
    });
  }
}
