import BigNumber from 'bignumber.js';
import { NATIVE_SOLANA_MINT_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import { Account, Connection, PublicKey, Transaction, TransactionResponse } from '@solana/web3.js';
import { SolanaWallet } from '@core/services/blockchain/wallets/wallets-adapters/solana/models/types';
import { BlockchainTokenExtended } from '@shared/models/tokens/blockchain-token-extended';
import { CommonWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/common-wallet-adapter';
import { Web3Public } from '@core/services/blockchain/blockchain-adapters/common/web3-public';
import { base58 } from '@scure/base';
import { from, Observable, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import {
  BaseInformation,
  ReturnValue
} from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-types';

export class SolanaWeb3Public extends Web3Public<null, TransactionResponse> {
  /**
   * Create base swap information - owner, transaction and signers objects.
   * @param address Wallet to perform swap.
   */
  public static createBaseSwapInformation(address: string): BaseInformation {
    const owner = new PublicKey(address);
    const transaction = new Transaction();
    const signers: Account[] = [];

    return { owner, transaction, signers };
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
   * Signs a Solana transaction.
   * @param walletAdapter Wallet adapter object.
   * @param transaction Transaction to sign.
   * @param signers Array of accounts which can sign transaction.
   */
  public async signTransaction(
    walletAdapter: CommonWalletAdapter<SolanaWallet>,
    transaction: Transaction,
    signers: Array<Account> = []
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
}
