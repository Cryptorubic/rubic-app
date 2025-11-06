/**
 * Describes universal contracts addresses.
 */
export interface UniversalContract {
  /**
   * Provider router contract address.
   */
  readonly providerRouter: string;

  /**
   * Provider gateway contract address.
   */
  readonly providerGateway: string;

  /**
   * Rubic router contract address.
   */
  readonly rubicRouter: string;
}
