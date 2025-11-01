import { CommonUtilityStore } from '@core/services/tokens/models/common-utility-store';
import { Token } from '@shared/models/tokens/token';
import { TokenRef } from '@core/services/tokens/models/new-token-types';
import { NewTokensStoreService } from '@core/services/tokens/new-tokens-store.service';

export abstract class BasicUtilityStore extends CommonUtilityStore {
  public getTokenRefs(tokens: Token[]): TokenRef[] {
    return tokens.map(token => ({
      address: token.address,
      blockchain: token.blockchain
    }));
  }

  constructor(tokensStore: NewTokensStoreService) {
    super(tokensStore);
  }
}
