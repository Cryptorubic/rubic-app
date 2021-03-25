import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { HealthcheckService } from './core/services/backend/healthcheck/healthcheck.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public isBackendAvailable: boolean;

  constructor(
    private readonly healthcheckService: HealthcheckService,
    private readonly translateService: TranslateService,
    private readonly cookieService: CookieService
  ) {
    this.setupLanguage();
    this.healthcheckService
      .healthCheck()
      .then(isAvailable => (this.isBackendAvailable = isAvailable));
  }

  private setupLanguage(): void {
    const userRegionLanguage = navigator.language?.split('-')[0];
    const lng = this.cookieService.get('lng') || userRegionLanguage || 'en';
    this.translateService.setDefaultLang(lng);
    this.translateService.use(lng);
  }
}
