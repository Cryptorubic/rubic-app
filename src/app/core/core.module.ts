import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { RouterModule } from '@angular/router';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RubicFooterComponent } from 'src/app/core/rubic-footer/rubic-footer.component';
import { SwapsModule } from 'src/app/features/swaps/swaps.module';
import { MyTradesModule } from 'src/app/features/my-trades/my-trades.module';
import { MaintenanceComponent } from './header/components/maintenance/maintenance.component';
import { HeaderComponent } from './header/components/header/header.component';
import { HeaderModule } from './header/header.module';
import { SharedModule } from '../shared/shared.module';
import { configLoader, httpLoaderFactory } from './app.loaders';
import { ContentLoaderService } from './services/content-loader/content-loader.service';
import { HTTPInterceptor } from './interceptors/http-interceptor';
import { WalletsModalComponent } from './header/components/header/components/wallets-modal/wallets-modal.component';
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
      useClass: HTTPInterceptor,
      multi: true
    }
  ],
  entryComponents: [WalletsModalComponent],
  imports: [
    CommonModule,
    HeaderModule,
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
