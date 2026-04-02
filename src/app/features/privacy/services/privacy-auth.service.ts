import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HttpService } from '@app/core/services/http/http.service';
import { BehaviorSubject, combineLatestWith, firstValueFrom, map } from 'rxjs';
import { PrivateLocalStorageService } from './privacy-local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class PrivacyAuthService {
  private readonly _authorized$ = new BehaviorSubject<boolean>(false);

  public readonly authorized$ = this._authorized$.asObservable().pipe(
    combineLatestWith(this.privateLocalStorage.alreadyAuthorized$()),
    map(([authorized, alreadyAuthorized]) => authorized || alreadyAuthorized)
  );

  public readonly refCodeCtrl = new FormControl<string>('');

  public get refCode(): string {
    return this.refCodeCtrl.value;
  }

  constructor(
    private readonly httpService: HttpService,
    private readonly privateLocalStorage: PrivateLocalStorageService
  ) {}

  public async validateCode(code: string): Promise<boolean> {
    try {
      const res = await firstValueFrom(
        this.httpService.get<{ is_valid: boolean }>('v3/tmp/referrers/check_code', { code })
      );
      this._authorized$.next(res.is_valid);
      return res.is_valid;
    } catch (err) {
      console.debug('[PrivacyRefCodeService_validateCode] err:', err);
      this._authorized$.next(false);
      return false;
    }
  }
}
