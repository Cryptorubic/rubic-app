import { Injectable } from '@angular/core';
import { SwapsStateService } from '../swaps-state/swaps-state.service';
import { map } from 'rxjs';
import { Token } from '@app/shared/models/tokens/token';
import { BlockchainName, BlockchainsInfo, Web3Pure } from 'rubic-sdk';
import { TokensStoreService } from '@app/core/services/tokens/tokens-store.service';
import { compareTokens } from '@app/shared/utils/utils';

@Injectable()
export class GasFormService {
  public readonly bestTrade$ = this.swapsStateService.tradesStore$.pipe(
    map(trades => trades.filter(t => t.trade && !t.error)),
    map(trades => trades[0])
  );

  constructor(
    private readonly swapsStateService: SwapsStateService,
    private readonly tokensStoreService: TokensStoreService
  ) {}

  public getNativeToken(blockchain: BlockchainName): Token {
    const chainType = BlockchainsInfo.getChainType(blockchain);
    const address = Web3Pure[chainType].nativeTokenAddress;

    return this.tokensStoreService.tokens.find(t => compareTokens(t, { address, blockchain }));
  }
}
