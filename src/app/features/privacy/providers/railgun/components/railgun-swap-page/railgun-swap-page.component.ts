import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output
} from '@angular/core';
import { BlockchainName, TokenAmount } from '@cryptorubic/core';
import { PrivateSwapService } from '@features/privacy/providers/railgun/services/private-swap/private-swap.service';
import { RailgunWalletInfo } from '@railgun-community/shared-models';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { FromAssetsService } from '@features/trade/components/assets-selector/services/from-assets.service';
import { RailgunPrivateAssetsService } from '@features/privacy/providers/railgun/services/common/railgun-private-assets.service';
import { ToAssetsService } from '@features/trade/components/assets-selector/services/to-assets.service';
import { RailgunTokensFacadeService } from '@features/privacy/providers/railgun/services/common/railgun-swap-tokens-facade.service';

@Component({
  selector: 'app-railgun-swap-page',
  templateUrl: './railgun-swap-page.component.html',
  styleUrls: ['./railgun-swap-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: TokensFacadeService, useClass: RailgunTokensFacadeService },
    { provide: FromAssetsService, useClass: RailgunPrivateAssetsService },
    { provide: ToAssetsService, useClass: RailgunPrivateAssetsService }
  ]
})
export class RailgunSwapPageComponent {
  @Input({ required: true }) public readonly railgunWalletInfo: RailgunWalletInfo;

  @Input({ required: true }) public readonly balances:
    | {
        address: string;
        amount: string;
        blockchain: BlockchainName;
      }[]
    | null;

  @Output() public readonly handleSwap = new EventEmitter<{
    from: TokenAmount;
    to: TokenAmount;
    loadingCallback: () => void;
  }>();

  private readonly swapService = inject(PrivateSwapService);

  public async swap(value: {
    from: TokenAmount;
    to: TokenAmount;
    loadingCallback: () => void;
  }): Promise<void> {
    const { from, to, loadingCallback } = value;
    try {
      await this.swapService.crossContractCall(
        this.railgunWalletInfo,
        from.address,
        from.stringWeiAmount,
        to.address
      );
    } finally {
      loadingCallback();
    }
  }
}
