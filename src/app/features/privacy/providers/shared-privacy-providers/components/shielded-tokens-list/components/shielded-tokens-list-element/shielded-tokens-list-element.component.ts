import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ShieldedBalanceToken } from '../../models/shielded-balance-token';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { DEFAULT_TOKEN_IMAGE } from '@app/shared/constants/tokens/default-token-image';
import { map, Observable, timer } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-shielded-tokens-list-element',
  templateUrl: './shielded-tokens-list-element.component.html',
  styleUrls: ['./shielded-tokens-list-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShieldedTokensListElementComponent implements OnInit {
  @Input({ required: true }) token: ShieldedBalanceToken;

  public countdown$: Observable<string>;

  public readonly DEFAULT_TOKEN_IMAGE = DEFAULT_TOKEN_IMAGE;

  public onImageError($event: Event): void {
    TokensFacadeService.onTokenImageError($event);
  }

  public ngOnInit(): void {
    const targetTime = this.token.shieldingCompleteAtMs;

    this.countdown$ = timer(0, 1000).pipe(
      map(() => targetTime - Date.now()),
      map(delta => {
        if (delta <= 0) return 'Completed';

        const m = String(Math.floor(delta / 60000)).padStart(2, '0');
        const s = String(Math.floor((delta % 60000) / 1000)).padStart(2, '0');

        return `Est. ${m}:${s}`;
      }),
      takeWhile(val => val !== 'Completed', true)
    );
  }
}
