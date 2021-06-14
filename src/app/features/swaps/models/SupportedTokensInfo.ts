import { BLOCKCHAIN_NAME } from '../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { IToken } from '../../../shared/models/tokens/IToken';

export type SupportedTokensInfo = {
  [fromBlockchain in BLOCKCHAIN_NAME]: {
    [toBlockchain in BLOCKCHAIN_NAME]: IToken[];
  };
};
