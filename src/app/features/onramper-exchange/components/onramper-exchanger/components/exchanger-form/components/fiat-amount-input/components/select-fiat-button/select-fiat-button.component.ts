import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { ExchangerFormService } from '@features/onramper-exchange/services/exchanger-form-service/exchanger-form.service';
import { FiatsSelectorService } from '@features/onramper-exchange/components/onramper-exchanger/components/exchanger-form/components/fiat-amount-input/components/fiats-selector/services/fiats-selector.service';
import { FiatItem } from '@features/onramper-exchange/components/onramper-exchanger/components/exchanger-form/components/fiat-amount-input/components/fiats-selector/models/fiat-item';
import { DEFAULT_TOKEN_IMAGE } from '@shared/constants/tokens/default-token-image';

@Component({
  selector: 'app-select-fiat-button',
  templateUrl: './select-fiat-button.component.html',
  styleUrls: ['./select-fiat-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class SelectFiatButtonComponent {
  public readonly DEFAULT_TOKEN_IMAGE = DEFAULT_TOKEN_IMAGE;

  public fromFiat$ = this.exchangerFormService.fromFiat$;

  constructor(
    private readonly exchangerFormService: ExchangerFormService,
    private readonly fiatsSelectorService: FiatsSelectorService
  ) {}

  public openFiatSelector(): void {
    this.fiatsSelectorService.showDialog().subscribe((selectedFiat: FiatItem) => {
      if (selectedFiat) {
        this.exchangerFormService.input.patchValue({
          fromFiat: selectedFiat
        });
      }
    });
  }
}
