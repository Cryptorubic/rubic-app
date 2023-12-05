import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from 'src/environments/environment';

@Injectable()
export class LifiApiKeyInterceptor implements HttpInterceptor {
  private readonly LIFI_URL_BASE = 'https://li.quest/v1';

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.isLifiApiRequest(request)) {
      const clone = request.clone({
        headers: request.headers.set('x-lifi-api-key', ENVIRONMENT.lifiApiKey)
      });
      return next.handle(clone);
    } else return next.handle(request);
  }

  private isLifiApiRequest(request: HttpRequest<unknown>): boolean {
    return request.url.includes(this.LIFI_URL_BASE);
  }
}
