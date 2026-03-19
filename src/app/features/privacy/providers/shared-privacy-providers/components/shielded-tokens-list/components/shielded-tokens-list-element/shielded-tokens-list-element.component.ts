import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ShieldedBalanceToken } from '../../models/shielded-balance-token';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { DEFAULT_TOKEN_IMAGE } from '@app/shared/constants/tokens/default-token-image';
import { interval, map, Observable, startWith } from 'rxjs';
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

    this.countdown$ = interval(1000).pipe(
      startWith(0),
      map(() => {
        // @ts-ignore
        const delta = targetTime - Date.now();

        if (delta <= 0) {
          return 'Completed';
        }

        const totalSeconds = Math.floor(delta / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `Est. ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }),
      takeWhile(val => val !== 'Completed', true)
    );
  }
}
