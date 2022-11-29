import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import ADDRESS_TYPE from '@shared/models/blockchain/address-type';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { DEFAULT_TOKEN_IMAGE } from '@shared/constants/tokens/default-token-image';
import { ExchangerFormService } from '@features/onramper-exchange/services/exchanger-form-service/exchanger-form.service';
import { TokensSelectorService } from '@features/onramper-exchange/components/onramper-exchanger/components/exchanger-form/components/tokens-selector/services/tokens-selector.service';

@Component({
  selector: 'app-select-token-button',
  templateUrl: './select-token-button.component.html',
  styleUrls: ['./select-token-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class SelectTokenButtonComponent {
  @Input() loading: boolean;

  public readonly DEFAULT_TOKEN_IMAGE = DEFAULT_TOKEN_IMAGE;

  public ADDRESS_TYPE = ADDRESS_TYPE;

  public toToken$ = this.exchangerFormService.toToken$;

  constructor(
    private readonly exchangerFormService: ExchangerFormService,
    private readonly tokensSelectorService: TokensSelectorService,
    private readonly tokensService: TokensService
  ) {}

  public openTokensSelector(): void {
    this.tokensSelectorService.showDialog().subscribe((selectedToken: TokenAmount) => {
      if (selectedToken) {
        this.exchangerFormService.input.patchValue({
          toToken: selectedToken
        });
      }
    });
  }

  public onImageError($event: Event): void {
    this.tokensService.onTokenImageError($event);
  }
}
