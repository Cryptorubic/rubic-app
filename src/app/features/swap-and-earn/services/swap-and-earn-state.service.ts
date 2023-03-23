import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { switchIif } from '@shared/utils/utils';
import { HttpService } from '@core/services/http/http.service';
import { Points } from '@features/swap-and-earn/models/points';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SwapAndEarnStateService {
  private readonly _workingStatus$ = new BehaviorSubject(false);

  public readonly workingStatus$ = this._workingStatus$.asObservable();

  private readonly _points$ = new BehaviorSubject<Points>({ confirmed: 0, pending: 0 });

  public readonly points$ = this._points$.asObservable();

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly httpService: HttpService
  ) {
    this.handleAddressChange();
    this.fetchWorkingStatus();
  }

  private fetchWorkingStatus(): void {
    this._workingStatus$.next(true);
  }

  public fetchPoints(): Observable<Points> {
    const address = this.walletConnectorService.address;
    if (!address) {
      return of({ confirmed: 0, pending: 0 });
    }
    return this.httpService.get<Points>(`rewards?address=${address}`);
  }

  public async claimPoints(): Promise<void> {
    const address = this.walletConnectorService.address;

    if (address) {
      await this.fetchPoints().pipe(
        tap(points => {
          console.log(points.confirmed);
          // this.httpService.post('', points.confirmed);
        })
      );
    }
  }

  private handleAddressChange(): void {
    this.walletConnectorService.addressChange$
      .pipe(
        switchIif(
          Boolean,
          () => this.fetchPoints(),
          () => of({ confirmed: 0, pending: 0 })
        )
      )
      .subscribe(points => this._points$.next(points));
  }
}
