import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { RouterModule } from '@angular/router';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RubicFooterComponent } from 'src/app/core/rubic-footer/rubic-footer.component';
import { SwapsModule } from 'src/app/features/swaps/swaps.module';
import { WalletsModule } from 'src/app/core/wallets/wallets.module';
import { NG_EVENT_PLUGINS } from '@tinkoff/ng-event-plugins';
import { RubicExchangeInterceptor } from 'src/app/core/interceptors/rubic-exchange-interceptor';
import { SharedModule } from '@shared/shared.module';
import { WalletsInfoInterceptor } from '@core/interceptors/wallets-info-interceptor';
import { MaintenanceComponent } from './header/components/maintenance/maintenance.component';
import { HeaderComponent } from './header/components/header/header.component';
import { HeaderModule } from './header/header.module';
import { configLoader, httpLoaderFactory, sdkLoader } from './app.loaders';
import { ContentLoaderService } from './services/content-loader/content-loader.service';
import { ErrorsModule } from './errors/errors.module';
import { SdkLoaderService } from '@core/services/sdk-loader/sdk-loader.service';

@NgModule({
  declarations: [MaintenanceComponent, RubicFooterComponent],
  providers: [
    CookieService,
    {
      provide: APP_INITIALIZER,
      useFactory: configLoader,
      deps: [ContentLoaderService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: sdkLoader,
      deps: [SdkLoaderService],
      multi: true
    },
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
    NG_EVENT_PLUGINS
  ],
  imports: [
    CommonModule,
    HeaderModule,
    WalletsModule,
    ErrorsModule,
    SharedModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    SwapsModule
  ],
  exports: [MaintenanceComponent, RouterModule, HeaderComponent, RubicFooterComponent]
})
export class CoreModule {}
