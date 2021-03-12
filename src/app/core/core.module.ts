import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { RouterModule } from '@angular/router';
import { MaintenanceComponent } from './header/components/maintenance/maintenance.component';
import { HeaderComponent } from './header/components/header/header.component';
import { HeaderModule } from './header/header.module';
import { SharedModule } from '../shared/shared.module';

export function appInitializerFactory(translate: TranslateService) {
  const defaultLng = (navigator.language || navigator['browserLanguage']).split('-')[0];

  const langToSet =
    window['jQuery'].cookie('lng') || (['en', 'ko'].indexOf(defaultLng) > -1 ? defaultLng : 'en');

  return () =>
    new Promise<any>((resolve: any) => {
      translate.setDefaultLang('en');
      translate.use(langToSet).subscribe(resolve);
    });
}

@NgModule({
  declarations: [MaintenanceComponent],
  providers: [
    CookieService,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [TranslateService],
      multi: true
    }
  ],
  imports: [CommonModule, HeaderModule, SharedModule],
  exports: [MaintenanceComponent, RouterModule, HeaderComponent]
})
export class CoreModule {}
