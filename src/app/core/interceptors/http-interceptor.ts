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
export class HTTPInterceptor implements HttpInterceptor {
  constructor(private readonly tokenExtractor: HttpXsrfTokenExtractor) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (req.url.includes('rubic.exchange')) {
      const token = this.tokenExtractor.getToken() as string;
      const tokenHeaderName = 'X-CSRFToken';
      if (token !== null && !req.headers.has(tokenHeaderName)) {
        return next.handle(
          req.clone({ headers: req.headers.set(tokenHeaderName, token), withCredentials: true })
        );
      }
      return next.handle(req.clone({ withCredentials: true }));
    }

    if (req.url.includes('api.coingecko.com')) {
      return next.handle(
        req.clone({
          headers: req.headers
            .set('Access-Control-Allow-Origin', '*')
            .set('Access-Control-Allow-Headers', [
              'Origin',
              'X-Requested-With',
              'Content-Type',
              'Accept'
            ])
        })
      );
    }

    return next.handle(req);
  }
}
