export interface ProviderData {
  /**
   * Provider name.
   */
  name: string;
  /**
   * Is provider has best rate.
   */
  isBestRate: boolean;
  /**
   * Is provider active.
   */
  isActive: boolean;
  /**
   * Is provider has error.
   */
  hasError: boolean;

  loading: boolean;

  appearance: 'small' | 'normal';
}
