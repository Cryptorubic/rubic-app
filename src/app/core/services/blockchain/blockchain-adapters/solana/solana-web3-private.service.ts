import {
  Account,
  AccountInfo,
  Commitment,
  Connection,
  PerfSample,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction
} from '@solana/web3.js';
import { Token } from '@solana/spl-token';
import { initializeAccount } from '@project-serum/serum/lib/token-instructions';
import {
  ACCOUNT_LAYOUT,
  MINT_LAYOUT
} from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/structure';
import {
  AT_PROGRAM_ID,
  RENT_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/accounts';
import { TOKENS } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/tokens';
import BigNumber from 'bignumber.js';
import { Layout } from '@project-serum/borsh';
import { SolanaWallet } from '@core/services/blockchain/wallets/wallets-adapters/solana/models/types';
import { Injectable } from '@angular/core';
import { NATIVE_SOLANA_MINT_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import { TokenAccounts } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/token-accounts';
import { HttpService } from '@core/services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class SolanaWeb3PrivateService {
  private _connection: Connection;

  set connection(connection: Connection) {
    if (!this._connection) {
      this._connection = connection;
    }
  }

  private static throwIfNull<T>(value: T | null, message = 'account not found'): T {
    if (value === null) {
      throw new Error(message);
    }
    return value;
  }

  constructor(private readonly httpService: HttpService) {}

  public async findProgramAddress(
    seeds: Array<Buffer | Uint8Array>,
    programId: PublicKey
  ): Promise<{ publicKey: PublicKey; nonce: number }> {
    const [publicKey, nonce] = await PublicKey.findProgramAddress(seeds, programId);
    return { publicKey, nonce };
  }

  public async createAmmAuthority(
    programId: PublicKey
  ): Promise<{ publicKey: PublicKey; nonce: number }> {
    return await this.findProgramAddress(
      [new Uint8Array(Buffer.from('amm authority'.replace('\u00A0', ' '), 'utf-8'))],
      programId
    );
  }

  public async createAssociatedId(
    infoId: PublicKey,
    marketAddress: PublicKey,
    bufferKey: string
  ): Promise<PublicKey> {
    const { publicKey } = await this.findProgramAddress(
      [infoId.toBuffer(), marketAddress.toBuffer(), Buffer.from(bufferKey)],
      infoId
    );
    return publicKey;
  }

  public async findAssociatedTokenAddress(
    walletAddress: PublicKey,
    tokenMintAddress: PublicKey
  ): Promise<PublicKey> {
    const { publicKey } = await this.findProgramAddress(
      [walletAddress.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), tokenMintAddress.toBuffer()],
      AT_PROGRAM_ID
    );
    return publicKey;
  }

  public async createTokenAccountIfNotExist(
    account: string | undefined | null,
    owner: PublicKey,
    mintAddress: string,
    lamports: BigNumber,

    transaction: Transaction,
    signer: Array<Account>
  ): Promise<PublicKey> {
    let publicKey;

    if (account) {
      publicKey = new PublicKey(account);
    } else {
      publicKey = await this.createProgramAccountIfNotExist(
        account,
        owner,
        TOKEN_PROGRAM_ID,
        lamports.toNumber(),
        ACCOUNT_LAYOUT,
        transaction,
        signer
      );

      transaction.add(
        initializeAccount({
          account: publicKey,
          mint: new PublicKey(mintAddress),
          owner
        })
      );
    }

    return publicKey;
  }

  public async createAssociatedTokenAccountIfNotExist(
    account: string | undefined | null | PublicKey,
    owner: PublicKey,
    mintAddress: string,
    transaction: Transaction,
    atas: string[] = []
  ): Promise<PublicKey> {
    console.debug(account);
    const mint = new PublicKey(mintAddress);

    const ata = await Token.getAssociatedTokenAddress(
      AT_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      mint,
      owner,
      true
    );
    const accountInfo = await this._connection.getAccountInfo(ata);

    if (!accountInfo) {
      transaction.add(
        Token.createAssociatedTokenAccountInstruction(
          AT_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          mint,
          ata,
          owner,
          owner
        )
      );
      atas.push(ata.toBase58());
    }

    return ata;
  }

  public async createAtaSolIfNotExistAndWrap(
    account: string | undefined | null,
    owner: PublicKey,
    transaction: Transaction,
    signers: Array<Account>,
    amount: number
  ): Promise<void> {
    let publicKey;
    if (account) {
      publicKey = new PublicKey(account);
    }
    const mint = new PublicKey(TOKENS.WSOL.mintAddress);
    // @ts-ignore without ts ignore, yarn build will failed
    const ata = await Token.getAssociatedTokenAddress(
      AT_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      mint,
      owner,
      true
    );
    if (!publicKey) {
      const rent = await Token.getMinBalanceRentForExemptAccount(this._connection);
      transaction.add(
        SystemProgram.transfer({ fromPubkey: owner, toPubkey: ata, lamports: amount + rent }),
        Token.createAssociatedTokenAccountInstruction(
          AT_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          mint,
          ata,
          owner,
          owner
        )
      );
    } else {
      const rent = await Token.getMinBalanceRentForExemptAccount(this._connection);
      const wsol = await this.createTokenAccountIfNotExist(
        null,
        owner,
        TOKENS.WSOL.mintAddress,
        new BigNumber(amount + rent),
        transaction,
        signers
      );
      transaction.add(
        Token.createTransferInstruction(TOKEN_PROGRAM_ID, wsol, ata, owner, [], amount),
        Token.createCloseAccountInstruction(TOKEN_PROGRAM_ID, wsol, owner, owner, [])
      );
    }
  }

  public async createProgramAccountIfNotExist(
    account: string | undefined | null,
    owner: PublicKey,
    programId: PublicKey,
    lamports: number | null,
    layout: Layout<unknown>,
    transaction: Transaction,
    signer: Array<Account>
  ): Promise<PublicKey> {
    let publicKey;

    if (account) {
      publicKey = new PublicKey(account);
    } else {
      const newAccount = new Account();
      publicKey = newAccount.publicKey;

      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: owner,
          newAccountPubkey: publicKey,
          lamports:
            lamports ?? (await this._connection.getMinimumBalanceForRentExemption(layout.span)),
          space: layout.span,
          programId
        })
      );

      signer.push(newAccount);
    }

    return publicKey;
  }

  public async createAssociatedTokenAccount(
    tokenMintAddress: PublicKey,
    owner: PublicKey,
    transaction: Transaction
  ): Promise<PublicKey> {
    const associatedTokenAddress = await this.findAssociatedTokenAddress(owner, tokenMintAddress);

    const keys = [
      {
        pubkey: owner,
        isSigner: true,
        isWritable: false
      },
      {
        pubkey: associatedTokenAddress,
        isSigner: false,
        isWritable: true
      },
      {
        pubkey: owner,
        isSigner: false,
        isWritable: false
      },
      {
        pubkey: tokenMintAddress,
        isSigner: false,
        isWritable: false
      },
      {
        pubkey: SYSTEM_PROGRAM_ID,
        isSigner: false,
        isWritable: false
      },
      {
        pubkey: TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false
      },
      {
        pubkey: RENT_PROGRAM_ID,
        isSigner: false,
        isWritable: false
      }
    ];

    transaction.add(
      new TransactionInstruction({
        keys,
        programId: AT_PROGRAM_ID,
        data: Buffer.from([])
      })
    );

    return associatedTokenAddress;
  }

  public async getFilteredProgramAccounts(
    programId: PublicKey,
    filters: unknown
  ): Promise<{ publicKey: PublicKey; accountInfo: AccountInfo<Buffer> }[]> {
    const connection = this._connection as Connection & {
      _rpcRequest: (
        method: string,
        params: unknown[]
      ) => Promise<
        | {
            error: Error;
          }
        | {
            result: {
              pubkey: PublicKey;
              account: {
                data: string[];
                executable: boolean;
                owner: string;
                lamports: number;
              };
            }[];
          }
      >;
    };
    const resp = await connection._rpcRequest('getProgramAccounts', [
      programId.toBase58(),
      {
        commitment: this._connection.commitment,
        filters,
        encoding: 'base64'
      }
    ]);
    if ('error' in resp) {
      throw new Error(resp.error.message);
    }
    return resp.result.map(({ pubkey, account: { data, executable, owner, lamports } }) => ({
      publicKey: new PublicKey(pubkey),
      accountInfo: {
        data: Buffer.from(data[0], 'base64'),
        executable,
        owner: new PublicKey(owner),
        lamports
      }
    }));
  }

  public async getFilteredProgramAccountsAmmOrMarketCache(
    cacheName: String,
    programId: PublicKey,
    filters: unknown
  ): Promise<{ publicKey: PublicKey; accountInfo: AccountInfo<Buffer> }[]> {
    try {
      if (!cacheName) {
        throw new Error('cacheName error');
      }
      const resp = await this.httpService
        .get<{
          result: {
            pubkey: PublicKey;
            account: {
              data: string[];
              executable: boolean;
              owner: string;
              lamports: number;
            };
          }[];
        }>(`https://api.raydium.io/cache/rpc/${cacheName}`)
        .toPromise();
      return resp.result.map(({ pubkey, account: { data, executable, owner, lamports } }) => ({
        publicKey: new PublicKey(pubkey),
        accountInfo: {
          data: Buffer.from(data[0], 'base64'),
          executable,
          owner: new PublicKey(owner),
          lamports
        }
      }));
    } catch (e) {
      return this.getFilteredProgramAccounts(programId, filters);
    }
  }

  public async getMultipleAccounts(
    publicKeys: PublicKey[],
    commitment?: Commitment
  ): Promise<Array<null | { publicKey: PublicKey; account: AccountInfo<Buffer> }>> {
    const keys: PublicKey[][] = [];
    let tempKeys: PublicKey[] = [];

    publicKeys.forEach(k => {
      if (tempKeys.length >= 100) {
        keys.push(tempKeys);
        tempKeys = [];
      }
      tempKeys.push(k);
    });
    if (tempKeys.length > 0) {
      keys.push(tempKeys);
    }

    const accounts: Array<null | AccountInfo<Buffer | null>> = [];

    const resArray: { [key: number]: AccountInfo<Buffer | null>[] } = {};
    await Promise.all(
      keys.map(async (key, index) => {
        resArray[index] = (await this._connection.getMultipleAccountsInfo(
          key,
          commitment
        )) as AccountInfo<Buffer>[];
      })
    );

    Object.keys(resArray)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .forEach(itemIndex => {
        const res = resArray[parseInt(itemIndex)];
        for (const account of res) {
          accounts.push(account);
        }
      });
    return accounts.map((account, idx) => {
      if (account === null) {
        return null;
      }
      return {
        publicKey: publicKeys[idx],
        account
      };
    });
  }

  public async signTransaction(
    wallet: {
      publicKey: PublicKey;
      signTransaction: (transaction: Transaction) => Promise<Transaction>;
    },
    transaction: Transaction,
    signers: Array<Account> = []
  ): Promise<Transaction> {
    transaction.recentBlockhash = (await this._connection.getRecentBlockhash()).blockhash;
    transaction.setSigners(wallet.publicKey, ...signers.map(s => s.publicKey));
    if (signers.length > 0) {
      transaction.partialSign(...signers);
    }
    return await wallet.signTransaction(transaction);
  }

  public async sendTransaction(
    wallet: SolanaWallet,
    transaction: Transaction,
    signers: Array<Account> = []
  ): Promise<string> {
    return wallet.sendTransaction(transaction, this._connection, {
      signers,
      skipPreflight: true,
      preflightCommitment: 'confirmed'
    });
  }

  public async getOrCreatesTokensAccounts(
    mintAccountsAddresses: { [P: string]: string },
    fromCoinMint: string,
    toCoinMint: string,
    owner: PublicKey,
    amountIn: number,
    transaction: Transaction,
    signers: Account[],
    skipToAccount: boolean = false
  ): Promise<TokenAccounts> {
    const fromNative = fromCoinMint === NATIVE_SOLANA_MINT_ADDRESS;
    const toNative = toCoinMint === NATIVE_SOLANA_MINT_ADDRESS;

    const fromTokenAccount = mintAccountsAddresses[fromCoinMint];
    const toTokenAccount = mintAccountsAddresses[toCoinMint];

    const fromAccount = {
      key: fromNative
        ? await this.createTokenAccountIfNotExist(
            null,
            owner,
            TOKENS.WSOL.mintAddress,
            new BigNumber(amountIn).plus(1e7, 16),
            transaction,
            signers
          )
        : await this.createAssociatedTokenAccountIfNotExist(
            fromTokenAccount,
            owner,
            fromCoinMint,
            transaction
          ),
      isWeth: fromNative
    };

    const toAccount = skipToAccount
      ? null
      : {
          key: toNative
            ? await this.createTokenAccountIfNotExist(
                null,
                owner,
                TOKENS.WSOL.mintAddress,
                new BigNumber(1e7, 16),
                transaction,
                signers
              )
            : await this.createAssociatedTokenAccountIfNotExist(
                toTokenAccount,
                owner,
                toCoinMint,
                transaction
              ),
          isWeth: toNative
        };

    return { from: fromAccount, to: toAccount };
  }

  public async getTokenAccounts(address: string): Promise<{ [P: string]: string }> {
    const parsedTokenAccounts = await this._connection.getParsedTokenAccountsByOwner(
      new PublicKey(address),
      { programId: TOKEN_PROGRAM_ID },
      'confirmed'
    );

    const mintAccountAddresses = parsedTokenAccounts.value.map(el => {
      const tokenAccountPubkey = el.pubkey;
      const tokenAccountAddress = tokenAccountPubkey.toBase58();
      const parsedInfo = el.account.data.parsed.info;
      const mintAddress = parsedInfo.mint;
      return [mintAddress, tokenAccountAddress];
    });

    return Object.fromEntries(mintAccountAddresses);
  }

  public mergeTransactions(transactions: (Transaction | undefined)[]): Transaction {
    const transaction = new Transaction();
    transactions
      .filter((t): t is Transaction => t !== undefined)
      .forEach(t => {
        transaction.add(t);
      });
    return transaction;
  }

  public async getMintDecimals(mint: PublicKey): Promise<number> {
    const { data } = SolanaWeb3PrivateService.throwIfNull(
      await this._connection.getAccountInfo(mint),
      'mint not found'
    );
    const { decimals } = MINT_LAYOUT.decode(data);
    return decimals;
  }

  public async getFilteredTokenAccountsByOwner(
    programId: PublicKey,
    mint: PublicKey
  ): Promise<{ context: {}; value: [] }> {
    // @ts-ignore
    const resp = await this._connection._rpcRequest('getTokenAccountsByOwner', [
      programId.toBase58(),
      {
        mint: mint.toBase58()
      },
      {
        encoding: 'jsonParsed'
      }
    ]);
    if (resp.error) {
      throw new Error(resp.error.message);
    }
    return resp.result;
  }

  public async getRecentPerformanceSamples(limit?: number): Promise<PerfSample[]> {
    return this._connection.getRecentPerformanceSamples(limit);
  }
}
