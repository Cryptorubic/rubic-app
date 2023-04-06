export interface ProviderPanelData {
  label: string;
  isSelected: boolean;
  hasError: boolean;
  loading: boolean;
  appearance: 'small' | 'normal';
  image?: string;
  showGas?: boolean;
}
