import { Injectable } from '@angular/core';
import { FormsTogglerService } from '../forms-toggler/forms-toggler.service';
import { filter } from 'rxjs';
import { MAIN_FORM_TYPE } from '../forms-toggler/models';
import { GoogleTagManagerService } from '@app/core/services/google-tag-manager/google-tag-manager.service';
import { NavigationEnd, Router } from '@angular/router';

@Injectable()
export class GasFormAnalyticService {
  constructor(
    private readonly formsTogglerService: FormsTogglerService,
    private gtmService: GoogleTagManagerService,
    private readonly router: Router
  ) {
    console.log('[GasFormAnalyticService] INIT');
    this.subOnGasFormSelect();
    this.subOnGetGasRouteActivate();
  }

  private subOnGasFormSelect(): void {
    this.formsTogglerService.selectedForm$
      .pipe(filter(form => form === MAIN_FORM_TYPE.GAS_FORM))
      .subscribe(() => {
        this.gtmService.fireGasFormGtm({ visitedFrom: 'fromSwapForm' });
      });
  }

  private subOnGetGasRouteActivate(): void {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        console.log('subOnGetGasRouteActivate', e);
        if (e.urlAfterRedirects === '/get-gas') {
          console.log('urlAfterRedirects === /get-gas');
        }
      });
  }
}
