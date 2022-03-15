import BigNumber from 'bignumber.js';
import { NATIVE_SOLANA_MINT_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import {
  Account,
  AccountInfo,
  Connection,
  PublicKey,
  RpcResponseAndContext,
  Transaction,
  TransactionResponse
} from '@solana/web3.js';
import { compareAddresses } from '@shared/utils/utils';
import { SolanaWallet } from '@core/services/blockchain/wallets/wallets-adapters/solana/models/types';
import { BlockchainTokenExtended } from '@shared/models/tokens/blockchain-token-extended';
import { CommonWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/common-wallet-adapter';
import { Web3Public } from '@core/services/blockchain/blockchain-adapters/common/web3-public';
import { base58 } from '@scure/base';
import { from, Observable, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';

type ReturnValue = Promise<{
  result: RpcResponseAndContext<
    Array<{
      pubkey: PublicKey;
      account: AccountInfo<{
        parsed: {
          info: {
            tokenAmount: {
              amount: number;
              decimals: number;
            };
            mint: string;
          };
        };
      }>;
    }>
  >;
}>;

export class SolanaWeb3Public extends Web3Public<null, TransactionResponse> {
  public static addressToBytes32(address: string): string {
    return (
      '0x' +
      Array.from(base58.decode(address))
        .map(num => num.toString(16).padStart(2, '0'))
        .reduce((acc, hexNum) => acc + hexNum, '')
    );
  }

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
   * checks if address is Ether native address
   * @param address address to check
   */
  public isNativeAddress = (address: string): boolean => {
    return address === NATIVE_SOLANA_MINT_ADDRESS;
  };

  public async getTokenInfo(): Promise<BlockchainTokenExtended> {
    return null;
  }

  /**
   *
   * @param userAddress wallet address whose balance you want to find out
   * @param tokenAddress address of the smart-contract corresponding to the token
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
   * gets ERC-20 tokens balance as integer (multiplied to 10 ** decimals)
   * @param tokenAddress address of the smart-contract corresponding to the token
   * @param address wallet address whose balance you want to find out
   * @return account tokens balance as integer (multiplied to 10 ** decimals)
   */
  public async getTokenBalance(address: string, tokenAddress: string): Promise<BigNumber> {
    return (await this.getTokensBalances(address, [tokenAddress]))?.[0];
  }

  /**
   * Predicts the volume of gas required to execute the contract method
   */
  public async getEstimatedGas(): Promise<BigNumber> {
    const { feeCalculator } = await this.connection.getRecentBlockhash();
    return new BigNumber(feeCalculator.lamportsPerSignature);
  }

  /**
   * get a transaction by hash in several attempts
   * @param hash hash of the target transaction
   * @param attempt current attempt number
   * @param attemptsLimit maximum allowed number of attempts
   * @param delay ms delay before next attempt
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
   * get balance of multiple tokens via multicall.
   * @param address wallet address.
   * @param tokensAddresses tokens addresses.
   */
  public async getTokensBalances(address: string, tokensAddresses: string[]): Promise<BigNumber[]> {
    const resp = await (
      this.connection as Connection & {
        _rpcRequest: (owner: string, data: unknown[]) => ReturnValue;
      }
    )._rpcRequest('getTokenAccountsByOwner', [
      address,
      {
        programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
      },
      {
        encoding: 'jsonParsed'
      }
    ]);

    const nativeSolBalance = await this.connection.getBalanceAndContext(
      new PublicKey(address),
      'confirmed'
    );

    return tokensAddresses.map(tokenAddress => {
      if (tokenAddress === NATIVE_SOLANA_MINT_ADDRESS) {
        return new BigNumber(nativeSolBalance.value.toString());
      }
      const tokenWithBalance = resp.result.value.find(token => {
        const { info } = token.account.data.parsed;
        return compareAddresses(info.mint, tokenAddress);
      });
      return new BigNumber(
        tokenWithBalance ? tokenWithBalance.account.data.parsed.info.tokenAmount.amount : NaN
      );
    });
  }

  public async signTransaction(
    walletAdapter: CommonWalletAdapter<SolanaWallet>,
    transaction: Transaction,
    signers: Array<Account> = []
  ): Promise<Transaction> {
    transaction.recentBlockhash = (await this.connection.getRecentBlockhash()).blockhash;
    transaction.setSigners(new PublicKey(walletAdapter.address), ...signers.map(s => s.publicKey));
    if (signers.length > 0) {
      transaction.partialSign(...signers);
    }
    return await walletAdapter.wallet.signTransaction(transaction);
  }
}
