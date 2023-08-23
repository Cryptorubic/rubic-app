import { Inject, Injectable, Injector, INJECTOR } from '@angular/core';
import { BehaviorSubject, firstValueFrom, map, Observable, of } from 'rxjs';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { switchIif } from '@shared/utils/utils';
import { HttpService } from '@core/services/http/http.service';
import { Points } from '@features/swap-and-earn/models/points';
import { SuccessWithdrawModalComponent } from '@shared/components/success-modal/success-withdraw-modal/success-withdraw-modal.component';
import { ModalService } from '@core/modals/services/modal.service';
import { SenTab } from '@features/swap-and-earn/models/swap-to-earn-tabs';

@Injectable({ providedIn: 'root' })
export class SwapAndEarnStateService {
  private readonly _workingStatus$ = new BehaviorSubject(false);

  public readonly workingStatus$ = this._workingStatus$.asObservable();

  private readonly _points$ = new BehaviorSubject<Points>({ confirmed: 0, pending: 0 });

  public readonly points$ = this._points$.asObservable();

  private readonly _currentTab$ = new BehaviorSubject<SenTab>(
    SwapAndEarnStateService.setDefaultTab()
  );

  public readonly currentTab$ = this._currentTab$.asObservable();

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly httpService: HttpService,
    private readonly dialogService: ModalService,
    @Inject(INJECTOR) private readonly injector: Injector
  ) {
    this.handleAddressChange();
    this.fetchWorkingStatus();
  }

  public get currentTab(): SenTab {
    return this._currentTab$.getValue();
  }

  public set currentTab(tab: SenTab) {
    this._currentTab$.next(tab);
  }

  private static setDefaultTab(): SenTab {
    return window.location.pathname.includes('retrodrop') ? 'retrodrop' : 'airdrop';
  }

  private fetchWorkingStatus(): void {
    this._workingStatus$.next(true);
  }

  public fetchPoints(): Observable<Points> {
    const address = this.walletConnectorService.address;
    if (!address) {
      return of({ confirmed: 0, pending: 0 });
    }
    return this.httpService.get<Points>(`rewards/?address=${address}`);
  }

  public async updatePoints(): Promise<void> {
    await this.fetchPoints().subscribe(points => {
      this._points$.next(points);
    });
  }

  public getSwapAndEarnPointsAmount(): Observable<number> {
    return this.points$.pipe(
      map(points => {
        if (points.participant) {
          return 50;
        }

        return 100;
      })
    );
  }

  public async claimPoints(points: number): Promise<void> {
    const address = this.walletConnectorService.address;

    if (address) {
      await firstValueFrom(this.httpService.post(`rewards/withdraw/?address=${address}`));

      this.dialogService
        .showDialog(SuccessWithdrawModalComponent, {
          data: {
            points: points
          }
        })
        .subscribe();

      await this.updatePoints();
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
      .subscribe(points => {
        this._points$.next(points);
      });
  }
}
