import { Injectable } from '@angular/core';
import spindl from '@spindl-xyz/attribution';
import { ENVIRONMENT } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, distinctUntilChanged, firstValueFrom, Observable } from 'rxjs';
import { HeaderStore } from '@app/core/header/services/header.store';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { RubicAny } from '@app/shared/models/utility-types/rubic-any';

@Injectable({
  providedIn: 'root'
})
export class SpindlService {
  private readonly _showSpindl$ = new BehaviorSubject(false);

  public get showSpindl$(): Observable<boolean> {
    return this._showSpindl$.asObservable();
  }

  private readonly _hasNoContent$ = new BehaviorSubject(false);

  public readonly hasNoContent$ = this._hasNoContent$.asObservable();

  public get hasNoContent(): boolean {
    return this._hasNoContent$.value;
  }

  constructor(
    private readonly authService: AuthService,
    private readonly headerStore: HeaderStore,
    private readonly httpClient: HttpClient
  ) {}

  public async initSpindlAds(): Promise<void> {
    this._showSpindl$.next(true);

    spindl.configure({
      sdkKey: '5c8549dc-9be6-49ee-bc3f-8192870f4553',
      debugMode: !ENVIRONMENT.production,
      maxRetries: 3
    });

    spindl.enableAutoPageViews();

    this.authService.currentUser$
      .pipe(distinctUntilChanged((prev, curr) => prev?.address === curr?.address))
      .subscribe(user => {
        if (user?.address) {
          spindl.attribute(user.address);
          // call on first selected wallet
          if (!this.hasNoContent) this.checkForNoContent();
        }
      });
  }

  public sendSwapEvent(txHash: string): void {
    spindl.track('SWAP', { txHash }, { address: this.authService.userAddress });
  }

  private async checkForNoContent(): Promise<void> {
    const placementId = this.headerStore.isMobile ? 'under_swap_mobile' : 'under_swap_desktop';
    const spindlUrl = `https://e.spindlembed.com/v1/serve?publisher_id=rubic&placement_id=${placementId}&address=${this.authService.userAddress}`;
    const resp = await firstValueFrom(
      this.httpClient.get<HttpResponse<string>>(spindlUrl, {
        observe: 'response',
        responseType: 'text' as RubicAny
      })
    ).catch(() => ({ status: 204 }));

    this._hasNoContent$.next(resp.status === 204);
  }
}
