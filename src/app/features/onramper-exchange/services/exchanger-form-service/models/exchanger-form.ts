import BigNumber from 'bignumber.js';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { FormControl, FormGroup } from '@angular/forms';

export interface ExchangerFormInput {
  fromFiat: string | null;
  fromAmount: BigNumber | null;

  toToken: TokenAmount | null;
}

interface ExchangerFormInputControls {
  fromFiat: FormControl<string | null>;
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
