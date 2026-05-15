import { TokensBootstrapService } from '@core/services/tokens/tokens-bootstrap.service';
import { Token } from '@shared/models/tokens/token';
import { firstValueFrom } from 'rxjs';
import { BlockchainName } from '@cryptorubic/core';
import { RAILGUN_SUPPORTED_CHAINS } from '@features/privacy/providers/railgun/constants/network-map';

export class RailgunTokensBootstrapService extends TokensBootstrapService {
  public override buildTokenLists(): void {
    Promise.all([this.buildTier1List()]).then(([tier1Tokens]) => {
      this.tokensCollectionsFacade.allTokens.updateTokenSync(tier1Tokens);
    });
  }

  protected override async buildTier1List(): Promise<Token[]> {
    const tokens = await firstValueFrom(this.apiService.getTopTokens(RAILGUN_SUPPORTED_CHAINS));
    Object.entries(tokens).forEach(([blockchain, blockchainTokens]) => {
      this.tokensStore.addInitialBlockchainTokens(blockchain as BlockchainName, blockchainTokens);
    });
    const tokensArray = Object.values(tokens)
      .map(el => el.list)
      .flat();
    this._tier1TokensLoaded$.next(true);

    return tokensArray;
  }
}
