import {
  Account,
  AccountInfo,
  Commitment,
  Connection,
  ParsedAccountData,
  PerfSample,
  PublicKey,
  Signer,
  SystemProgram,
  Transaction,
  TransactionInstruction
} from '@solana/web3.js';
import { Token } from '@solana/spl-token';
import { initializeAccount } from '@project-serum/serum/lib/token-instructions';
import { ACCOUNT_LAYOUT } from '@features/swaps/core/instant-trade/providers/solana/raydium-service/models/structure';
import {
  AT_PROGRAM_ID,
  RENT_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from '@features/swaps/core/instant-trade/providers/solana/raydium-service/models/accounts';
import { TOKENS } from '@features/swaps/core/instant-trade/providers/solana/raydium-service/models/tokens';
import BigNumber from 'bignumber.js';
import { Layout } from '@project-serum/borsh';
import { Injectable } from '@angular/core';
import { NATIVE_SOLANA_MINT_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import { TokenAccounts } from '@features/swaps/core/instant-trade/providers/solana/raydium-service/models/token-accounts';
import { HttpService } from '@core/services/http/http.service';
import {
  AccountsRpcRequest,
  ProgramAccounts
} from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-types';
import { Cacheable } from 'ts-cacheable';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

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

  constructor(private readonly httpService: HttpService) {}

  /**
   * Looking for program address based on seeds.
   * @param seeds Seeds which are using for address finding.
   * @param programId Program identificator.
   */
  public async findProgramAddress(
    seeds: Array<Buffer | Uint8Array>,
    programId: PublicKey
  ): Promise<{ publicKey: PublicKey; nonce: number }> {
    const [publicKey, nonce] = await PublicKey.findProgramAddress(seeds, programId);
    return { publicKey, nonce };
  }

  /**
   * Creates a PDA address, which can sign instructions.
   * @param programId
   */
  public async createAmmAuthority(
    programId: PublicKey
  ): Promise<{ publicKey: PublicKey; nonce: number }> {
    return await this.findProgramAddress(
      [new Uint8Array(Buffer.from('amm authority'.replace('\u00A0', ' '), 'utf-8'))],
      programId
    );
  }

  /**
   * Finds the associated token account address.
   * @param walletAddress
   * @param tokenMintAddress
   */
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

  /**
   * Creates the token account if not exists.
   * @param account Accounts to check existence.
   * @param owner Owner account.
   * @param mintAddress Token mint address.
   * @param lamports Amount of lamports to pay network fee.
   * @param instructions Transaction which stores the token creation instruction.
   * @param signers Array of accounts which can sign transaction.
   */
  public async createTokenAccountIfNotExist(
    account: string | undefined | null,
    owner: PublicKey,
    mintAddress: string,
    lamports: BigNumber,
    instructions: TransactionInstruction[],
    signers: Signer[]
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
        instructions,
        signers
      );

      instructions.push(
        initializeAccount({
          account: publicKey,
          mint: new PublicKey(mintAddress),
          owner
        })
      );
    }

    return publicKey;
  }

  /**
   * Create the associated token account if not exists.
   * @param account Accounts to check existence.
   * @param owner Owner account.
   * @param mintAddress Token mint address.
   * @param instructions The token creation instructions.
   * @param atas Associated token accounts.
   */
  public async createAssociatedTokenAccountIfNotExist(
    owner: PublicKey,
    mintAddress: string,
    instructions: TransactionInstruction[],
    atas: string[] = []
  ): Promise<PublicKey> {
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
      instructions.push(
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

  /**
   * Creates associated SOL account and wrap tokens to wrapped version.
   * @param account Token account.
   * @param owner Owner account.
   * @param instructions Token creation and wrap instructions.
   * @param signers Array of accounts which can sign transaction.
   * @param amount Amount of tokens to wrap.
   */
  public async createAtaSolIfNotExistAndWrap(
    account: string | undefined | null,
    owner: PublicKey,
    instructions: TransactionInstruction[],
    signers: Signer[],
    amount: number
  ): Promise<void> {
    let publicKey;
    if (account) {
      publicKey = new PublicKey(account);
    }
    const mint = new PublicKey(TOKENS.WSOL.mintAddress);
    const ata = await Token.getAssociatedTokenAddress(
      AT_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      mint,
      owner,
      true
    );
    if (!publicKey) {
      const rent = await Token.getMinBalanceRentForExemptAccount(this._connection);
      instructions.push(
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
        new BigNumber(amount).plus(rent),
        instructions,
        signers
      );
      instructions.push(
        Token.createTransferInstruction(TOKEN_PROGRAM_ID, wsol, ata, owner, [], amount),
        Token.createCloseAccountInstruction(TOKEN_PROGRAM_ID, wsol, owner, owner, [])
      );
    }
  }

  /**
   * Create the program account if not exists.
   * @param account Accounts to check existence.
   * @param owner Owner account.
   * @param programId Program Identifier account.
   * @param lamports Amount of lamports to pay network fee.
   * @param layout Creation layout to decode and encode operation from blockchain.
   * @param instructions Token creation instructions.
   * @param signers Array of accounts which can sign transaction.
   */
  public async createProgramAccountIfNotExist(
    account: string | undefined | null,
    owner: PublicKey,
    programId: PublicKey,
    lamports: number | null,
    layout: Layout<unknown>,
    instructions: TransactionInstruction[],
    signers: Signer[]
  ): Promise<PublicKey> {
    let publicKey;

    if (account) {
      publicKey = new PublicKey(account);
    } else {
      const newAccount = new Account();
      publicKey = newAccount.publicKey;

      instructions.push(
        SystemProgram.createAccount({
          fromPubkey: owner,
          newAccountPubkey: publicKey,
          lamports,
          space: layout.span,
          programId
        })
      );

      signers.push(newAccount);
    }

    return publicKey;
  }

  /**
   * Creates the associated token account.
   * @param tokenMintAddress Token mint address.
   * @param owner Owner account.
   * @param transaction Transaction which stores the token creation instruction.
   */
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

  /**
   * Gets program accounts based on filters.
   * @param programId Program Identifier.
   * @param filters Params to filter accounts.
   */
  public async getFilteredProgramAccounts(
    programId: PublicKey,
    filters: unknown
  ): Promise<{ publicKey: PublicKey; accountInfo: AccountInfo<Buffer> }[]> {
    const connection = this._connection as Connection & AccountsRpcRequest<ProgramAccounts[]>;
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

  /**
   * Gets program accounts for AMM or Market based on filters.
   * @param cacheName Request cache name, AMM or Market.
   * @param programId Program Identifier.
   * @param filters Params to filter accounts.
   */
  @Cacheable({ maxAge: 60_000 })
  public getFilteredProgramAccountsAmmOrMarketCache(
    cacheName: String,
    programId: PublicKey,
    filters: unknown
  ): Observable<{ publicKey: PublicKey; accountInfo: AccountInfo<Buffer> }[]> {
    try {
      if (!cacheName) {
        throw new Error('cacheName error');
      }
      return this.httpService
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
        }>(null, null, `https://api.raydium.io/cache/rpc/${cacheName}`)
        .pipe(
          map(cache => {
            return cache.result.map(
              ({ pubkey, account: { data, executable, owner, lamports } }) => ({
                publicKey: new PublicKey(pubkey),
                accountInfo: {
                  data: Buffer.from(data[0], 'base64'),
                  executable,
                  owner: new PublicKey(owner),
                  lamports
                }
              })
            );
          })
        );
    } catch (e) {
      return from(this.getFilteredProgramAccounts(programId, filters));
    }
  }

  /**
   * Gets information about accounts.
   * @param publicKeys Array of accounts to find information about.
   * @param commitment The level of commitment desired when querying state.
   */
  public async getMultipleAccounts(
    publicKeys: PublicKey[],
    commitment?: Commitment
  ): Promise<{ publicKey: PublicKey; account: AccountInfo<Buffer | ParsedAccountData> }[]> {
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

    const resArray: { [key: number]: AccountInfo<Buffer | null>[] } = await Promise.all(
      keys.map(key => {
        return this._connection.getMultipleAccountsInfo(key, commitment || 'finalized');
      })
    );

    const accounts: Array<null | AccountInfo<Buffer | null>> = Object.keys(resArray)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(itemIndex => resArray[parseInt(itemIndex)])
      .flat();

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

  /**
   * Gets or create accounts for from and to trade tokens.
   * @param fromCoinMint From token mint address.
   * @param toCoinMint To token mint address.
   * @param owner Owner account.
   * @param amountIn Amount in.
   * @param instructions Instructions.
   * @param signers Array of signers.
   * @param skipToAccount Get and create account for pair the of tokens or just for from token.
   */
  public async getOrCreatesTokensAccounts(
    fromCoinMint: string,
    toCoinMint: string,
    owner: PublicKey,
    amountIn: number,
    instructions: TransactionInstruction[],
    signers: Signer[],
    skipToAccount: boolean = false
  ): Promise<TokenAccounts> {
    const fromNative = fromCoinMint === NATIVE_SOLANA_MINT_ADDRESS;
    const toNative = toCoinMint === NATIVE_SOLANA_MINT_ADDRESS;

    const rent = await Token.getMinBalanceRentForExemptAccount(this._connection);

    const fromAccount = {
      key: fromNative
        ? await this.createTokenAccountIfNotExist(
            null,
            owner,
            TOKENS.WSOL.mintAddress,
            new BigNumber(amountIn).plus(rent),
            instructions,
            signers
          )
        : await this.createAssociatedTokenAccountIfNotExist(owner, fromCoinMint, instructions),
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
                new BigNumber(rent),
                instructions,
                signers
              )
            : await this.createAssociatedTokenAccountIfNotExist(owner, toCoinMint, instructions),
          isWeth: toNative
        };

    return { from: fromAccount, to: toAccount };
  }

  /**
   * Gets accounts for exact token.
   * @param address Token address.
   */
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

  /**
   * Gets recent Solana performance samples (TPS)
   * @param limit Limit of samples.
   */
  public async getRecentPerformanceSamples(limit?: number): Promise<PerfSample[]> {
    return this._connection.getRecentPerformanceSamples(limit);
  }
}
