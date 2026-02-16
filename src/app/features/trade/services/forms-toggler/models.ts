export const MAIN_FORM_TYPE = {
  SWAP_FORM: 'swapForm',
  PRIVATE_SWAP_FORM: 'privateSwapForm',
  DEPOSIT: 'deposit',
  WITHDRAW: 'withdraw',
  TRANSFER: 'transfer'
} as const;

export type MainFormType = (typeof MAIN_FORM_TYPE)[keyof typeof MAIN_FORM_TYPE];
