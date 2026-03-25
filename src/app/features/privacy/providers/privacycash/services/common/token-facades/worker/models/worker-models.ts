import { MinimalTokenWithBalance } from '@app/features/privacy/providers/privacycash/models/privacycash-tokens-facade-models';
import { MinimalToken } from '@app/shared/models/tokens/minimal-token';

export type PrivacycashInWorkerMsg =
  | {
      type: 'init';
      data: {
        signature: Uint8Array;
      };
    }
  | {
      type: 'getBalances';
      useCache: boolean;
      tokens: MinimalToken[];
    }
  | {
      type: 'stop';
    };

export type PrivacycashOurWorkerMsg =
  | {
      type: 'init';
      success: boolean;
    }
  | {
      type: 'getBalances';
      success: boolean;
      tokens: MinimalTokenWithBalance[];
    }
  | {
      type: 'stop';
      success: boolean;
    };
