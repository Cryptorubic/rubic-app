import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpXsrfTokenExtractor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class RubicExchangeInterceptor implements HttpInterceptor {
  constructor(private readonly tokenExtractor: HttpXsrfTokenExtractor) {}

  intercept(httpRequest: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!httpRequest.url.includes('rubic.exchange')) {
      return next.handle(httpRequest);
    }

    const newRequest = httpRequest.clone({
      headers: httpRequest.headers
        .append(
          'Cache-Control',
          'max-age=0, no-store, no-cache, must-revalidate, post-check=0, pre-check=0'
        )
        .append('Pragma', 'no-cache')
        .append('Expires', '0'),
      withCredentials: true
    });

    const token = this.tokenExtractor.getToken();
    const tokenHeaderName = 'X-CSRFToken';
    if (token !== null && !newRequest.headers.has(tokenHeaderName)) {
      return next.handle(
        newRequest.clone({
          headers: newRequest.headers.set(tokenHeaderName, token)
        })
      );
    }

    return next.handle(newRequest);
  }
}
