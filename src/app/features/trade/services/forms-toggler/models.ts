export const MAIN_FORM_TYPE = {
  SWAP_FORM: 'swapForm'
} as const;

export type MainFormType = (typeof MAIN_FORM_TYPE)[keyof typeof MAIN_FORM_TYPE];
