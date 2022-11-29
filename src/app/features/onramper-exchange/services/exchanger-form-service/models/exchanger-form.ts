import BigNumber from 'bignumber.js';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { FormControl, FormGroup } from '@angular/forms';
import { FiatItem } from '@features/onramper-exchange/components/onramper-exchanger/components/exchanger-form/components/fiat-amount-input/components/fiats-selector/models/fiat-item';

export interface ExchangerFormInput {
  fromFiat: FiatItem | null;
  fromAmount: BigNumber | null;

  toToken: TokenAmount | null;
}

interface ExchangerFormInputControls {
  fromFiat: FormControl<FiatItem | null>;
  fromAmount: FormControl<BigNumber | null>;

  toToken: FormControl<TokenAmount | null>;
}

export interface ExchangerFormOutput {
  toAmount: BigNumber | null;
}

interface ExchangerFormOutputControls {
  toAmount: FormControl<BigNumber | null>;
}

export interface ExchangerForm {
  input: FormGroup<ExchangerFormInputControls>;
  output: FormGroup<ExchangerFormOutputControls>;
}
