import { Injectable } from '@angular/core';
import spindl from '@spindl-xyz/attribution';
import { ENVIRONMENT } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, distinctUntilChanged, Observable } from 'rxjs';
import { HttpService } from '../http/http.service';

@Injectable({
  providedIn: 'root'
})
export class SpindlService {
  private _showSpindl$ = new BehaviorSubject(false);

  public get showSpindl$(): Observable<boolean> {
    return this._showSpindl$.asObservable();
  }

  constructor(
    private readonly authService: AuthService,
    private readonly httpService: HttpService
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
        if (user?.address) spindl.attribute(user.address);
      });
  }

  public sendSwapEvent(txHash: string): void {
    spindl.track('SWAP', { txHash }, { address: this.authService.userAddress });
  }
}
