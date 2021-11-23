import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

type HttpRequestType = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface EndpointData {
  route: string;
  methods: Set<HttpRequestType>;
}

/**
 * Intercepts add transaction requests targeted to 'rubic.exchange'.
 */
@Injectable()
export class WalletsInfoInterceptor implements HttpInterceptor {
  private readonly DOMAIN_SUBSTRING = 'rubic.exchange';

  private readonly endpoints: EndpointData[];

  constructor() {
    this.endpoints = [
      {
        route: '/api/bridges/transactions',
        methods: new Set(['POST', 'PUT', 'PATCH'])
      },
      {
        route: '/api/instant_trades/',
        methods: new Set(['POST', 'PATCH'])
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
      return next.handle(WalletsInfoInterceptor.addWalletInfoToRequest(httpRequest));
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

  private static addWalletInfoToRequest(request: HttpRequest<unknown>): HttpRequest<unknown> {
    return request.clone({
      body: { ...(request.body as object), hello: 'world' }
    });
  }
}
