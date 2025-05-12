import { RubicAny } from '@app/shared/models/utility-types/rubic-any';

export class EvmWalletProviderStore {
  private static providers: Record<string, RubicAny> = {};

  public static setProvider(walletName: string, provider: RubicAny): void {
    EvmWalletProviderStore.providers = {
      ...EvmWalletProviderStore.providers,
      [walletName]: provider
    };
  }

  public static getProvider(walletName: string): RubicAny | undefined {
    return EvmWalletProviderStore.providers[walletName];
  }
}
