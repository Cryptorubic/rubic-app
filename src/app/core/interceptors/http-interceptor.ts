import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpXsrfTokenExtractor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';

@Injectable()
export class HTTPInterceptor implements HttpInterceptor {
  constructor(
    private readonly iframeService: IframeService,
    private readonly tokenExtractor: HttpXsrfTokenExtractor
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (req.url.includes('rubic.exchange')) {
      let newRequest = req.clone({
        headers: req.headers
          .append(
            'Cache-Control',
            'max-age=0, no-store, no-cache, must-revalidate, post-check=0, pre-check=0'
          )
          .append('Pragma', 'no-cache')
          .append('Expires', '0')
      });
      newRequest = this.addIframeHostDomain(newRequest);
      const token = this.tokenExtractor.getToken() as string;
      const tokenHeaderName = 'X-CSRFToken';
      if (token !== null && !newRequest.headers.has(tokenHeaderName)) {
        return next.handle(
          newRequest.clone({
            headers: newRequest.headers.set(tokenHeaderName, token),
            withCredentials: true
          })
        );
      }
      return next.handle(newRequest.clone({ withCredentials: true }));
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

  public addIframeHostDomain<T>(req: HttpRequest<T>): HttpRequest<T> {
    const domain = this.iframeService.originDomain;
    if (domain.includes('rubic.exchange')) {
      return req;
    }
    return req.clone({ params: req.params.set('domain', domain) });
  }
}
