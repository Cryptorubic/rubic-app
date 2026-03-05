import { Injectable, inject } from '@angular/core';
import BigNumber from 'bignumber.js';
import { PrivacycashSwapService } from '../../privacy-cash-swap.service';
import { toPrivacyCashTokenAddr } from '../../../utils/converter';
import { PublicKey } from '@solana/web3.js';
import { Token as SdkToken } from '@cryptorubic/core';
import { Token } from '@app/shared/models/tokens/token';
import { Observable, map, switchMap } from 'rxjs';
import { MinimalToken } from '@app/shared/models/tokens/minimal-token';
import { AssetListType } from '@app/features/trade/models/asset';
import { SwapFormInput } from '@app/features/trade/models/swap-form-controls';
import { AvailableTokenAmount } from '@app/shared/models/tokens/available-token-amount';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { getMinimalTokensByChain } from './utils/get-minimal-tokens-by-chain';

@Injectable()
export class PrivacycashPrivateTokensFacadeService extends TokensFacadeService {
  private readonly privacycashSwapService = inject(PrivacycashSwapService);

  private readonly walletConnectorService = inject(WalletConnectorService);

  private getPrivateTokenBalance(token: Token): Promise<BigNumber> {
    return this.privacycashSwapService
      .getPrivacyCashBalance(
        toPrivacyCashTokenAddr(token.address),
        new PublicKey(this.walletConnectorService.address),
        true
      )
      .then(balanceWei => SdkToken.fromWei(balanceWei, token.decimals));
  }

  public override getTokensList(
    type: AssetListType,
    _query: string,
    direction: 'from' | 'to',
    inputValue: SwapFormInput
  ): Observable<AvailableTokenAmount[]> {
    const getKey = (token: MinimalToken): string => {
      return `${token.blockchain}::${token.address.toLowerCase()}`;
    };
    const pcSupportedTokensByChain: MinimalToken[] = getMinimalTokensByChain(type);
    // address is rubic supported(native is So11111111111111111111111111111111111111111)
    const addrToTokenMap = pcSupportedTokensByChain.reduce(
      (acc, token) => ({ ...acc, [getKey(token)]: token }),
      {} as Record<string, MinimalToken>
    );

    return this.tokensBuilderService.getTokensList(type, _query, direction, inputValue).pipe(
      map(tokens => tokens.filter(token => !!addrToTokenMap[getKey(token)])),
      switchMap(pcSupportedTokens => {
        return Promise.all(
          pcSupportedTokens.map(token => {
            return this.getPrivateTokenBalance(token).then(privateBalanceWei => ({
              ...token,
              amount: SdkToken.fromWei(privateBalanceWei, token.decimals)
            }));
          })
        );
      })
    );
  }
}
