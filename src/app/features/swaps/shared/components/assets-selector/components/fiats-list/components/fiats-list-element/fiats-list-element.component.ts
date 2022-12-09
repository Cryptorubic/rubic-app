import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input
} from '@angular/core';
import { TokensService } from '@core/services/tokens/tokens.service';
import { DEFAULT_TOKEN_IMAGE } from '@shared/constants/tokens/default-token-image';
import { AuthService } from '@core/services/auth/auth.service';
import { ErrorsService } from '@core/errors/errors.service';
import { NAVIGATOR } from '@ng-web-apis/common';
import { FiatAsset } from '@shared/models/fiats/fiat-asset';

@Component({
  selector: 'app-fiats-list-element',
  templateUrl: './fiats-list-element.component.html',
  styleUrls: ['./fiats-list-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FiatsListElementComponent {
  @Input() fiat: FiatAsset;

  public readonly DEFAULT_TOKEN_IMAGE = DEFAULT_TOKEN_IMAGE;

  constructor(
    private readonly tokensService: TokensService,
    private readonly cdr: ChangeDetectorRef,
    private readonly errorsService: ErrorsService,
    private readonly authService: AuthService,
    @Inject(NAVIGATOR) private readonly navigator: Navigator
  ) {}
}
