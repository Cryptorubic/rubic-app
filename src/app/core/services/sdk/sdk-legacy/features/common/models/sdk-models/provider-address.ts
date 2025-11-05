import { WalletProvider } from './wallet-provider';

export type ProviderAddress = Partial<
    Record<
        keyof WalletProvider,
        {
            crossChain?: string;
            onChain?: string;
        }
    >
>;
