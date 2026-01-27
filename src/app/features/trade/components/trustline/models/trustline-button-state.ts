export interface TrustlineButtonState {
  disabled: boolean;
  action?: () => Promise<void>;
  label: string;
}
