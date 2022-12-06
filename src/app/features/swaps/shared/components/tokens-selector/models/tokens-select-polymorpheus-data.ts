import { TuiDialogContext } from '@taiga-ui/core';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';

export type TokensSelectComponentInput = {
  idPrefix: string;
  formType: 'from' | 'to';
};

export type TokensSelectComponentContext = TuiDialogContext<
  AvailableTokenAmount,
  TokensSelectComponentInput
>;
