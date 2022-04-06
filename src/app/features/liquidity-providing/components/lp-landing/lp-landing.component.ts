import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { WalletConnectorService } from '@app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { WalletsModalService } from '@app/core/wallets/services/wallets-modal.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { takeUntil } from 'rxjs/operators';
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

  public readonly isWhitelistInProgress$ = this.lpService.isWhitelistInProgress$;

  public readonly isWhitelistUser$ = this.lpService.isWhitelistUser$;

  public readonly whitelistTimer$ = this.lpService.whitelistTimer$;

  public readonly depositType = DepositType;

  constructor(
    private readonly lpService: LiquidityProvidingService,
    private readonly walletsModalService: WalletsModalService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly cdr: ChangeDetectorRef,
    private readonly destroy$: TuiDestroyService
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
}
