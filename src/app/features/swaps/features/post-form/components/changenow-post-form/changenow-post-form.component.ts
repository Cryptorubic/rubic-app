import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { ChangenowPostTradeService } from '@features/swaps/core/services/changenow-post-trade-service/changenow-post-trade.service';
import { ChangenowPostTrade } from '@features/swaps/core/services/changenow-post-trade-service/models/changenow-post-trade';
import { BlockchainName, ChangenowApiStatus } from 'rubic-sdk';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { DEFAULT_TOKEN_IMAGE } from '@app/shared/constants/tokens/default-token-image';
import { TokensService } from '@core/services/tokens/tokens.service';
import { Observable, timer } from 'rxjs';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { NAVIGATOR, WINDOW } from '@ng-web-apis/common';

@Component({
  selector: 'app-changenow-post-form',
  templateUrl: './changenow-post-form.component.html',
  styleUrls: ['./changenow-post-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangenowPostFormComponent {
  public readonly DEFAULT_TOKEN_IMAGE = DEFAULT_TOKEN_IMAGE;

  public readonly trade: ChangenowPostTrade;

  public readonly status$: Observable<ChangenowApiStatus>;

  public hintShown: boolean;

  constructor(
    private readonly router: Router,
    private readonly changenowPostTradeService: ChangenowPostTradeService,
    private readonly tokensService: TokensService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly cdr: ChangeDetectorRef,
    @Inject(WINDOW) private readonly window: Window,
    @Inject(NAVIGATOR) private readonly navigator: Navigator
  ) {
    this.trade = this.changenowPostTradeService.trade;

    if (!this.trade) {
      this.router.navigate(['/'], { queryParamsHandling: 'merge' });
    } else {
      this.changenowPostTradeService.setupUpdate();
      this.status$ = this.changenowPostTradeService.status$;
    }
  }

  public getBlockchainLabel(blockchain: BlockchainName): string {
    return blockchainLabel[blockchain];
  }

  public onImageError($event: Event): void {
    this.tokensService.onTokenImageError($event);
  }

  public async navigateToSwaps(): Promise<void> {
    await this.router.navigate(['/'], { queryParamsHandling: 'merge' });
  }

  public handleButtonClick(): void {
    this.gtmService.reloadGtmSession();
    this.window.open('changenow-recent-trades', '_blank');
  }

  /**
   * Copy error message to clipboard.
   */
  public copyToClipboard(): void {
    this.showHint();
    this.navigator.clipboard.writeText(this.trade.depositAddress);
  }

  /**
   * Show copy to clipboard hint.
   */
  private showHint(): void {
    this.hintShown = true;
    timer(1500).subscribe(() => {
      this.hintShown = false;
      this.cdr.markForCheck();
    });
  }
}
