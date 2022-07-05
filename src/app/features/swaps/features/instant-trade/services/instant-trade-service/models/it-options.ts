export interface ItOptions {
  onConfirm?: (hash: string) => void;
  onApprove?: (hash: string | null) => void;
}
