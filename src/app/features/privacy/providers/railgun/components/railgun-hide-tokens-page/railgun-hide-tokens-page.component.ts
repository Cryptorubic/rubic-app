import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { HideService } from '@features/privacy/providers/railgun/services/hide/hide.service';
import { BlockchainName, TokenAmount } from '@cryptorubic/core';
import { FromAssetsService } from '@features/trade/components/assets-selector/services/from-assets.service';
import { RailgunPublicAssetsService } from '@features/privacy/providers/railgun/services/common/railgun-public-assets.service';

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

  private readonly hideService = inject(HideService);

  public async hide({
    token,
    loadingCallback
  }: {
    token: TokenAmount;
    loadingCallback: () => void;
  }): Promise<void> {
    try {
      const bigintAmount = BigInt(token.stringWeiAmount);
      await this.hideService.shieldERC20(this.railgunWalletAddress, token.address, bigintAmount);
    } finally {
      loadingCallback();
    }
  }
}
