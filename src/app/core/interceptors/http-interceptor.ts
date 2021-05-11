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

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('rubic.exchange')) {
      const headerName = 'X-CSRFToken';
      const token = this.tokenExtractor.getToken() as string;
      if (token !== null && !req.headers.has(headerName)) {
        return next.handle(
          req.clone({ headers: req.headers.set(headerName, token), withCredentials: true })
        );
      }
      return next.handle(req.clone({ withCredentials: true }));
    }
    return next.handle(req);
  }
}
