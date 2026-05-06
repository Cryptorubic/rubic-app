import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { HeaderStore } from '@core/header/services/header.store';
import { filter, map, switchMap } from 'rxjs/operators';
import { combineLatestWith, Observable } from 'rxjs';
import { compareTokens } from '@shared/utils/utils';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { FromAssetsService } from '../assets-selector/services/from-assets.service';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';

@Component({
  selector: 'app-user-balance-container',
  templateUrl: './user-balance-container.component.html',
  styleUrls: ['./user-balance-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class UserBalanceContainerComponent {
  @Input() set fromToken$(fromToken$: Observable<BalanceToken>) {
    this.token$ = fromToken$.pipe(
      combineLatestWith(
        this.tokensFacade.tokens$,
        this.fromAssetsService.assetListType$.pipe(
          switchMap(type => this.tokensFacade.getTokensBasedOnType(type).balanceLoading$),
          filter(loading => !loading)
        )
      ),
      filter(() => !!this.tokensFacade.tokens),
      map(([fromToken]) => {
        const foundToken = this.tokensFacade.tokens.find(token => compareTokens(fromToken, token));
        return { ...foundToken, amount: fromToken?.amount };
      })
    );
  }

  public token$: Observable<BalanceToken>;

  @Input() public hide: 'maxButton' | 'balance';

  @Output() public maxButtonClickEvent = new EventEmitter<void>();

  public readonly isMobile = this.headerStore.isMobile;

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly tokensFacade: TokensFacadeService,
    private readonly fromAssetsService: FromAssetsService
  ) {}
}
