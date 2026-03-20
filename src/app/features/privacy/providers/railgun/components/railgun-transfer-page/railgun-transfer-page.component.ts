import { ChangeDetectionStrategy, Component, inject, Injector, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BlockchainName } from '@cryptorubic/core';
import { BehaviorSubject, firstValueFrom, startWith, takeUntil, tap } from 'rxjs';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import BigNumber from 'bignumber.js';
import { RevealService } from '@features/privacy/providers/railgun/services/reveal/reveal.service';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { RailgunRevealFacadeService } from '@features/privacy/providers/railgun/services/common/railgun-reveal-facade.service';
import { RailgunPrivateAssetsService } from '@features/privacy/providers/railgun/services/common/railgun-private-assets.service';
import { ToAssetsService } from '@features/trade/components/assets-selector/services/to-assets.service';
import { PrivateModalsService } from '@features/privacy/providers/shared-privacy-providers/services/private-modals/private-modals.service';
import { PrivateEvent } from '@features/privacy/providers/shared-privacy-providers/models/private-event';
import { RailgunTransferService } from '@features/privacy/providers/railgun/services/transfer/railgun-transfer.service';

import { NotificationsService } from '@core/services/notifications/notifications.service';
import { RailgunSupportedChain } from '@features/privacy/providers/railgun/constants/network-map';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { PrivateActionButtonService } from '@features/privacy/providers/shared-privacy-providers/services/private-action-button/private-action-button.service';
import { RailgunFacadeService } from '@features/privacy/providers/railgun/services/railgun-facade.service';

@Component({
  selector: 'app-railgun-transfer-page',
  templateUrl: './railgun-transfer-page.component.html',
  styleUrls: ['./railgun-transfer-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: ToAssetsService, useClass: RailgunPrivateAssetsService },
    { provide: TokensFacadeService, useClass: RailgunRevealFacadeService },
    TuiDestroyService
  ]
})
export class RailgunTransferPageComponent implements OnInit {
  private readonly toAssetsService = inject(ToAssetsService) as RailgunPrivateAssetsService;

  public readonly receiverCtrl = new FormControl<string>('');

  private readonly notificationService = inject(NotificationsService);

  private readonly transferService = inject(RailgunTransferService);

  private readonly _displayReceiver$ = new BehaviorSubject<boolean>(false);

  public readonly displayReceiver$ = this._displayReceiver$.asObservable();

  private readonly actionButtonService = inject(PrivateActionButtonService);

  private readonly destroy$ = inject(TuiDestroyService);

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

  private readonly _transferAsset$ = new BehaviorSubject<BalanceToken | null>(null);

  public readonly transferAsset$ = this._transferAsset$.asObservable();

  private readonly _transferAmount$ = new BehaviorSubject<{
    visibleValue: string;
    actualValue: BigNumber;
  } | null>(null);

  public readonly transferAmount$ = this._transferAmount$.asObservable();

  private readonly injector = inject(Injector);

  private readonly modalService = inject(PrivateModalsService);

  private readonly revealService = inject(RevealService);

  private readonly _loading$ = new BehaviorSubject<boolean>(false);

  public readonly loading$ = this._loading$.asObservable();

  public railgunFacade = inject(RailgunFacadeService);

  ngOnInit(): void {
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
  }

  public openSelector(): void {
    this.modalService
      .openPrivateTokensModal(this.injector, 'to')
      .subscribe((selectedToken: BalanceToken) => {
        this._transferAsset$.next(selectedToken);
      });
  }

  public updateInputValue(value: { visibleValue: string; actualValue: BigNumber }): void {
    this._transferAmount$.next(value);
  }

  public handleMaxButton(): void {}

  public async transfer({ token, loadingCallback, openPreview }: PrivateEvent): Promise<void> {
    try {
      const preview$ = openPreview({
        steps: [
          {
            label: 'Transfer tokens',
            action: async () => {
              this.notificationService.show(
                'Transfer in progress. This may take a moment. Please keep Rubic App open',
                {
                  status: 'info',
                  autoClose: 10_000,
                  data: null,
                  icon: '',
                  defaultAutoCloseTime: 0
                }
              );
              await this.transferService.transferTokens(
                token.address,
                token.stringWeiAmount,
                this.receiverCtrl.value,
                () => {},
                token.blockchain as RailgunSupportedChain
              );
              this.notificationService.show('Transfer successful.', {
                status: 'success',
                autoClose: 5_000,
                data: null,
                icon: '',
                defaultAutoCloseTime: 0
              });
              setTimeout(async () => {
                const wallet = await firstValueFrom(this.railgunFacade.railgunAccount$);
                this.railgunFacade.refreshBalances(
                  [wallet.id],
                  [token.blockchain as RailgunSupportedChain]
                );
              }, 10_000);
              setTimeout(async () => {
                const wallet = await firstValueFrom(this.railgunFacade.railgunAccount$);
                this.railgunFacade.refreshBalances(
                  [wallet.id],
                  [token.blockchain as RailgunSupportedChain]
                );
              }, 70_000);
            }
          }
        ],
        swapType: 'transfer',
        dstTokenAmount: token.tokenAmount.toFixed()
      });

      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }

  public toggleReceiver(): void {
    this._displayReceiver$.next(!this._displayReceiver$.value);
  }
}
