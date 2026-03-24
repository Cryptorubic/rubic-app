import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { Asset } from '@features/trade/models/asset';
import { AssetsSelectorConfig } from '@app/features/trade/components/assets-selector/models/assets-selector-layout';

@Component({
  selector: 'app-public-tokens-selector',
  templateUrl: './public-tokens-selector.component.html',
  styleUrls: ['./public-tokens-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublicTokensSelectorComponent {
  private readonly context = inject(POLYMORPHEUS_CONTEXT);

  public readonly assetsSelectorConfig: AssetsSelectorConfig;

  public readonly direction: 'from' | 'to';

  constructor() {
    this.direction = this.context.data.formType ?? 'from';
    this.assetsSelectorConfig = this.context.data.assetsSelectorConfig;
  }

  public selectToken(value: Asset): void {
    this.context.completeWith(value);
  }

  public handleBack(): void {
    this.context.completeWith(null);
  }
}
