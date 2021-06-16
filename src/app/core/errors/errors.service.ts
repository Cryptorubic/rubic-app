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
import InsufficientFundsError from '../../shared/models/errors/instant-trade/InsufficientFundsError';
import { InsufficientFundsErrorComponent } from './components/insufficient-funds-error/insufficient-funds-error.component';
import { MetamaskErrorComponent } from './components/metamask-error/metamask-error.component';
import { MetamaskError } from '../../shared/models/errors/provider/MetamaskError';
import { NetworkError } from '../../shared/models/errors/provider/NetworkError';
import { NetworkErrorComponent } from './components/network-error/network-error.component';
import { TotalSupplyOverflowError } from '../../shared/models/errors/order-book/TotalSupplyOverflowError';
import { TotalSupplyOverflowErrorComponent } from './components/total-supply-overflow-error/total-supply-overflow-error.component';
import { OverQueryLimitError } from '../../shared/models/errors/bridge/OverQueryLimitError';

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
        options.data = { networkToChoose: (error as NotSupportedNetworkError).networkToChoose };
        break;
      case InsufficientFundsError:
        setPolyContent(InsufficientFundsErrorComponent);
        options.data = {
          tokenSymbol: (error as InsufficientFundsError).tokenSymbol,
          balance: (error as InsufficientFundsError).balance,
          requiredBalance: (error as InsufficientFundsError).requiredBalance
        };
        break;
      case MetamaskError:
        setPolyContent(MetamaskErrorComponent);
        break;
      case NetworkError:
        setPolyContent(NetworkErrorComponent);
        options.data = { networkToChoose: (error as NetworkError).networkToChoose };
        break;
      case TotalSupplyOverflowError:
        setPolyContent(TotalSupplyOverflowErrorComponent);
        options.data = {
          tokenSymbol: (error as unknown as TotalSupplyOverflowErrorComponent).tokenSymbol,
          totalSupply: (error as unknown as TotalSupplyOverflowErrorComponent).totalSupply
        };
        break;
      case OverQueryLimitError:
        console.log('account error');
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
