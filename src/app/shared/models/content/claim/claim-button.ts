export type ButtonLabel =
  | 'login'
  | 'emptyError'
  | 'wrongAddressError'
  | 'changeNetwork'
  | 'claim'
  | 'stake'
  | 'claimed'
  | 'staked'
  | 'incorrectAddressError'
  | 'notParticipant'
  | 'closed'
  | 'soon'
  | 'expired';

export interface ButtonState {
  label: ButtonLabel;
  translation: string;
  isError: boolean;
}
