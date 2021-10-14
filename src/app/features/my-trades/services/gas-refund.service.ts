import { Injectable } from '@angular/core';
import { GasRefundApiService } from 'src/app/core/services/backend/gas-refund-api/gas-refund-api.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Promotion } from 'src/app/features/my-trades/models/promotion';
import { tuiPure } from '@taiga-ui/cdk';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { filter } from 'rxjs/operators';
import { mapToVoid } from 'src/app/shared/utils/utils';

@Injectable()
export class GasRefundService {
  private _userPromotions$ = new BehaviorSubject<Promotion[]>([]);

  @tuiPure
  public get userPromotions$(): Observable<Promotion[]> {
    return this._userPromotions$.asObservable();
  }

  public get userPromotions(): Promotion[] {
    return this._userPromotions$.getValue();
  }

  constructor(private gasRefundApiService: GasRefundApiService, authService: AuthService) {
    authService
      .getCurrentUser()
      .pipe(filter(user => !!user?.address))
      .subscribe(() => this.updateUserPromotions());

    this.updateUserPromotions();
  }

  public updateUserPromotions(): Observable<void> {
    const userPromotions$ = this.gasRefundApiService.getUserPromotions();
    userPromotions$.subscribe(promotions => this._userPromotions$.next(promotions));

    return userPromotions$.pipe(mapToVoid());
  }
}
