import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OnramperApiService } from '@features/swaps/features/onramper-exchange/services/onramper-api.service';
import { ENVIRONMENT } from '../../../../../../environments/environment';

/**
 * Intercepts requests targeted to onramper apis.
 */
@Injectable()
export class OnramperIntercepror implements HttpInterceptor {
  intercept(httpRequest: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (httpRequest.url.includes(OnramperApiService.mainApi)) {
      const request = httpRequest.clone({
        headers: httpRequest.headers.set('authorization', ENVIRONMENT.onramperApiKey)
      });
      return next.handle(request);
    }

    return next.handle(httpRequest);
  }
}
