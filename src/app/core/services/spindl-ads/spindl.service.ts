import { Injectable } from '@angular/core';
import spindl from '@spindl-xyz/attribution';
import { ENVIRONMENT } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';
import { distinctUntilChanged } from 'rxjs';
import { HttpService } from '../http/http.service';
import { HttpClient } from '@angular/common/http';

// interface GeoPlugonResp {
//   geoplugin_countryCode: string;
//   geoplugin_latitude: string;
//   geoplugin_longitude: string;
//   geoplugin_countryName: string;
// }

@Injectable({
  providedIn: 'root'
})
export class SpindlService {
  private _showSpindl: boolean = false;

  public get showSpindl(): boolean {
    return this._showSpindl;
  }

  constructor(
    private readonly authService: AuthService,
    private readonly httpService: HttpService,
    private readonly httpClient: HttpClient
  ) {}

  private async isForbiddenIP(): Promise<boolean> {
    return false;
    // const { geoplugin_countryCode } = await firstValueFrom(
    //   this.httpService.get<GeoPlugonResp>('', undefined, 'http://www.geoplugin.net/json.gp')
    // );

    // return geoplugin_countryCode === 'RU';
  }

  public async initSpindlAds(): Promise<void> {
    const isForbiddenIP = await this.isForbiddenIP().catch(() => false);
    this._showSpindl = !isForbiddenIP;

    if (this._showSpindl) {
      spindl.configure({
        sdkKey: '5c8549dc-9be6-49ee-bc3f-8192870f4553',
        debugMode: !ENVIRONMENT.production,
        maxRetries: 3
      });

      spindl.enableAutoPageViews();

      this.authService.currentUser$
        .pipe(distinctUntilChanged((prev, curr) => prev?.address === curr?.address))
        .subscribe(user => {
          if (user.address) spindl.attribute(user.address);
        });
    }
  }
}
