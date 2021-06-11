import { Inject, Injectable, Injector, Type } from '@angular/core';
import {
  TuiNotification,
  TuiNotificationContentContext,
  TuiNotificationsService
} from '@taiga-ui/core';
import { Observable, EMPTY } from 'rxjs';
import { PolymorpheusComponent, PolymorpheusContent } from '@tinkoff/ng-polymorpheus';
import { RubicError } from '../../shared/models/errors/RubicError';
import { RubicErrorComponent } from './components/rubic-error/rubic-error.component';
import { NotSupportedNetworkError } from '../../shared/models/errors/provider/NotSupportedNetwork';
import { NotSupportedNetworkErrorComponent } from './components/not-supported-network-error/not-supported-network-error.component';

@Injectable({
  providedIn: 'root'
})
export class ErrorsService {
  constructor(
    private readonly notificationsService: TuiNotificationsService,
    @Inject(Injector) private injector: Injector
  ) {}

  catch$ = (error: Error): Observable<never> => {
    console.debug(error);

    let errorContent: PolymorpheusContent<TuiNotificationContentContext<void, any>> | string =
      'An unknown error occurred';
    const options = {
      label: 'Error',
      status: TuiNotification.Error,
      data: {}
    };
    const setPolyContent = (Component: Type<object>) => {
      errorContent = new PolymorpheusComponent(Component, this.injector);
    };

    switch (error.constructor) {
      case RubicError:
        setPolyContent(RubicErrorComponent);
        break;
      case NotSupportedNetworkError:
        setPolyContent(NotSupportedNetworkErrorComponent);
        options.data = { networkToChoose: (<NotSupportedNetworkError>error).networkToChoose };
        break;
      default:
        console.error(error);
        setPolyContent(RubicErrorComponent);
        break;
    }

    this.notificationsService.show(errorContent, options).subscribe();
    return EMPTY;
  };
}
