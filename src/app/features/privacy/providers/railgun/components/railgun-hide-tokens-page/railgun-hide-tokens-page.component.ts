import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HideService } from '@features/privacy/providers/railgun/services/hide/hide.service';
import { BlockchainName } from '@cryptorubic/core';
import { FromAssetsService } from '@features/trade/components/assets-selector/services/from-assets.service';
import { RailgunPublicAssetsService } from '@features/privacy/providers/railgun/services/common/railgun-public-assets.service';
import { PrivateEvent } from '@features/privacy/providers/shared-privacy-providers/models/private-event';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { firstValueFrom } from 'rxjs';
import { fromRubicToPrivateChainMap } from '@features/privacy/providers/railgun/constants/network-map';

@Component({
  selector: 'app-railgun-hide-tokens-page',
  templateUrl: './railgun-hide-tokens-page.component.html',
  styleUrls: ['./railgun-hide-tokens-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: FromAssetsService, useClass: RailgunPublicAssetsService }]
})
export class RailgunHideTokensPageComponent {
  @Input({ required: true }) public readonly railgunWalletAddress: string;

  @Input({ required: true }) public readonly pendingBalances:
    | {
        address: string;
        amount: string;
        blockchain: BlockchainName;
      }[]
    | null;

  public readonly receiverCtrl = new FormControl<string>('');

  private readonly hideService = inject(HideService);

  private readonly notificationService = inject(NotificationsService);

  public async hide({ token, loadingCallback, openPreview }: PrivateEvent): Promise<void> {
    // const gasInfo: AppGasData = { amount, amountInUsd, symbol: token.symbol };
    try {
      const preview$ = openPreview({
        steps: [
          {
            label: 'Hide Tokens',
            action: async () => {
              const bigintAmount = BigInt(token.stringWeiAmount);
              await this.hideService.shieldERC20(
                this.railgunWalletAddress,
                token.address,
                bigintAmount,
                {
                  network: fromRubicToPrivateChainMap[token.blockchain]
                }
              );
              this.notificationService.show(
                'Waiting for your Private Proof of Innocence. Estimated time 1 hour. Come back soon.',
                {
                  status: 'info',
                  autoClose: 15_000,
                  data: null,
                  icon: '',
                  defaultAutoCloseTime: 0
                }
              );
            }
          }
        ],
        dstTokenAmount: token.tokenAmount.multipliedBy(1 - 0.0025).toFixed(),
        swapTime: '1 hour'
      });
      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }

  private notifyHideInProgress(): void {}
}
