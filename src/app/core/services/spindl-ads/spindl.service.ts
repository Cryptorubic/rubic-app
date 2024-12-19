import { Injectable } from '@angular/core';
import spindl from '@spindl-xyz/attribution';
import { ENVIRONMENT } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, distinctUntilChanged, firstValueFrom, Observable } from 'rxjs';
import { HttpService } from '../http/http.service';

interface IpGeolocationResp {
  country_code2: string;
}

interface IpInfoResp {
  country: string;
}

interface Ip2LocationIoResp {
  country_code: string;
}

@Injectable({
  providedIn: 'root'
})
export class SpindlService {
  private readonly IPGEOLOCATIONIO_KEY = '31553f81a35f449a9f98fc2a38fa9841';

  private readonly IPINFO_KEY = 'a5ca2c499897ac';

  private readonly IP2LOCATION_KEY = 'D13DC4B78F655A8DD9011ECC0FCDFA7D';

  private _showSpindl$ = new BehaviorSubject(false);

  public get showSpindl$(): Observable<boolean> {
    return this._showSpindl$.asObservable();
  }

  constructor(
    private readonly authService: AuthService,
    private readonly httpService: HttpService
  ) {}

  private async isForbiddenIP(): Promise<boolean> {
    const ipgeoResp = await firstValueFrom(
      this.httpService.get<IpGeolocationResp>(
        '',
        { apiKey: this.IPGEOLOCATIONIO_KEY },
        'https://api.ipgeolocation.io/ipgeo'
      )
    ).catch(() => null);

    if (ipgeoResp && ipgeoResp.country_code2) {
      // this.storageService.setItem('IS_RUSSIAN_IP', true);
      return ipgeoResp.country_code2 === 'RU';
    }

    const ipinfoResp = await firstValueFrom<IpInfoResp>(
      this.httpService.get<IpInfoResp>('', { token: this.IPINFO_KEY }, 'https://ipinfo.io')
    ).catch(() => null);

    if (ipinfoResp && ipinfoResp.country) {
      // this.storageService.setItem('IS_RUSSIAN_IP', true);
      return ipinfoResp.country === 'RU';
    }

    const ip2LocationResp = await firstValueFrom<Ip2LocationIoResp>(
      this.httpService.get<Ip2LocationIoResp>(
        '',
        { key: this.IP2LOCATION_KEY },
        'https://api.ip2location.io/'
      )
    ).catch(() => null);

    if (ip2LocationResp && ip2LocationResp.country_code) {
      // this.storageService.setItem('IS_RUSSIAN_IP', true);
      return ip2LocationResp.country_code === 'RU';
    }

    // this.storageService.setItem('IS_RUSSIAN_IP', false);

    return false;
  }

  public async initSpindlAds(): Promise<void> {
    const isForbiddenIP = await this.isForbiddenIP();
    this._showSpindl$.next(!isForbiddenIP);
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
