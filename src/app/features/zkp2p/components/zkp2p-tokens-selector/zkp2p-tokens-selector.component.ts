import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { Asset } from '@features/trade/models/asset';
import { AssetsSelectorConfig } from '@app/features/trade/components/assets-selector/models/assets-selector-layout';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { Zkp2pAssetsService } from '../../services/zkp2p-assets.service';
import { Zkp2pTokensFacadeService } from '../../services/zkp2p-tokens-facade.service';

@Component({
  selector: 'app-zkp2p-tokens-selector',
  templateUrl: './zkp2p-tokens-selector.component.html',
  styleUrls: ['./zkp2p-tokens-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: FromAssetsService, useClass: Zkp2pAssetsService },
    { provide: TokensFacadeService, useClass: Zkp2pTokensFacadeService }
  ]
})
export class Zkp2pTokensSelectorComponent {
  private readonly context = inject(POLYMORPHEUS_CONTEXT);

  public readonly assetsSelectorConfig: AssetsSelectorConfig;

  public readonly direction: 'from' | 'to';

  public readonly headerText = 'Select chain and token';

  constructor() {
    this.assetsSelectorConfig = this.context.data.assetsSelectorConfig;
    this.direction = this.context.data.formType ?? 'to';
  }

  public selectToken(value: Asset): void {
    this.context.completeWith(value);
  }

  public handleBack(): void {
    this.context.completeWith(null);
  }
}
