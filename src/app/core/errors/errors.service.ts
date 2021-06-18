import { Inject, Injectable, Injector, Type } from '@angular/core';
import {
  TuiNotification,
  TuiNotificationContentContext,
  TuiNotificationsService
} from '@taiga-ui/core';
import { Observable, EMPTY } from 'rxjs';
import { PolymorpheusComponent, PolymorpheusContent } from '@tinkoff/ng-polymorpheus';
import { TranslateService } from '@ngx-translate/core';
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
import { AccountError } from '../../shared/models/errors/provider/AccountError';
import { LowGasError } from '../../shared/models/errors/provider/LowGasError';
import { OneinchQuoteError } from '../../shared/models/errors/provider/OneinchQuoteError';
import { RetrievingTokensError } from '../../shared/models/errors/provider/RetrievingTokensError';
import { SignRejectError } from '../../shared/models/errors/provider/SignRejectError';
import { UserRejectError } from '../../shared/models/errors/provider/UserRejectError';
import { WalletconnectError } from '../../shared/models/errors/provider/WalletconnectError';
import { WalletError } from '../../shared/models/errors/provider/WalletError';
import { WrongToken } from '../../shared/models/errors/provider/WrongToken';
import { OverQueryLimitError } from '../../shared/models/errors/bridge/OverQueryLimitError';
import { OverQueryLimitErrorComponent } from './components/over-query-limit-error/over-query-limit-error.component';
import { WalletlinkError } from '../../shared/models/errors/provider/WalletlinkError';

@Injectable({
  providedIn: 'root'
})
export class ErrorsService {
  constructor(
    private readonly notificationsService: TuiNotificationsService,
    @Inject(Injector) private injector: Injector,
    private translateService: TranslateService
  ) {}

  catch$ = (error: Error): Observable<never> => {
    console.debug(error);

    let errorContent: PolymorpheusContent<TuiNotificationContentContext<void, any>> | string =
      'An unknown error occurred';
    const options = {
      label: 'Error',
      status: TuiNotification.Error,
      data: {},
      autoClose: 7000
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
      case OverQueryLimitError:
        setPolyContent(OverQueryLimitErrorComponent);
        break;
      case TotalSupplyOverflowError:
        setPolyContent(TotalSupplyOverflowErrorComponent);
        options.data = {
          tokenSymbol: (error as unknown as TotalSupplyOverflowErrorComponent).tokenSymbol,
          totalSupply: (error as unknown as TotalSupplyOverflowErrorComponent).totalSupply
        };
        break;
      case AccountError:
        this.notificationsService
          .show(this.translateService.instant('errors.noMetamaskAccess'), options)
          .subscribe();
        return EMPTY;
      case LowGasError:
        this.notificationsService
          .show(this.translateService.instant('errors.lowGas'), options)
          .subscribe();
        return EMPTY;
      case OneinchQuoteError:
        this.notificationsService
          .show(this.translateService.instant('errors.oneInchQuote'), options)
          .subscribe();
        return EMPTY;
      case RetrievingTokensError:
        this.notificationsService
          .show(this.translateService.instant('errors.retrievingTokensError'), options)
          .subscribe();
        return EMPTY;
      case SignRejectError:
        this.notificationsService
          .show(this.translateService.instant('errors.signReject'), options)
          .subscribe();
        return EMPTY;
      case UserRejectError:
        this.notificationsService
          .show(this.translateService.instant('errors.userReject'), options)
          .subscribe();
        return EMPTY;
      case WalletconnectError:
        this.notificationsService
          .show(this.translateService.instant('errors.noQrCode'), options)
          .subscribe();
        return EMPTY;
      case WalletError:
        this.notificationsService
          .show(this.translateService.instant('errors.noWallet'), options)
          .subscribe();
        return EMPTY;
      case WrongToken:
        this.notificationsService
          .show(this.translateService.instant('errors.wrongToken'), options)
          .subscribe();
        return EMPTY;
      case WalletlinkError:
        this.notificationsService
          .show(this.translateService.instant('errors.noQrCode'), options)
          .subscribe();
        return EMPTY;
      default:
        console.error(error);
        setPolyContent(RubicErrorComponent);
        break;
    }

    this.notificationsService.show(errorContent, options).subscribe();
    return EMPTY;
  };
}
