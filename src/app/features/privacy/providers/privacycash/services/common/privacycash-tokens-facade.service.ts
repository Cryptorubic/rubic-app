import { map, Observable, of } from 'rxjs';
import { AssetListType } from '@features/trade/models/asset';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { SwapFormInput } from '@features/trade/models/swap-form-controls';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { BlockchainsInfo, Token } from '@cryptorubic/core';
import { inject, Injectable } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { PrivacyCashApiService } from '../privacy-cash-api.service';
import { PrivacyCashSwapService } from '../privacy-cash-swap.service';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import {
  PRIVACYCASH_SUPPORTED_TOKENS,
  PrivacycashSupportedChain
} from '../../constants/privacycash-chains';
import { toPrivacyCashTokenAddr } from '../../utils/converter';
import { TokenAddrWithBalance } from '../../models/privacycash-tokens-facade-models';

@Injectable()
export class PrivacycashTokensFacadeService extends TokensFacadeService {
  private readonly privacycashApiService = inject(PrivacyCashApiService);

  private readonly privacycashSwapService = inject(PrivacyCashSwapService);

  private readonly walletConnectorService = inject(WalletConnectorService);

  public override getTokensList(
    type: AssetListType,
    _query: string,
    direction: 'from' | 'to',
    inputValue: SwapFormInput
  ): Observable<AvailableTokenAmount[]> {
    const pcSupportedTokensForChain = BlockchainsInfo.isBlockchainName(type)
      ? PRIVACYCASH_SUPPORTED_TOKENS[type as PrivacycashSupportedChain]
      : Object.values(PRIVACYCASH_SUPPORTED_TOKENS).flat();

    return of(pcSupportedTokensForChain).pipe(
      switchMap(supportedTokenSymbols => {
        return Promise.all(
          supportedTokenSymbols.map(async tokenAddr => {
            try {
              const privateBalanceWei = await this.privacycashSwapService.getPrivacyCashBalance(
                toPrivacyCashTokenAddr(tokenAddr),
                new PublicKey(this.walletConnectorService.address),
                true
              );
              return {
                address: tokenAddr.toLowerCase(),
                balanceWei: new BigNumber(privateBalanceWei)
              };
            } catch {
              return {
                address: tokenAddr.toLowerCase(),
                balanceWei: new BigNumber(0)
              };
            }
          })
        );
      }),
      switchMap((privateTokensWithBalance: TokenAddrWithBalance[]) => {
        // address is rubic supported(native is So11111111111111111111111111111111111111111)
        const addrToTokenMap = privateTokensWithBalance.reduce(
          (acc, token) => ({ ...acc, [token.address.toLowerCase()]: token }),
          {} as Record<string, TokenAddrWithBalance>
        );
        return this.tokensBuilderService.getTokensList(type, _query, direction, inputValue).pipe(
          map(tokens => {
            return tokens
              .filter(token => !!addrToTokenMap[token.address.toLowerCase()])
              .map(token => {
                const tokenWithBalance = addrToTokenMap[token.address.toLowerCase()];
                return {
                  ...token,
                  amount: Token.fromWei(tokenWithBalance.balanceWei, token.decimals)
                };
              });
          })
        );
      })
    );
  }
}
