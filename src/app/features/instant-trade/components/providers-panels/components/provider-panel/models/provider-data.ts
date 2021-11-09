export interface ProviderData {
  /**
   * Provider name.
   */
  name: string;

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
