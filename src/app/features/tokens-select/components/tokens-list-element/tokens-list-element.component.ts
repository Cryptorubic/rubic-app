import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { DEFAULT_TOKEN_IMAGE } from 'src/app/shared/constants/tokens/DEFAULT_TOKEN_IMAGE';

@Component({
  selector: 'app-tokens-list-element',
  templateUrl: './tokens-list-element.component.html',
  styleUrls: ['./tokens-list-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensListElementComponent {
  /**
   * Token element.
   */
  @Input() token: TokenAmount;

  public readonly DEFAULT_TOKEN_IMAGE = DEFAULT_TOKEN_IMAGE;

  /**
   * Is iframe has horizontal view.
   */
  public readonly isHorizontalFrame$: Observable<boolean>;

  constructor(iframeService: IframeService, private readonly tokensService: TokensService) {
    this.isHorizontalFrame$ = iframeService.iframeAppearance$.pipe(
      map(appearance => appearance === 'horizontal')
    );
  }

  public onImageError($event: Event): void {
    this.tokensService.onTokenImageError($event, this.token);
  }

  /**
   * Makes token favorite or not favorite in the list.
   */
  public toggleFavorite(): void {
    if (!this.token.favorite) {
      this.tokensService.addFavoriteToken(this.token);
    } else {
      this.tokensService.removeFavoriteToken(this.token);
    }
  }
}
