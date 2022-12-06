import { FormGroup } from '@ngneat/reactive-forms';
import { TuiDialogContext } from '@taiga-ui/core';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { SwapFormInput } from '@features/swaps/features/swaps-form/models/swap-form';

export type TokensSelectComponentInput = {
  idPrefix: string;
  formType: 'from' | 'to';
  form: FormGroup<SwapFormInput>;
};

export type TokensSelectComponentContext = TuiDialogContext<
  AvailableTokenAmount,
  TokensSelectComponentInput
>;
