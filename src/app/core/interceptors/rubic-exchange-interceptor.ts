import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpXsrfTokenExtractor
} from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Intercepts requests targeted to '*.rubic.exchange' domains.
 */
@Injectable()
export class RubicExchangeInterceptor implements HttpInterceptor {
  private readonly DOMAIN_SUBSTRING = 'rubic.exchange';

  constructor(private readonly tokenExtractor: HttpXsrfTokenExtractor) {}

  intercept(httpRequest: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!httpRequest.url.includes(this.DOMAIN_SUBSTRING)) {
      return next.handle(httpRequest);
    }

    let newRequest = this.setDefaultParams(httpRequest);
    newRequest = this.addTokenHeader(newRequest);
    return next.handle(newRequest);
  }

  private setDefaultParams<T>(httpRequest: HttpRequest<T>): HttpRequest<T> {
    if (
      httpRequest.url.includes('/api/routes/swap') ||
      httpRequest.url.includes('/api/info/status') ||
      httpRequest.url.includes('api/utility/authWalletMessage')
    ) {
      return httpRequest.clone({
        headers: httpRequest.headers
          .append(
            'Cache-Control',
            'max-age=0, no-store, no-cache, must-revalidate, post-check=0, pre-check=0'
          )
          .append('Pragma', 'no-cache')
          .append('Expires', '0'),
        withCredentials: false
      });
    }
    return httpRequest.clone({
      headers: httpRequest.headers
        .append(
          'Cache-Control',
          'max-age=0, no-store, no-cache, must-revalidate, post-check=0, pre-check=0'
        )
        .append('Pragma', 'no-cache')
        .append('Expires', '0'),
      withCredentials: true
    });
  }

  private addTokenHeader<T>(httpRequest: HttpRequest<T>): HttpRequest<T> {
    const token = this.tokenExtractor.getToken();
    const tokenHeaderName = 'X-CSRFToken';
    if (token !== null && !httpRequest.headers.has(tokenHeaderName)) {
      return httpRequest.clone({
        headers: httpRequest.headers.set(tokenHeaderName, token)
      });
    }
    return httpRequest;
  }
}
