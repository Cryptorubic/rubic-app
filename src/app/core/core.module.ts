import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { RouterModule } from '@angular/router';
import { MaintenanceComponent } from './components/maintenance/maintenance.component';
import { SharedModule } from '../shared/shared.module';
import { HeaderComponent } from './components/header/header.component';

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
  declarations: [MaintenanceComponent, HeaderComponent],
  providers: [
    CookieService,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [TranslateService],
      multi: true
    }
  ],
  imports: [CommonModule, SharedModule, TranslateModule, RouterModule],
  exports: [MaintenanceComponent, HeaderComponent, RouterModule]
})
export class CoreModule {}
