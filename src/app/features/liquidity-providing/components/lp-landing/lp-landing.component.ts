import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { WalletConnectorService } from '@app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { WalletsModalService } from '@app/core/wallets/services/wallets-modal.service';
import { DepositType } from '../../models/deposit-type.enum';
import { LiquidityProvidingService } from '../../services/liquidity-providing.service';

@Component({
  selector: 'app-lp-landing',
  templateUrl: './lp-landing.component.html',
  styleUrls: ['./lp-landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LpLandingComponent {
  public readonly needLogin$ = this.service.needLogin$;

  public readonly isWhitelistInProgress$ = this.service.isWhitelistInProgress$;

  public readonly isWhitelistUser$ = this.service.isWhitelistUser$;

  public readonly depositType = DepositType;

  constructor(
    private readonly service: LiquidityProvidingService,
    private readonly walletsModalService: WalletsModalService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.walletConnectorService.addressChange$.subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  public login(): void {
    this.walletsModalService.open().subscribe();
  }

  public navigateToDepositForm(depositType: DepositType): void {
    alert('deposit type - ' + depositType);
    this.service.navigateToDepositForm(depositType);
  }
}
