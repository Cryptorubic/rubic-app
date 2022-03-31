import BigNumber from 'bignumber.js';
import { NATIVE_SOLANA_MINT_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import {
  Connection,
  PublicKey,
  Signer,
  Transaction,
  TransactionInstruction,
  TransactionResponse
} from '@solana/web3.js';
import { SolanaWallet } from '@core/services/blockchain/wallets/wallets-adapters/solana/models/types';
import { BlockchainTokenExtended } from '@shared/models/tokens/blockchain-token-extended';
import { CommonWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/common-wallet-adapter';
import { Web3Public } from '@core/services/blockchain/blockchain-adapters/common/web3-public';
import { base58 } from '@scure/base';
import { from, Observable, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import {
  BaseInformation,
  BaseTransaction,
  ReturnValue
} from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-types';
import { asyncMap, shakeUndefiledItem } from '@shared/utils/utils';
import { SignRejectError } from '@core/errors/models/provider/sign-reject-error';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { UnsignedTransactionAndSigners } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/unsigned-transaction-and-signers';
import { RubicAny } from '@shared/models/utility-types/rubic-any';

export class SolanaWeb3Public extends Web3Public<null, TransactionResponse> {
  /**
   * Creates setup and swap transactions.
   * @param setupInstructions Instruction to perform pre-swap (Register tokens and wrapp)
   * @param tradeInstructions Instructions to perform swap.
   * @param signers Setup transaction signers.
   */
  public static createTransactions(
    setupInstructions: TransactionInstruction[],
    tradeInstructions: TransactionInstruction[],
    signers: Signer[]
  ): BaseTransaction {
    const setupTransaction =
      setupInstructions.length > 0
        ? {
            transaction: new Transaction().add(...setupInstructions),
            signers: signers
          }
        : null;

    const tradeTransaction =
      tradeInstructions.length > 0
        ? {
            transaction: new Transaction().add(...tradeInstructions),
            signers: [] as Signer[]
          }
        : null;

    return { setupTransaction, tradeTransaction };
  }

  /**
   * Create base swap information - owner, transaction and signers objects.
   * @param address Wallet to perform swap.
   */
  public static createBaseSwapInformation(address: string): BaseInformation {
    const owner = new PublicKey(address);
    // const transaction = new Transaction();
    const signers: Signer[] = [];
    const setupInstructions: TransactionInstruction[] = [];
    const tradeInstructions: TransactionInstruction[] = [];

    return { owner, signers, setupInstructions, tradeInstructions };
  }

  /**
   * Converts address to bytes32 format.
   * @param address Address to convert.
   */
  public static addressToBytes32(address: string): string {
    return (
      '0x' +
      Array.from(base58.decode(address))
        .map(num => num.toString(16).padStart(2, '0'))
        .reduce((acc, hexNum) => acc + hexNum, '')
    );
  }

  /**
   * RPC Solana connection.
   */
  public readonly connection: Connection;

  constructor(connection: Connection) {
    super();
    this.connection = connection;
  }

  /**
   * Gets allowance.
   */
  public async getAllowance(): Promise<BigNumber> {
    return new BigNumber(Infinity);
  }

  /**
   * HealthCheck Solana RPC node.
   * @param timeoutMs Acceptable node response timeout.
   * @return null if healthcheck is not defined for current blockchain, else is node works status.
   */
  public healthCheck(timeoutMs: number = 4000): Observable<boolean> {
    const request = this.connection.getBalanceAndContext(
      new PublicKey('DVLwQbEaw5txuduQwvfbNP3sXvjawHqaoMuGMKZx15bQ'),
      'confirmed'
    );
    return from(request).pipe(
      timeout(timeoutMs),
      map(result => Boolean(result)),
      catchError((err: unknown) => {
        if ((err as Error)?.name === 'TimeoutError') {
          console.debug(`Solana node healthcheck timeout (${timeoutMs}ms) has occurred.`);
        } else {
          console.debug(`Solana node healthcheck fail: ${err}`);
        }
        return of(false);
      })
    );
  }

  /**
   * Checks if a given address is a valid Solana address.
   * @param address The address to check validity.
   */
  public isAddressCorrect(address: string): boolean {
    try {
      return Boolean(new PublicKey(address)?.toBase58());
    } catch {
      return false;
    }
  }

  /**
   * Checks if address is Solana native address.
   * @param address Address to check.
   */
  public isNativeAddress = (address: string): boolean => {
    return address === NATIVE_SOLANA_MINT_ADDRESS;
  };

  /**
   * Gets information about token from blockchain.
   */
  public async getTokenInfo(): Promise<BlockchainTokenExtended> {
    return null;
  }

  /**
   * Gets token or native token balance.
   * @param userAddress Wallet address whose balance you want to find out.
   * @param tokenAddress Address of the smart-contract corresponding to the token.
   */
  public async getTokenOrNativeBalance(
    userAddress: string,
    tokenAddress: string
  ): Promise<BigNumber> {
    return this.isNativeAddress(tokenAddress)
      ? new BigNumber(
          (
            await this.connection.getBalanceAndContext(new PublicKey(userAddress), 'confirmed')
          ).value.toString()
        )
      : (await this.getTokensBalances(userAddress, [tokenAddress]))?.[0];
  }

  /**
   * Gets solana tokens balance.
   * @param tokenAddress Address of the contract corresponding to the token.
   * @param address Wallet address whose balance you want to find out.
   * @return Account tokens balance.
   */
  public async getTokenBalance(address: string, tokenAddress: string): Promise<BigNumber> {
    return (await this.getTokensBalances(address, [tokenAddress]))?.[0];
  }

  /**
   * Predicts the volume of gas required to execute the contract method.
   */
  public async getEstimatedGas(): Promise<BigNumber> {
    const { feeCalculator } = await this.connection.getRecentBlockhash();
    return new BigNumber(feeCalculator.lamportsPerSignature);
  }

  /**
   * Get a transaction by hash in several attempts.
   * @param hash Hash of the target transaction.
   * @param attempt Current attempt number.
   * @param attemptsLimit Maximum allowed number of attempts.
   * @param delay Ms delay before next attempt.
   */
  public async getTransactionByHash(
    hash: string,
    attempt?: number,
    attemptsLimit?: number,
    delay?: number
  ): Promise<TransactionResponse> {
    attempt = attempt || 0;
    const limit = attemptsLimit || 10;
    const timeoutMs = delay || 500;

    if (attempt >= limit) {
      return null;
    }

    const transaction = await this.connection.getTransaction(hash);
    if (transaction === null) {
      return new Promise(resolve =>
        setTimeout(() => resolve(this.getTransactionByHash(hash, attempt + 1)), timeoutMs)
      );
    }
    return transaction;
  }

  /**
   * Gets balance of multiple tokens.
   * @param address Wallet address.
   * @param tokensAddresses Tokens addresses.
   */
  public async getTokensBalances(address: string, tokensAddresses: string[]): Promise<BigNumber[]> {
    const resp = await (
      this.connection as Connection & {
        _rpcRequest: (owner: string, data: unknown[]) => ReturnValue;
      }
    )._rpcRequest('getTokenAccountsByOwner', [
      address,
      { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
      { encoding: 'jsonParsed' }
    ]);

    const tokenInfo = new Map<string, number>(
      resp.result.value.map(el => {
        const { mint, tokenAmount } = el.account.data.parsed.info;
        return [mint, tokenAmount.amount];
      })
    );

    const nativeSolBalance = await this.connection.getBalanceAndContext(
      new PublicKey(address),
      'confirmed'
    );
    return tokensAddresses.map(tokenAddress => {
      if (tokenAddress === NATIVE_SOLANA_MINT_ADDRESS) {
        return new BigNumber(nativeSolBalance.value.toString());
      }
      const tokenWithBalance = tokenInfo.get(tokenAddress);
      return new BigNumber(tokenWithBalance || NaN);
    });
  }

  /**
   * Attaches recent blockhash and payer public key to transaction.
   * @param transaction Transaction to attach blockhash and payer.
   * @param owner Payer public key.
   */
  private async attachRecentBlockhashAndPayer(
    transaction: Transaction,
    owner: PublicKey
  ): Promise<void> {
    if (!transaction.recentBlockhash) {
      // RecentBlockhash may already be attached by raydium SDK
      try {
        transaction.recentBlockhash =
          (await this.connection.getLatestBlockhash?.())?.blockhash ||
          (await this.connection.getRecentBlockhash()).blockhash;
      } catch {
        transaction.recentBlockhash = (await this.connection.getRecentBlockhash()).blockhash;
      }
    }
    transaction.feePayer = owner;
  }

  /**
   * Signs list of transactions.
   * @param transactions Transactions array.
   * @param walletAdapter Wallet adapter.
   * @param owner Owner public key.
   */
  public async signAllTransactions(
    transactions: Transaction[],
    walletAdapter: CommonWalletAdapter<SolanaWallet>,
    owner: PublicKey
  ): Promise<Transaction[]> {
    for await (const transaction of transactions) {
      await this.attachRecentBlockhashAndPayer(transaction, owner);
    }

    return walletAdapter.wallet.signAllTransactions(transactions);
  }

  /**
   * Signs a Solana transaction.
   * @param walletAdapter Wallet adapter object.
   * @param transaction Transaction to sign.
   * @param signers Array of accounts which can sign transaction.
   */
  public async signTransaction(
    walletAdapter: CommonWalletAdapter<SolanaWallet>,
    transaction: Transaction,
    signers: Signer[] = []
  ): Promise<string> {
    transaction.recentBlockhash = (await this.connection.getRecentBlockhash()).blockhash;
    transaction.setSigners(new PublicKey(walletAdapter.address), ...signers.map(s => s.publicKey));
    if (signers.length > 0) {
      transaction.partialSign(...signers);
    }

    const sendMethodName = 'signAndSendTransaction';
    if (walletAdapter.wallet?.[sendMethodName]) {
      const { signature } = await walletAdapter.wallet.request({
        method: sendMethodName,
        params: {
          message: base58.encode(transaction.serializeMessage())
        }
      });

      return signature;
    }
    const rawTransaction = await walletAdapter.wallet.signTransaction(transaction);
    return this.connection?.sendRawTransaction(rawTransaction?.serialize());
  }

  /**
   * Attaches transaction blockhash and payer and partial signs transaction.
   * @param transaction Transaction to perform actions.
   * @param signers Array of signers.
   * @param owner Owner public key.
   */
  public async partialSignTransaction(
    transaction: Transaction,
    signers?: Signer[],
    owner?: PublicKey
  ): Promise<Transaction> {
    if (signers?.length) {
      await this.attachRecentBlockhashAndPayer(transaction, owner);

      transaction.partialSign(...signers);
      return transaction;
    }
    return transaction;
  }

  /**
   * Sends raw transaction to blockchain skipping preflight.
   * @param transaction Transaction to send.
   */
  public async sendOneTransaction(transaction: Transaction): Promise<string> {
    const serializedTransaction = transaction.serialize();
    return this.connection.sendRawTransaction(serializedTransaction, {
      skipPreflight: true
    });
  }

  public async signAndSendRaydiumTransaction(
    transactionInformation: BaseTransaction,
    connector: WalletConnectorService
  ): Promise<string> {
    let signedTransactions: Transaction[];

    try {
      // @Todo replace Rubic Any by awaited.
      const transactions = await asyncMap<UnsignedTransactionAndSigners, RubicAny>(
        [transactionInformation.setupTransaction, transactionInformation.tradeTransaction],
        merged => {
          if (!merged) return;
          const { transaction, signers } = merged;
          return this.partialSignTransaction(
            transaction,
            signers,
            new PublicKey(connector.address)
          );
        }
      );
      signedTransactions = shakeUndefiledItem<Transaction>(transactions);
    } catch {
      throw new SignRejectError();
    }
    const allSignedTransactions = await this.signAllTransactions(
      signedTransactions,
      connector.provider,
      new PublicKey(connector.address)
    );

    await this.sendOneTransaction(allSignedTransactions[0]);
    // Send trade transaction with interval.
    return await new Promise(resolve => {
      const wait = setTimeout(async () => {
        clearTimeout(wait);
        resolve(await this.sendOneTransaction(allSignedTransactions[1]));
      }, 1000);
    });
  }
}
