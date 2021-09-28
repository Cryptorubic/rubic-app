import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';

@Injectable()
export class IframeInterceptor implements HttpInterceptor {
  constructor(private readonly iframeService: IframeService) {}

  intercept(httpRequest: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const domain = this.iframeService.originDomain;
    if (domain.includes('rubic.exchange')) {
      return next.handle(httpRequest);
    }

    return next.handle(httpRequest.clone({ params: httpRequest.params.set('domain', domain) }));
  }
}
