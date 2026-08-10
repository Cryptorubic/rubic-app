export const MAIN_FORM_TYPE = {
  SWAP: 'swap',
  TRANSFER: 'transfer'
} as const;

export type MainFormType = (typeof MAIN_FORM_TYPE)[keyof typeof MAIN_FORM_TYPE];
