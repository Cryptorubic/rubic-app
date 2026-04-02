import { MinimalTokenWithBalanceWorker } from '@app/features/privacy/providers/privacycash/models/privacycash-tokens-facade-models';
import { MinimalToken } from '@app/shared/models/tokens/minimal-token';

export type PrivacycashInWorkerMsg =
  | {
      type: 'init';
      data: {
        signature: Uint8Array;
        localStorageData: Record<string, string>;
      };
    }
  | {
      type: 'getBalances';
      useCache: boolean;
      walletAddr: string;
      tokens: MinimalToken[];
    }
  | {
      type: 'stop';
    };

export type PrivacycashOutWorkerMsg =
  | {
      type: 'init';
    }
  | {
      type: 'getBalances';
      tokens: MinimalTokenWithBalanceWorker[];
    }
  | {
      type: 'stop';
    }
  | {
      type: 'localStorageData';
      localStorageData: Record<string, string>;
    };
