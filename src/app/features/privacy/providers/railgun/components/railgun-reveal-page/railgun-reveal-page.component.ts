import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BlockchainName, TokenAmount } from '@cryptorubic/core';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { RailgunRevealFacadeService } from '@features/privacy/providers/railgun/services/common/railgun-reveal-facade.service';
import { RailgunPrivateAssetsService } from '@features/privacy/providers/railgun/services/common/railgun-private-assets.service';
import { ToAssetsService } from '@features/trade/components/assets-selector/services/to-assets.service';
import { RevealService } from '@features/privacy/providers/railgun/services/reveal/reveal.service';

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

  private readonly revealService: RevealService;

  public async reveal({
    token,
    loadingCallback
  }: {
    token: TokenAmount;
    loadingCallback: () => void;
  }): Promise<void> {
    try {
      const bigintAmount = BigInt(token.stringWeiAmount);
      await this.revealService.unshieldTokens(
        this.railgunId,
        token.address,
        bigintAmount.toString()
      );
    } finally {
      loadingCallback();
    }
  }
}
