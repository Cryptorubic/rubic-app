import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { QueryParamsService } from '@app/core/services/query-params/query-params.service';
import { Asset } from '@app/features/trade/models/asset';
import { FormType } from '@app/features/trade/models/form-type';
import { TradePageService } from '@app/features/trade/services/trade-page/trade-page.service';
import { PrivateAction } from '../../constants/private-mode-tx-types';
import { Observable, map, of } from 'rxjs';
import { PrivateProviderInfoUI } from '../../models/provider-info';
import { PRIVATE_PROVIDERS_UI } from '../../constants/private-providers-ui';
import { animate, style, transition, trigger } from '@angular/animations';
import { PrivateTradeType } from '../../constants/private-trade-types';
import { PrivateActivityItem, PrivateActivityStorageItem } from '../../models/activity-item';
import { PRIVATE_PROVIDERS_ICONS } from '../../constants/private-providers-icons';
import { PrivacyAuthService } from '../../services/privacy-auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PRIVATE_MODE_URLS } from '@features/privacy/models/routes';

const FAKE_ACTIVITY: PrivateActivityStorageItem[] = [
  { providerName: 'HINKAL', type: 'swap' },
  { providerName: 'ZAMA', type: 'transfer' },
  { providerName: 'HINKAL', type: 'transfer' },
  { providerName: 'RAILGUN', type: 'swap' }
];

@Component({
  selector: 'app-privacy-page-view',
  templateUrl: './privacy-page-view.component.html',
  styleUrls: ['./privacy-page-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('inOutAnimation', [
      transition(':enter', [
        style({ opacity: 0, scale: 0 }),
        animate('0.25s ease-in-out', style({ opacity: 1, scale: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 0.5, width: '360px', scale: 1 }),
        animate('0.25s ease-in-out', style({ opacity: 0, width: 0, scale: 0 }))
      ])
    ])
  ]
})
export class PrivacyPageViewComponent {
  // @TODO_1712 фильтровать провайдеров при изменении таба/токенов/сетей/количества
  public readonly privateProviders$: Observable<PrivateProviderInfoUI[]> = of(PRIVATE_PROVIDERS_UI);

  // @TODO_1712 использовать реальную активность из локал стора
  public readonly lastActivity$: Observable<PrivateActivityItem[]> = of(FAKE_ACTIVITY).pipe(
    map(activity =>
      activity.slice(-4).map(el => ({ ...el, icon: PRIVATE_PROVIDERS_ICONS[el.providerName] }))
    )
  );

  public readonly selectedTradeType$ = this.privateProviders$.pipe(map(providers => providers[0]));

  public readonly formContent$ = this.tradePageService.formContent$;

  public readonly useLargeIframe = this.queryParamsService.useLargeIframe;

  private readonly router = inject(Router);

  private readonly activatedRoute = inject(ActivatedRoute);

  constructor(
    private readonly tradePageService: TradePageService,
    private readonly queryParamsService: QueryParamsService,
    private readonly privacyAuthService: PrivacyAuthService
  ) {}

  public handleActionSelected(value: string): void {
    const action = value as PrivateAction;
    console.debug('[PrivacyPageViewComponent_handleActionSelected] action selected', action);
  }

  public handleTokenSelect(asset: Asset, formType: FormType): void {
    console.debug('[PrivacyPageViewComponent_handleTokenSelect] token selected', {
      asset,
      formType
    });
    // @TODO_1712 патчить значения в форму private свапов
  }

  public async selectProvider(tradeType: PrivateTradeType): Promise<void> {
    console.debug('[PrivacyPageViewComponent_selectProvider] provider selected', { tradeType });
    // @TODO_1712 переадресовывать на урл провайдера
  }

  public async handleLastActivityClicked(activityItem: PrivateActivityItem): Promise<void> {
    const url = PRIVATE_MODE_URLS[activityItem.providerName as PrivateTradeType];
    await this.router.navigate([url], { relativeTo: this.activatedRoute });
  }
}
