import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RubicFooterComponent } from 'src/app/core/rubic-footer/rubic-footer.component';
import { WalletsModalModule } from '@core/wallets-modal/wallets-modal.module';
import { NG_EVENT_PLUGINS } from '@tinkoff/ng-event-plugins';
import { RubicExchangeInterceptor } from 'src/app/core/interceptors/rubic-exchange-interceptor';
import { SharedModule } from '@shared/shared.module';
import { WalletsInfoInterceptor } from '@core/interceptors/wallets-info-interceptor';
import { MaintenanceComponent } from './header/components/maintenance/maintenance.component';
import { HeaderComponent } from './header/components/header/header.component';
import { HeaderModule } from './header/header.module';
import { httpLoaderFactory } from './app.loaders';
import { ErrorsModule } from './errors/errors.module';
import * as Sentry from '@sentry/angular';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { SwapFormQueryService } from '@core/services/swaps/swap-form-query.service';
import { SwapTypeService } from '@core/services/swaps/swap-type.service';
import { FiatsService } from '@core/services/fiats/fiats.service';
import { SdkLoaderService } from '@core/services/sdk/sdk-loader.service';
import { SdkService } from '@core/services/sdk/sdk.service';
import { sdkLoader } from '@core/services/sdk/utils/sdk-loader';
import { SwapTokensUpdaterService } from '@core/services/swaps/swap-tokens-updater.service';
import { RecentTradesModule } from '@core/recent-trades/recent-trades.module';

@NgModule({
  declarations: [MaintenanceComponent, RubicFooterComponent],
  providers: [
    CookieService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: WalletsInfoInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RubicExchangeInterceptor,
      multi: true
    },
    NG_EVENT_PLUGINS,
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: false
      })
    },
    {
      provide: Sentry.TraceService,
      deps: [Router]
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {},
      deps: [Sentry.TraceService],
      multi: true
    },
    SdkLoaderService,
    {
      provide: APP_INITIALIZER,
      useFactory: sdkLoader,
      deps: [SdkLoaderService],
      multi: true
    },
    SdkService,
    SwapTypeService,
    SwapFormService,
    SwapFormQueryService,
    SwapTokensUpdaterService,
    FiatsService
  ],
  imports: [
    CommonModule,
    HeaderModule,
    WalletsModalModule,
    ErrorsModule,
    SharedModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    RecentTradesModule
  ],
  exports: [MaintenanceComponent, RouterModule, HeaderComponent, RubicFooterComponent]
})
export class CoreModule {
  // Initialized services, which are not used directly in components
  constructor(private readonly _swapTokensUpdaterService: SwapTokensUpdaterService) {}
}
