import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HttpService } from '@app/core/services/http/http.service';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrivacyAuthService {
  private readonly _authorized$ = new BehaviorSubject<boolean>(false);

  public readonly authorized$ = this._authorized$.asObservable();

  public readonly refCodeCtrl = new FormControl<string>('');

  // @TODO_1712 отправлять этот код перед любым приватным действием в запросе на swap_trade для клиента
  public get refCode(): string {
    return this.refCodeCtrl.value;
  }

  constructor(private readonly httpService: HttpService) {}

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
