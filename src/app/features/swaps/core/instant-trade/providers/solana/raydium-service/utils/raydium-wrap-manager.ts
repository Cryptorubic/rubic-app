import { NATIVE_SOLANA_MINT_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import {
  TOKENS,
  WRAPPED_SOL
} from '@features/swaps/core/instant-trade/providers/solana/raydium-service/models/tokens';
import { PublicKey } from '@solana/web3.js';
import { SolanaWeb3Public } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-public';
import { Token } from '@solana/spl-token';
import {
  AT_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from '@features/swaps/core/instant-trade/providers/solana/raydium-service/models/accounts';
import { closeAccount } from '@project-serum/serum/lib/token-instructions';
import InstantTrade from '@features/swaps/features/instant-trade/models/instant-trade';
import { List } from 'immutable';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import BigNumber from 'bignumber.js';
import { SolanaWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-private.service';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { BaseTransaction } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-types';

export class RaydiumWrapManager {
  public static isWrap(fromAddress: string, toAddress: string): boolean {
    return (
      (fromAddress === NATIVE_SOLANA_MINT_ADDRESS && toAddress === WRAPPED_SOL.mintAddress) ||
      (fromAddress === WRAPPED_SOL.mintAddress && toAddress === NATIVE_SOLANA_MINT_ADDRESS)
    );
  }

  private static async unwrapSol(address: string): Promise<BaseTransaction> {
    const { setupInstructions, owner, signers } =
      SolanaWeb3Public.createBaseSwapInformation(address);
    const toPublicKey = new PublicKey(TOKENS.WSOL.mintAddress);
    const ata = await Token.getAssociatedTokenAddress(
      AT_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      toPublicKey,
      owner,
      true
    );

    setupInstructions.push(
      closeAccount({
        source: new PublicKey(ata),
        destination: owner,
        owner
      })
    );

    return SolanaWeb3Public.createTransactions(setupInstructions, null, signers);
  }

  constructor(
    private readonly privateBlockchainAdapter: SolanaWeb3PrivateService,
    private readonly walletConnectorService: WalletConnectorService
  ) {}

  public async createWrapTrade(
    trade: InstantTrade,
    solanaTokens: List<TokenAmount>
  ): Promise<BaseTransaction> {
    const fromNativeSol = trade.from.token.address === NATIVE_SOLANA_MINT_ADDRESS;
    return fromNativeSol
      ? await this.wrapSol(trade, this.walletConnectorService.address, solanaTokens)
      : await RaydiumWrapManager.unwrapSol(this.walletConnectorService.address);
  }

  private async wrapSol(
    trade: InstantTrade,
    address: string,
    tokens: List<TokenAmount>
  ): Promise<BaseTransaction> {
    const { signers, owner, setupInstructions } =
      SolanaWeb3Public.createBaseSwapInformation(address);

    const fromDecimals = new BigNumber(10).exponentiatedBy(trade.from.token.decimals);
    const amountIn = new BigNumber(trade.from.amount.toString()).multipliedBy(fromDecimals);
    const from = tokens.find(el => el.address === trade.from.token.address);
    const to = tokens.find(el => el.address === trade.to.token.address);

    if (!from || !to) {
      throw new Error('Miss token info');
    }

    const fromFinalAmount = Math.floor(parseFloat(amountIn.toString()));

    await this.privateBlockchainAdapter.createAtaSolIfNotExistAndWrap(
      undefined,
      owner,
      setupInstructions,
      signers,
      fromFinalAmount
    );

    return SolanaWeb3Public.createTransactions(setupInstructions, null, signers);
  }
}
