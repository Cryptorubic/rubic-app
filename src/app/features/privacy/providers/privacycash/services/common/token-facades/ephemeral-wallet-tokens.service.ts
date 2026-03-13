import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { getMinimalTokensByChain } from './utils/get-minimal-tokens-by-chain';
import { MinimalToken } from '@app/shared/models/tokens/minimal-token';
import { MinimalTokenWithBalance } from '../../../models/privacycash-tokens-facade-models';
import { PublicKey } from '@solana/web3.js';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import BigNumber from 'bignumber.js';
import { PrivacycashSignatureService } from '../../privacy-cash-signature.service';
import { BlockchainAdapterFactoryService } from '@app/core/services/sdk/sdk-legacy/blockchain-adapter-factory/blockchain-adapter-factory.service';
import { BLOCKCHAIN_NAME, nativeTokensList } from '@cryptorubic/core';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { compareTokens } from '@app/shared/utils/utils';

@Injectable()
export class EphemeralWalletTokensService {
  private readonly privacycashSignatureService = inject(PrivacycashSignatureService);

  private readonly adapterFactory = inject(BlockchainAdapterFactoryService);

  private readonly walletConnectorService = inject(WalletConnectorService);

  private readonly _updateBalances$ = new BehaviorSubject<boolean>(false);

  public readonly updateBalances$ = this._updateBalances$.asObservable();

  private readonly _tokens$ = new BehaviorSubject<MinimalTokenWithBalance[]>(
    this.initializeTokensList()
  );

  public readonly tokens$ = this._tokens$.asObservable();

  public updateBalances(): void {
    this._updateBalances$.next(true);
  }

  private initializeTokensList(): MinimalTokenWithBalance[] {
    const pcAllSupportedMinimalTokens: MinimalToken[] = getMinimalTokensByChain('allChains');
    return pcAllSupportedMinimalTokens.map(minimalToken => ({
      ...minimalToken,
      balanceWei: new BigNumber(0)
    }));
  }

  public async loadBalances(): Promise<void> {
    const pcAllSupportedMinimalTokens: MinimalToken[] = getMinimalTokensByChain('allChains');
    const ephemeralWalletTokens = await this.fetchEphemeralWalletTokens();
    const pcTokensWithEphemeralBalance: MinimalTokenWithBalance[] = pcAllSupportedMinimalTokens.map(
      token => {
        const foundEphemeralToken = ephemeralWalletTokens.find(ephemeralToken =>
          compareTokens(ephemeralToken, token)
        );
        return {
          ...token,
          balanceWei: foundEphemeralToken ? foundEphemeralToken.balanceWei : new BigNumber(0)
        };
      }
    );
    this._tokens$.next(pcTokensWithEphemeralBalance);
  }

  private async fetchEphemeralWalletTokens(): Promise<MinimalTokenWithBalance[]> {
    const adapter = this.adapterFactory.getAdapter(BLOCKCHAIN_NAME.SOLANA);
    const senderPK = new PublicKey(this.walletConnectorService.address);
    const ephemeralKeypair =
      await this.privacycashSignatureService.deriveSolanaKeypairFromEncryptionKeyBase58(
        this.privacycashSignatureService.signature,
        senderPK,
        0
      );

    const nativePromise = adapter
      .getBalance(ephemeralKeypair.publicKey.toBase58())
      .then(balanceWei => ({ ...nativeTokensList.SOLANA, balanceWei } as MinimalTokenWithBalance))
      .catch(
        () =>
          ({ ...nativeTokensList.SOLANA, balanceWei: new BigNumber(0) } as MinimalTokenWithBalance)
      );
    const tokensPromise = adapter.public.getParsedTokenAccountsByOwner(ephemeralKeypair.publicKey, {
      programId: TOKEN_PROGRAM_ID
    });
    const [nativeToken, tokensResp] = await Promise.all([nativePromise, tokensPromise]);
    const splTokens = tokensResp.value.map(
      accountInfo =>
        ({
          address: accountInfo.account.data['parsed']['info']['mint'],
          blockchain: BLOCKCHAIN_NAME.SOLANA,
          balanceWei: new BigNumber(
            accountInfo.account.data['parsed']['info']['tokenAmount']['amount']
          )
        } as MinimalTokenWithBalance)
    );

    return [nativeToken, ...splTokens];
  }
}
