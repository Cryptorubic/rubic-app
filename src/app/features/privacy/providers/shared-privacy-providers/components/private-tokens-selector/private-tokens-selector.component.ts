import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { Asset } from '@features/trade/models/asset';
import { AssetsSelectorConfig } from '@app/features/trade/components/assets-selector/models/assets-selector-layout';

@Component({
  selector: 'app-private-tokens-selector',
  templateUrl: './private-tokens-selector.component.html',
  styleUrls: ['./private-tokens-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class PrivateTokensSelectorComponent {
  private readonly context = inject(POLYMORPHEUS_CONTEXT);

  public readonly assetsSelectorConfig: AssetsSelectorConfig;

  public readonly direction: 'from' | 'to';

  public readonly headerText = 'Select chain and token from private balance';

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
