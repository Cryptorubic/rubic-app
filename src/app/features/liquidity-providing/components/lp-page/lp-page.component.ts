import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/core/services/auth/auth.service';
import { WalletConnectorService } from '@app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { WalletsModalService } from '@app/core/wallets/services/wallets-modal.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { combineLatest } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { LiquidityProvidingService } from '../../services/liquidity-providing.service';

@Component({
  selector: 'app-lp-page',
  templateUrl: './lp-page.component.html',
  styleUrls: ['./lp-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class LpPageComponent implements OnInit {
  public readonly showDeposits$ = combineLatest([
    this.authService.getCurrentUser(),
    this.service.deposits$
  ]).pipe(
    map(([user, deposits]) => {
      return !(user?.address && Boolean(deposits?.length));
    })
  );

  public readonly depositsLoading$ = this.service.depositsLoading$;

  constructor(
    private readonly walletsModalService: WalletsModalService,
    private readonly authService: AuthService,
    private readonly service: LiquidityProvidingService,
    private readonly destroy$: TuiDestroyService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.service
      .getDeposits()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.service.setDepositsLoading(false));

    this.walletConnectorService.addressChange$.subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  public login(): void {
    this.walletsModalService.open().subscribe();
  }

  public navigateBack(): void {
    this.router.navigate(['staking-lp']);
  }
}
