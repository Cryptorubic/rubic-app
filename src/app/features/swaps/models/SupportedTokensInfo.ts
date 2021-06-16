import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';

export type SupportedTokensInfo = {
  [fromBlockchain in BLOCKCHAIN_NAME]: {
    [toBlockchain in BLOCKCHAIN_NAME]: TokenAmount[];
  };
};
