import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { RouterModule } from '@angular/router';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RubicFooterComponent } from 'src/app/core/rubic-footer/rubic-footer.component';
import { SwapsModule } from 'src/app/features/swaps/swaps.module';
import { MyTradesModule } from 'src/app/features/my-trades/my-trades.module';
import { WalletsModule } from 'src/app/core/wallets/wallets.module';
import { NG_EVENT_PLUGINS } from '@tinkoff/ng-event-plugins';
import { RubicExchangeInterceptor } from 'src/app/core/interceptors/rubic-exchange-interceptor';
import { IframeInterceptor } from 'src/app/core/interceptors/iframe-interceptor';
import { MaintenanceComponent } from './header/components/maintenance/maintenance.component';
import { HeaderComponent } from './header/components/header/header.component';
import { HeaderModule } from './header/header.module';
import { SharedModule } from '../shared/shared.module';
import { configLoader, httpLoaderFactory } from './app.loaders';
import { ContentLoaderService } from './services/content-loader/content-loader.service';
import { ErrorsModule } from './errors/errors.module';

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
      provide: HTTP_INTERCEPTORS,
      useClass: RubicExchangeInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: IframeInterceptor,
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
    SwapsModule,
    MyTradesModule
  ],
  exports: [MaintenanceComponent, RouterModule, HeaderComponent, RubicFooterComponent]
})
export class CoreModule {}
