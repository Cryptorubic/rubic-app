import { Inject, Injectable, Injector } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WindowWidthService } from '@core/services/widnow-width-service/window-width.service';
import { WindowSize } from '@core/services/widnow-width-service/models/window-size';
import { ExpirationCustomComponent } from '@features/swaps/features/limit-order/components/expiration-custom/expiration-custom.component';
import { ModalService } from '@app/core/modals/services/modal.service';

@Injectable()
export class OrderExpirationService {
  /**
   * Stores expiration time in minutes.
   */
  private readonly _expirationTime$ = new BehaviorSubject(7 * 24 * 60);

  public readonly expirationTime$ = this._expirationTime$.asObservable();

  public get expirationTime(): number {
    return this._expirationTime$.getValue();
  }

  constructor(
    private readonly dialogService: ModalService,
    private readonly windowWidthService: WindowWidthService,
    @Inject(Injector) private readonly injector: Injector
  ) {}

  public updateExpirationTime(minutes: number): void {
    this._expirationTime$.next(minutes);
  }

  public openExpirationCustomModal(): Observable<unknown> {
    return this.dialogService.showDialog(
      ExpirationCustomComponent,
      {
        size: this.windowWidthService.windowSize <= WindowSize.TABLET ? 'page' : 's',
        fitContent: true
      },
      this.injector
    );
  }
}
