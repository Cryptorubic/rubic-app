import { Component } from '@angular/core';
import { HealthcheckService } from './core/services/backend/healthcheck/healthcheck.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public isBackendAvailable: boolean;

  constructor(healthcheckService: HealthcheckService) {
    healthcheckService
      .healthCheck()
      .subscribe(isAvailable => (this.isBackendAvailable = isAvailable));
  }
}
