import { TuiDialogContext } from '@taiga-ui/core';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { SwapFormInputControl } from '@app/features/swaps/core/services/swap-form-service/models/swap-form-controls';
import { FormGroup } from '@angular/forms';

export type TokensSelectComponentInput = {
  idPrefix: string;
  formType: 'from' | 'to';
  form: FormGroup<SwapFormInputControl>;
};

export type TokensSelectComponentContext = TuiDialogContext<
  AvailableTokenAmount,
  TokensSelectComponentInput
>;
