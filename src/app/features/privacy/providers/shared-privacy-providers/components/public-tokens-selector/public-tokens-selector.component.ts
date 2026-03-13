import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { Asset } from '@features/trade/models/asset';

@Component({
  selector: 'app-private-tokens-selector',
  templateUrl: './public-tokens-selector.component.html',
  styleUrls: ['./public-tokens-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublicTokensSelectorComponent {
  private readonly context = inject(POLYMORPHEUS_CONTEXT);

  public selectToken(value: Asset): void {
    this.context.completeWith(value);
  }

  public handleBack(): void {
    this.context.completeWith(null);
  }
}
