import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BlockchainName } from '@cryptorubic/core';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { RailgunRevealFacadeService } from '@features/privacy/providers/railgun/services/common/railgun-reveal-facade.service';
import { RailgunPrivateAssetsService } from '@features/privacy/providers/railgun/services/common/railgun-private-assets.service';
import { ToAssetsService } from '@features/trade/components/assets-selector/services/to-assets.service';
import { RevealService } from '@features/privacy/providers/railgun/services/reveal/reveal.service';
import { firstValueFrom, takeUntil } from 'rxjs';
import { PrivateEvent } from '@features/privacy/providers/shared-privacy-providers/models/private-event';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { RailgunSupportedChain } from '@features/privacy/providers/railgun/constants/network-map';
import { RailgunFacadeService } from '@features/privacy/providers/railgun/services/railgun-facade.service';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Component({
  selector: 'app-railgun-reveal-page',
  templateUrl: './railgun-reveal-page.component.html',
  styleUrls: ['./railgun-reveal-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: ToAssetsService, useClass: RailgunPrivateAssetsService },
    { provide: TokensFacadeService, useClass: RailgunRevealFacadeService },
    TuiDestroyService
  ]
})
export class RailgunRevealPageComponent {
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

  public readonly receiverCtrl = new FormControl<string>('');

  private readonly revealService = inject(RevealService);

  private readonly notificationService = inject(NotificationsService);

  private readonly railgunFacade = inject(RailgunFacadeService);

  private readonly toAssetsService = inject(ToAssetsService) as RailgunPrivateAssetsService;

  private readonly destroy$ = inject(TuiDestroyService);

  ngOnInit() {
    this.railgunFacade.completedChains$
      .pipe(takeUntil(this.destroy$))
      .subscribe(chains => this.toAssetsService.setBlockchainList(chains));
  }

  public async reveal(params: PrivateEvent): Promise<void> {
    const { token, loadingCallback, openPreview } = params;
    try {
      const preview$ = openPreview({
        steps: [
          {
            label: 'Reveal Tokens',
            action: async () => {
              const bigintAmount = BigInt(token.stringWeiAmount);
              this.notificationService.show('This may take a moment. Please keep Rubic App open', {
                status: 'info',
                autoClose: 10_000,
                data: null,
                icon: '',
                defaultAutoCloseTime: 0
              });
              await this.revealService.unshield(
                token.address,
                bigintAmount.toString(),
                () => {},
                token.blockchain as RailgunSupportedChain
              );
              this.notificationService.show(
                'Tokens were successfully unshielded to public wallet',
                {
                  status: 'success',
                  autoClose: 5_000,
                  data: null,
                  icon: '',
                  defaultAutoCloseTime: 0
                }
              );
            }
          }
        ]
      });

      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }
}
