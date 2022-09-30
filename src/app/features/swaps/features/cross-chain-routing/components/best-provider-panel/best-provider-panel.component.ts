import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input
} from '@angular/core';
import { SmartRouting } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/smart-routing.interface';
import { TuiDialogService } from '@taiga-ui/core';
import { CrossChainRoutingService } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/cross-chain-routing.service';
import { map } from 'rxjs/operators';
import { CalculatedProvider } from '@features/swaps/features/cross-chain-routing/models/calculated-provider';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';

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

  public expanded = false;

  // public contentHeight: string = 'auto';

  constructor(
    private readonly dialogService: TuiDialogService,
    private readonly crossChainRoutingService: CrossChainRoutingService,
    @Inject(WINDOW) private readonly window: RubicWindow,
    private readonly cdr: ChangeDetectorRef
  ) {}

  public toggleAccordion(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.expanded) {
      if ((event.target as HTMLElement).classList.contains('close')) {
        this.expanded = false;
      }
    } else {
      this.expanded = true;
    }
    this.cdr.detectChanges();
  }

  public handleSelection(): void {
    this.expanded = false;
    this.cdr.detectChanges();
  }

  public closeAccordion(): void {
    // this.expanded = true;
    this.cdr.detectChanges();
  }
}
