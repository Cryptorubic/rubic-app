import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-tokens-list-element',
  templateUrl: './tokens-list-element.component.html',
  styleUrls: ['./tokens-list-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensListElementComponent {
  @Input() token: TokenAmount;

  public readonly defaultImage = 'assets/images/icons/coins/empty.svg';

  public readonly isHorizontalFrame$: Observable<boolean>;

  constructor(iframeService: IframeService) {
    this.isHorizontalFrame$ = iframeService.iframeAppearance$.pipe(
      map(appearance => appearance === 'horizontal')
    );
  }

  public onImageError($event: Event) {
    const target = $event.target as HTMLImageElement;
    if (target.src !== this.defaultImage) {
      target.src = this.defaultImage;
    }
  }
}
