import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BlockchainName, compareAddresses, Token } from '@cryptorubic/core';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { RailgunRevealFacadeService } from '@features/privacy/providers/railgun/services/common/railgun-reveal-facade.service';
import { RailgunPrivateAssetsService } from '@features/privacy/providers/railgun/services/common/railgun-private-assets.service';
import { ToAssetsService } from '@features/trade/components/assets-selector/services/to-assets.service';
import { RevealService } from '@features/privacy/providers/railgun/services/reveal/reveal.service';
import { filter, firstValueFrom, map, startWith, takeUntil, tap } from 'rxjs';
import { PrivateEvent } from '@features/privacy/providers/shared-privacy-providers/models/private-event';
import { RailgunSupportedChain } from '@features/privacy/providers/railgun/constants/network-map';
import { RailgunFacadeService } from '@features/privacy/providers/railgun/services/railgun-facade.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { PrivateStatisticsService } from '@features/privacy/providers/shared-privacy-providers/services/private-statistics/private-statistics.service';
import { AuthService } from '@core/services/auth/auth.service';
import { PrivateActionButtonService } from '@features/privacy/providers/shared-privacy-providers/services/private-action-button/private-action-button.service';
import { RailgunPrivateActionButtonService } from '@features/privacy/providers/railgun/services/common/railgun-private-action-button.service';
import { RevealWindowService } from '@features/privacy/providers/shared-privacy-providers/services/reveal-window/reveal-window.service';
import { donePrivateStep } from '@features/privacy/providers/shared-privacy-providers/components/private-preview-swap/constants/done-private-step';
import { getScannerUrl } from '../../../privacycash/services/common/token-facades/utils/get-minimal-tokens-by-chain';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-railgun-reveal-page',
  templateUrl: './railgun-reveal-page.component.html',
  styleUrls: ['./railgun-reveal-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    RailgunPrivateAssetsService,
    { provide: ToAssetsService, useExisting: RailgunPrivateAssetsService },
    { provide: TokensFacadeService, useClass: RailgunRevealFacadeService },
    TuiDestroyService,
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

  private readonly authService = inject(AuthService);

  private readonly destroy$ = inject(TuiDestroyService);

  private readonly windowService = inject(RevealWindowService);

  private readonly actionButtonService = inject(PrivateActionButtonService);

  ngOnInit() {
    this.receiverCtrl.valueChanges
      .pipe(
        startWith(this.receiverCtrl.value),
        tap(address => {
          this.actionButtonService.setReceiverAddress(address);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
    this.railgunFacade.completedChains$
      .pipe(takeUntil(this.destroy$))
      .subscribe(chains => this.toAssetsService.setBlockchainList(chains));

    this.railgunFacade.balancesSnapshot$
      .pipe(
        filter(() => !!this.windowService.revealAsset?.address),
        map(shieldBalances => {
          const balances =
            shieldBalances[this.windowService.revealAsset?.blockchain as RailgunSupportedChain]
              ?.Spendable?.erc20Amounts || [];

          return balances.find(balance =>
            compareAddresses(balance.tokenAddress, this.windowService.revealAsset.address)
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(shieldBalance => {
        const revealAsset = this.windowService.revealAsset;

        this.windowService.setRevealAsset({
          ...revealAsset,
          amount: shieldBalance
            ? Token.fromWei(shieldBalance.amount.toString(), revealAsset.decimals)
            : new BigNumber(0)
        });
      });
  }

  public async reveal(params: PrivateEvent): Promise<void> {
    const { balanceToken, token, loadingCallback, openPreview } = params;
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
                this.authService.userAddress,
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
}
