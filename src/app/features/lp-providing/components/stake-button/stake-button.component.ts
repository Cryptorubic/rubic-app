import {
  ChangeDetectionStrategy,
  Component,
  Output,
  EventEmitter,
  Input,
  OnInit
} from '@angular/core';
import { WalletConnectorService } from '@app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { BlockchainData } from '@app/shared/models/blockchain/blockchain-data';
import { BLOCKCHAIN_NAME } from '@app/shared/models/blockchain/blockchain-name';
import { TuiDestroyService } from '@taiga-ui/cdk';
import BigNumber from 'bignumber.js';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map, startWith, takeUntil, tap } from 'rxjs/operators';
import { LpError } from '../../models/lp-error.enum';
import { LpProvidingService } from '../../services/lp-providing.service';

@Component({
  selector: 'app-stake-button',
  templateUrl: './stake-button.component.html',
  styleUrls: ['./stake-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class StakeButtonComponent implements OnInit {
  @Input() usdcAmountCtrl: Observable<BigNumber>;

  @Input() brbcAmountCtrl: Observable<BigNumber>;

  @Input() loading: boolean;

  @Output() onLogin = new EventEmitter<void>();

  @Output() onSwitchNetwork = new EventEmitter<void>();

  @Output() onApprove = new EventEmitter<'usdc' | 'brbc'>();

  @Output() onStake = new EventEmitter<void>();

  public readonly error$ = new BehaviorSubject<LpError | null>(null);

  public readonly errors = LpError;

  public readonly needUsdcApprove$ = this.service.needUsdcApprove$;

  public readonly needBrbcApprove$ = this.service.needBrbcApprove$;

  public readonly needSwitchNetwork$ = this.walletConnectorService.networkChange$.pipe(
    startWith(this.walletConnectorService.network),
    filter<BlockchainData>(Boolean),
    map(network => {
      return network?.name !== BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET;
    }),
    takeUntil(this.destroy$)
  );

  constructor(
    private readonly service: LpProvidingService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit(): void {
    combineLatest([this.brbcAmountCtrl, this.service.brbcBalance$])
      .pipe(
        tap(([brbcAmount, brbcBalance]) =>
          this.error$.next(this.service.checkAmountForErrors(brbcAmount, brbcBalance))
        )
      )
      .subscribe();

    combineLatest([this.usdcAmountCtrl, this.service.usdcBalance$])
      .pipe(
        tap(([usdcAmount, usdcBalance]) =>
          this.error$.next(this.service.checkAmountForErrors(usdcAmount, usdcBalance))
        )
      )
      .subscribe();
  }
}
