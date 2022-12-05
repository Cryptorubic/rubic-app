import { FormGroup } from '@ngneat/reactive-forms';
import { ISwapFormInput } from '@shared/models/swaps/swap-form';
import { TuiDialogContext } from '@taiga-ui/core';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';

export type TokensSelectComponentInput = {
  idPrefix: string;
  formType: 'from' | 'to';
  form: FormGroup<ISwapFormInput>;
};

export type TokensSelectComponentContext = TuiDialogContext<
  AvailableTokenAmount,
  TokensSelectComponentInput
>;
