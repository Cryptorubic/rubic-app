import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { SmartRouting } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/smart-routing.interface';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { ProvidersListComponent } from '@features/swaps/features/cross-chain-routing/components/providers-list/providers-list.component';
import { TuiDialogService } from '@taiga-ui/core';
import { CrossChainRoutingService } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/cross-chain-routing.service';
import { map } from 'rxjs/operators';
import { CalculatedProvider } from '@features/swaps/features/cross-chain-routing/models/calculated-provider';
import { ProvidersListHeaderComponent } from '@features/swaps/features/cross-chain-routing/components/providers-list-header/providers-list-header.component';

@Component({
  selector: 'app-best-provider-panel',
  templateUrl: './best-provider-panel.component.html',
  styleUrls: ['./best-provider-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BestProviderPanelComponent {
  @Input() public calculatedProvider: CalculatedProvider | null;

  @Input() public smartRouting: SmartRouting = null;

  public readonly calculatedProviders$ = this.crossChainRoutingService.allProviders$.pipe(
    map(providers => providers.data.filter(provider => Boolean(provider.trade)).length)
  );

  constructor(
    private readonly dialogService: TuiDialogService,
    private readonly crossChainRoutingService: CrossChainRoutingService
  ) {}

  public showProvidersList(): void {
    this.dialogService
      .open<boolean>(new PolymorpheusComponent(ProvidersListComponent), {
        size: 'm',
        header: new PolymorpheusComponent(ProvidersListHeaderComponent)
      })
      .subscribe();
  }
}
