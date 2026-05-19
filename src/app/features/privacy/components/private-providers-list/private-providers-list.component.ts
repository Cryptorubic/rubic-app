import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  Optional,
  Output
} from '@angular/core';
import { PrivateProviderInfoUI } from '../../models/provider-info';
import { Router } from '@angular/router';
import { PolymorpheusInput } from '@app/shared/decorators/polymorpheus-input';
import { PrivateTradeType } from '../../constants/private-trade-types';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { SwapsFormService } from '@app/features/trade/services/swaps-form/swaps-form.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';

@Component({
  selector: 'app-private-providers-list',
  templateUrl: './private-providers-list.component.html',
  styleUrls: ['./private-providers-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivateProvidersListComponent {
  @PolymorpheusInput()
  @Input({ required: true })
  public readonly isModal: boolean = this.context?.data?.isModal || false;

  @PolymorpheusInput()
  @Input({ required: true })
  public readonly states: PrivateProviderInfoUI[] = this.context?.data?.states || [];

  @PolymorpheusInput()
  @Input({ required: true })
  public readonly selectedTradeType: PrivateTradeType = this.context?.data?.selectedTradeType;

  @Output() readonly tradeSelected = new EventEmitter<PrivateTradeType>();

  public readonly toToken$ = this.swapsFormService.toToken$;

  public readonly nativeToken$ = this.tokensFacade.nativeToken$;

  constructor(
    @Optional()
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      PrivateTradeType,
      {
        states: PrivateProviderInfoUI[];
        selectedTradeType: PrivateTradeType;
        isModal: boolean;
        shortedInfo: boolean;
        noRoutes: boolean;
      }
    >,
    private readonly swapsFormService: SwapsFormService,
    private readonly tokensFacade: TokensFacadeService,
    private readonly router: Router
  ) {}

  public handleTradeSelection(providerInfo: PrivateProviderInfoUI): void {
    if (this.isModal) {
      this.context.completeWith(providerInfo.name);
    } else {
      this.tradeSelected.emit(providerInfo.name);
    }
    // this.router.navigate(['/' + ROUTE_PATH.PRIVATE_SWAPS + '/' + providerInfo.url], {
    //   queryParamsHandling: 'merge'
    // });
  }
}
