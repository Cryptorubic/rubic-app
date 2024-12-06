import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderStore } from '@app/core/header/services/header.store';
import { AuthService } from '@app/core/services/auth/auth.service';
import { TransactionStep } from '@app/features/trade/models/transaction-steps';
import { PreviewSwapService } from '@app/features/trade/services/preview-swap/preview-swap.service';
import { combineLatestWith, map, Observable } from 'rxjs';

@Component({
  selector: 'app-spindle-banner',
  templateUrl: './spindle-banner.component.html',
  styleUrls: ['./spindle-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpindleBannerComponent {
  public readonly iframeSrc$ = this.headerStore.getMobileDisplayStatus().pipe(
    combineLatestWith(this.authService.currentUser$, this.previewSwapService.transactionState$),
    map(([isMobile, user, txState]) => {
      const placementId = this.getPlacementId(isMobile, txState.step);
      const walletAddress = user.address ?? '0xe388Ed184958062a2ea29B7fD049ca21244AE02e';
      const src = `https://e.spindlembed.com/v1/serve?publisher_id=rubic&placement_id=${placementId}&address=${walletAddress}`;
      return src;
    })
  );

  public readonly iframeSize$: Observable<{ width: number; height: number }> = this.headerStore
    .getMobileDisplayStatus()
    .pipe(
      combineLatestWith(this.previewSwapService.transactionState$),
      map(([isMobile, txState]) => {
        if (isMobile || txState.step === 'success') return { width: 300, height: 250 };
        return { width: 600, height: 100 };
      })
    );

  public get isMobile(): boolean {
    return this.headerStore.isMobile;
  }

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly authService: AuthService,
    private readonly previewSwapService: PreviewSwapService
  ) {}

  private getPlacementId(isMobile: boolean, step: TransactionStep): string {
    if (step === 'success') return 'post_swap';
    else if (isMobile) return 'under_swap_mobile';
    else return 'under_swap_desktop';
  }
}
