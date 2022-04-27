import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HeaderStore } from '@app/core/header/services/header.store';
import { WalletConnectorService } from '@app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { ThemeService } from '@app/core/services/theme/theme.service';
import { WalletsModalService } from '@app/core/wallets/services/wallets-modal.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { map, takeUntil } from 'rxjs/operators';
import { DepositType } from '../../models/deposit-type.enum';
import { LiquidityProvidingService } from '../../services/liquidity-providing.service';

@Component({
  selector: 'app-lp-landing',
  templateUrl: './lp-landing.component.html',
  styleUrls: ['./lp-landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class LpLandingComponent implements OnInit {
  public readonly needLogin$ = this.lpService.needLogin$;

  public readonly needSwitchNetwork$ = this.lpService.needSwitchNetwork$;

  public readonly isWhitelistInProgress$ = this.lpService.isWhitelistInProgress$;

  public readonly isWhitelistUser$ = this.lpService.isWhitelistUser$;

  public readonly whitelistEndTime = this.lpService.whitelistEndTime;

  public readonly depositType = DepositType;

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  public readonly isDark$ = this.themeService.theme$.pipe(map(theme => theme === 'dark'));

  public readonly isLpEnded = this.lpService.isLpEneded;

  public readonly isPoolFull = this.lpService.isPoolFull;

  constructor(
    private readonly lpService: LiquidityProvidingService,
    private readonly walletsModalService: WalletsModalService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly cdr: ChangeDetectorRef,
    private readonly destroy$: TuiDestroyService,
    private readonly headerStore: HeaderStore,
    private readonly themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.walletConnectorService.addressChange$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  public login(): void {
    this.walletsModalService.open().subscribe();
  }

  public navigateToDepositForm(depositType: DepositType): void {
    this.lpService.navigateToDepositForm(depositType);
  }

  public isInPast(date: Date): boolean {
    return new Date() < date;
  }

  public async switchNetwork(): Promise<void> {
    await this.lpService.switchNetwork();
    this.cdr.detectChanges();
  }
}
