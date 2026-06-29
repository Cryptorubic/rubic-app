import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  Input,
  OnInit
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { BlockchainName } from '@cryptorubic/core';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { RailgunRevealFacadeService } from '@features/privacy/providers/railgun/services/common/railgun-reveal-facade.service';
import { RailgunPrivateAssetsService } from '@features/privacy/providers/railgun/services/common/railgun-private-assets.service';
import { ToAssetsService } from '@features/trade/components/assets-selector/services/to-assets.service';
import { RevealService } from '@features/privacy/providers/railgun/services/reveal/reveal.service';
import { firstValueFrom, startWith, tap } from 'rxjs';
import { PrivateEvent } from '@features/privacy/providers/shared-privacy-providers/models/private-event';
import { RailgunSupportedChain } from '@features/privacy/providers/railgun/constants/network-map';
import { RailgunFacadeService } from '@features/privacy/providers/railgun/services/railgun-facade.service';
import { PrivateStatisticsService } from '@features/privacy/providers/shared-privacy-providers/services/private-statistics/private-statistics.service';
import { PrivateActionButtonService } from '@features/privacy/providers/shared-privacy-providers/services/private-action-button/private-action-button.service';
import { RailgunPrivateActionButtonService } from '@features/privacy/providers/railgun/services/common/railgun-private-action-button.service';
import { RevealWindowService } from '@features/privacy/providers/shared-privacy-providers/services/reveal-window/reveal-window.service';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { donePrivateStep } from '@features/privacy/providers/shared-privacy-providers/components/private-preview-swap/constants/done-private-step';
import { getScannerUrl } from '../../../privacycash/services/common/token-facades/utils/get-minimal-tokens-by-chain';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: false,
  selector: 'app-railgun-reveal-page',
  templateUrl: './railgun-reveal-page.component.html',
  styleUrls: ['./railgun-reveal-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    RailgunPrivateAssetsService,
    { provide: ToAssetsService, useExisting: RailgunPrivateAssetsService },
    { provide: TokensFacadeService, useClass: RailgunRevealFacadeService },
    RailgunPrivateActionButtonService,
    { provide: PrivateActionButtonService, useExisting: RailgunPrivateActionButtonService }
  ]
})
export class RailgunRevealPageComponent implements OnInit {
  @Input({ required: true }) public readonly railgunId: string;

  @Input({ required: true }) balances: Record<
    RailgunSupportedChain,
    | {
        address: string;
        amount: string;
        blockchain: BlockchainName;
      }[]
    | null
  >;

  private readonly privateStatisticsService = inject(PrivateStatisticsService);

  public readonly receiverCtrl = new FormControl<string>('');

  private readonly revealService = inject(RevealService);

  private readonly railgunFacade = inject(RailgunFacadeService);

  private readonly toAssetsService = inject(ToAssetsService) as RailgunPrivateAssetsService;

  private readonly walletConnectorService = inject(WalletConnectorService);

  private readonly windowService = inject(RevealWindowService);

  private readonly actionButtonService = inject(PrivateActionButtonService);

  ngOnInit() {
    this.receiverCtrl.valueChanges
      .pipe(
        startWith(this.receiverCtrl.value),
        tap(address => {
          this.actionButtonService.setReceiverAddress(address);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
    this.railgunFacade.completedChains$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(chains => this.toAssetsService.setBlockchainList(chains));
  }

  public async reveal(params: PrivateEvent): Promise<void> {
    const { balanceToken, token, loadingCallback, openPreview } = params;
    const walletAddr = this.walletConnectorService.getActiveWalletAddress({
      blockchain: token.blockchain
    });
    if (!walletAddr) return;

    try {
      const preview$ = openPreview({
        steps: [
          {
            label: 'Private Transfer',
            showLoaderOnAction: true,
            action: async () => {
              const bigintAmount = BigInt(token.stringWeiAmount);
              const txHash = await this.revealService.unshield(
                token.address,
                bigintAmount.toString(),
                () => {},
                token.blockchain as RailgunSupportedChain,
                this.receiverCtrl.value
              );
              this.privateStatisticsService.saveAction(
                'TRANSFER',
                'RAILGUN',
                walletAddr,
                token.address,
                token.weiAmount.toFixed(),
                token.blockchain
              );
              this.windowService.setRevealAsset({
                ...balanceToken,
                amount: balanceToken.amount.minus(token.tokenAmount)
              });
              setTimeout(async () => {
                const wallet = await firstValueFrom(this.railgunFacade.railgunAccount$);
                this.railgunFacade.refreshBalances(
                  [wallet.id],
                  [token.blockchain as RailgunSupportedChain]
                );
              }, 10_000);
              return { txScannerUrl: getScannerUrl(token, txHash) };
            }
          },
          donePrivateStep()
        ],
        swapType: 'transfer',
        dstTokenAmount: token.tokenAmount.multipliedBy(1 - 0.0025).toFixed(),
        hideFeeInfo: true
      });

      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }

  readonly destroyRef = inject(DestroyRef);
}
