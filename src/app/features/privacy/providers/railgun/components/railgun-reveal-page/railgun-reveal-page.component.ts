import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BlockchainName } from '@cryptorubic/core';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { RailgunRevealFacadeService } from '@features/privacy/providers/railgun/services/common/railgun-reveal-facade.service';
import { RailgunPrivateAssetsService } from '@features/privacy/providers/railgun/services/common/railgun-private-assets.service';
import { ToAssetsService } from '@features/trade/components/assets-selector/services/to-assets.service';
import { RevealService } from '@features/privacy/providers/railgun/services/reveal/reveal.service';
import { firstValueFrom } from 'rxjs';
import { PrivateEvent } from '@features/privacy/providers/shared-privacy-providers/models/private-event';
import { NotificationsService } from '@core/services/notifications/notifications.service';

@Component({
  selector: 'app-railgun-reveal-page',
  templateUrl: './railgun-reveal-page.component.html',
  styleUrls: ['./railgun-reveal-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: ToAssetsService, useClass: RailgunPrivateAssetsService },
    { provide: TokensFacadeService, useClass: RailgunRevealFacadeService }
  ]
})
export class RailgunRevealPageComponent {
  @Input({ required: true }) public readonly railgunId: string;

  @Input({ required: true }) balances:
    | {
        address: string;
        amount: string;
        blockchain: BlockchainName;
      }[]
    | null;

  public readonly receiverCtrl = new FormControl<string>('');

  private readonly revealService = inject(RevealService);

  private readonly notificationService = inject(NotificationsService);

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
              await this.revealService.unshieldTokens(
                token.address,
                bigintAmount.toString(),
                () => {},
                token.blockchain
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
