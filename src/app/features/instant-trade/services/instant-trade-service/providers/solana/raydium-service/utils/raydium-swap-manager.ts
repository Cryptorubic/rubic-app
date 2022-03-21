import InstantTradeToken from '@features/instant-trade/models/instant-trade-token';
import BigNumber from 'bignumber.js';
import InstantTrade from '@features/instant-trade/models/instant-trade';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { LiquidityPoolInfo } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/pools';
// @ts-ignore
import { nu64, struct, u8 } from 'buffer-layout';
import {
  Account,
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction
} from '@solana/web3.js';
import { closeAccount } from '@project-serum/serum/lib/token-instructions';
import { DATA_LAYOUT } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/structure';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  LIQUIDITY_POOL_PROGRAM_ID_V4,
  ROUTE_SWAP_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/accounts';
import { SolanaWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-private.service';
import { SolanaWeb3Public } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-public';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { List } from 'immutable';
import { TOKENS } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/tokens';
import { Token } from '@solana/spl-token';
import { NATIVE_SOLANA_MINT_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import { PreparedSwapParams } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/prepared-swap-params';
import { TokenAccounts } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/token-accounts';
import { RaydiumRouterInfo } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/raydium-router-info';

export class RaydiumSwapManager {
  constructor(
    private readonly privateBlockchainAdapter: SolanaWeb3PrivateService,
    private readonly publicBlockchainAdapter: SolanaWeb3Public,
    private readonly connection: Connection
  ) {}

  public static getInstantTradeInfo(
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken,
    fromAmount: BigNumber,
    toAmount: BigNumber,
    middleToken?: {
      address: string;
      symbol: string;
    }
  ): InstantTrade {
    return {
      blockchain: BLOCKCHAIN_NAME.SOLANA,
      from: {
        token: fromToken,
        amount: fromAmount
      },
      to: {
        token: toToken,
        amount: toAmount
      },
      path: !middleToken
        ? [
            {
              address: fromToken.address,
              symbol: fromToken.symbol
            },
            {
              address: toToken.address,
              symbol: toToken.symbol
            }
          ]
        : [
            {
              address: fromToken.address,
              symbol: fromToken.symbol
            },
            {
              address: middleToken.address,
              symbol: middleToken.symbol
            },
            {
              address: toToken.address,
              symbol: toToken.symbol
            }
          ]
    };
  }

  public async createRouteSwap(
    poolInfoA: LiquidityPoolInfo,
    poolInfoB: LiquidityPoolInfo,
    routerInfo: RaydiumRouterInfo,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken,
    aIn: BigNumber,
    aOut: BigNumber,
    address: string,
    fromDec: number,
    toDec: number
  ): Promise<{ transaction: Transaction; signers: Account[] }> {
    const { amountIn, amountOut, mintAccountsAddresses, owner, transaction, signers } =
      await this.prepareSwapParams(address, fromDec, toDec, aIn, aOut);

    const fromMint = fromToken.address;
    const toMint = toToken.address;
    const middleMint = routerInfo.middleCoin.address;

    const fromFinalAmount = Math.floor(parseFloat(amountIn.toString()));
    const middleFinalAmount = Math.floor(parseFloat(routerInfo.route[1].amountA.toString()));
    const toFinalAmount = Math.floor(parseFloat(amountOut.toString()));

    const { from: fromAccount } = await this.privateBlockchainAdapter.getOrCreatesTokensAccounts(
      mintAccountsAddresses,
      fromMint,
      middleMint,
      owner,
      fromFinalAmount,
      transaction,
      signers
    );

    const { from: middleAccount, to: toAccount } =
      await this.privateBlockchainAdapter.getOrCreatesTokensAccounts(
        mintAccountsAddresses,
        middleMint,
        toMint,
        owner,
        middleFinalAmount,
        transaction,
        signers
      );

    const newFromTokenAccount = fromAccount.key;
    const newMiddleTokenAccount = middleAccount.key;
    const newToTokenAccount = toAccount.key;

    const { publicKey } = await this.privateBlockchainAdapter.findProgramAddress(
      [
        new PublicKey(poolInfoA.ammId).toBuffer(),
        new PublicKey(middleMint).toBuffer(),
        owner.toBuffer()
      ],
      new PublicKey(ROUTE_SWAP_PROGRAM_ID)
    );

    transaction.add(
      RaydiumSwapManager.createRouteSwapInInstruction(
        new PublicKey(ROUTE_SWAP_PROGRAM_ID),
        new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4),
        new PublicKey(poolInfoA.ammId),
        new PublicKey(poolInfoB.ammId),
        new PublicKey(poolInfoA.ammAuthority),
        new PublicKey(poolInfoA.ammOpenOrders),
        new PublicKey(poolInfoA.ammTargetOrders),
        new PublicKey(poolInfoA.poolCoinTokenAccount),
        new PublicKey(poolInfoA.poolPcTokenAccount),
        new PublicKey(poolInfoA.serumProgramId),
        new PublicKey(poolInfoA.serumMarket),
        new PublicKey(poolInfoA.serumBids),
        new PublicKey(poolInfoA.serumAsks),
        new PublicKey(poolInfoA.serumEventQueue),
        new PublicKey(poolInfoA.serumCoinVaultAccount),
        new PublicKey(poolInfoA.serumPcVaultAccount),
        new PublicKey(poolInfoA.serumVaultSigner),
        newFromTokenAccount,
        newMiddleTokenAccount,
        publicKey,
        owner,
        fromFinalAmount,
        toFinalAmount
      ),
      RaydiumSwapManager.createRouteSwapOutInstruction(
        new PublicKey(ROUTE_SWAP_PROGRAM_ID),
        new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4),
        new PublicKey(poolInfoA.ammId),
        new PublicKey(poolInfoB.ammId),
        new PublicKey(poolInfoB.ammAuthority),
        new PublicKey(poolInfoB.ammOpenOrders),
        new PublicKey(poolInfoB.poolCoinTokenAccount),
        new PublicKey(poolInfoB.poolPcTokenAccount),
        new PublicKey(poolInfoB.serumProgramId),
        new PublicKey(poolInfoB.serumMarket),
        new PublicKey(poolInfoB.serumBids),
        new PublicKey(poolInfoB.serumAsks),
        new PublicKey(poolInfoB.serumEventQueue),
        new PublicKey(poolInfoB.serumCoinVaultAccount),
        new PublicKey(poolInfoB.serumPcVaultAccount),
        new PublicKey(poolInfoB.serumVaultSigner),
        newMiddleTokenAccount,
        newToTokenAccount,
        publicKey,
        owner
      )
    );
    return { transaction, signers };
  }

  private static createRouteSwapOutInstruction(
    programId: PublicKey,
    ammProgramId: PublicKey,
    fromAmmId: PublicKey,
    toAmmId: PublicKey,
    ammAuthority: PublicKey,
    ammOpenOrders: PublicKey,
    poolCoinTokenAccount: PublicKey,
    poolPcTokenAccount: PublicKey,
    // serum
    serumProgramId: PublicKey,
    serumMarket: PublicKey,
    serumBids: PublicKey,
    serumAsks: PublicKey,
    serumEventQueue: PublicKey,
    serumCoinVaultAccount: PublicKey,
    serumPcVaultAccount: PublicKey,
    serumVaultSigner: PublicKey,
    // user
    userMiddleTokenAccount: PublicKey,
    userDestTokenAccount: PublicKey,
    userPdaAccount: PublicKey,
    userOwner: PublicKey
  ): TransactionInstruction {
    const keys = [
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },

      // amm
      { pubkey: ammProgramId, isSigner: false, isWritable: false },
      { pubkey: fromAmmId, isSigner: false, isWritable: true },
      { pubkey: toAmmId, isSigner: false, isWritable: true },
      { pubkey: ammAuthority, isSigner: false, isWritable: false },
      { pubkey: ammOpenOrders, isSigner: false, isWritable: true },
      // { pubkey: ammTargetOrders, isSigner: false, isWritable: true },
      { pubkey: poolCoinTokenAccount, isSigner: false, isWritable: true },
      { pubkey: poolPcTokenAccount, isSigner: false, isWritable: true },
      // serum
      { pubkey: serumProgramId, isSigner: false, isWritable: false },
      { pubkey: serumMarket, isSigner: false, isWritable: true },
      { pubkey: serumBids, isSigner: false, isWritable: true },
      { pubkey: serumAsks, isSigner: false, isWritable: true },
      { pubkey: serumEventQueue, isSigner: false, isWritable: true },
      { pubkey: serumCoinVaultAccount, isSigner: false, isWritable: true },
      { pubkey: serumPcVaultAccount, isSigner: false, isWritable: true },
      { pubkey: serumVaultSigner, isSigner: false, isWritable: false },

      { pubkey: userMiddleTokenAccount, isSigner: false, isWritable: true },
      { pubkey: userDestTokenAccount, isSigner: false, isWritable: true },
      { pubkey: userPdaAccount, isSigner: false, isWritable: true },
      { pubkey: userOwner, isSigner: true, isWritable: false }
    ];

    const dataLayout = struct([u8('instruction')]);
    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode({ instruction: 1 }, data);

    return new TransactionInstruction({
      keys,
      programId,
      data
    });
  }

  private static createRouteSwapInInstruction(
    programId: PublicKey,
    ammProgramId: PublicKey,
    fromAmmId: PublicKey,
    toAmmId: PublicKey,
    ammAuthority: PublicKey,
    ammOpenOrders: PublicKey,
    _ammTargetOrders: PublicKey,
    poolCoinTokenAccount: PublicKey,
    poolPcTokenAccount: PublicKey,
    // serum

    serumProgramId: PublicKey,
    serumMarket: PublicKey,
    serumBids: PublicKey,
    serumAsks: PublicKey,
    serumEventQueue: PublicKey,
    serumCoinVaultAccount: PublicKey,
    serumPcVaultAccount: PublicKey,
    serumVaultSigner: PublicKey,

    // user
    userSourceTokenAccount: PublicKey,
    userMiddleTokenAccount: PublicKey,
    userPdaAccount: PublicKey,
    userOwner: PublicKey,

    // amounts
    amountIn: number,
    minimumAmountOut: number
  ): TransactionInstruction {
    const keys = [
      { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
      // spl token
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      // amm
      { pubkey: ammProgramId, isSigner: false, isWritable: false },
      { pubkey: fromAmmId, isSigner: false, isWritable: true },
      { pubkey: toAmmId, isSigner: false, isWritable: true },
      { pubkey: ammAuthority, isSigner: false, isWritable: false },
      { pubkey: ammOpenOrders, isSigner: false, isWritable: true },
      { pubkey: poolCoinTokenAccount, isSigner: false, isWritable: true },
      { pubkey: poolPcTokenAccount, isSigner: false, isWritable: true },
      // serum
      { pubkey: serumProgramId, isSigner: false, isWritable: false },
      { pubkey: serumMarket, isSigner: false, isWritable: true },
      { pubkey: serumBids, isSigner: false, isWritable: true },
      { pubkey: serumAsks, isSigner: false, isWritable: true },
      { pubkey: serumEventQueue, isSigner: false, isWritable: true },
      { pubkey: serumCoinVaultAccount, isSigner: false, isWritable: true },
      { pubkey: serumPcVaultAccount, isSigner: false, isWritable: true },
      { pubkey: serumVaultSigner, isSigner: false, isWritable: false },
      // user
      { pubkey: userSourceTokenAccount, isSigner: false, isWritable: true },
      { pubkey: userMiddleTokenAccount, isSigner: false, isWritable: true },
      { pubkey: userPdaAccount, isSigner: false, isWritable: true },
      { pubkey: userOwner, isSigner: true, isWritable: false }
    ];

    const dataLayout = struct([u8('instruction'), nu64('amountIn'), nu64('minimumAmountOut')]);
    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        instruction: 0,
        amountIn,
        minimumAmountOut
      },
      data
    );

    return new TransactionInstruction({
      keys,
      programId,
      data
    });
  }

  public async createSwapTransaction(
    poolInfo: LiquidityPoolInfo,
    fromCoinMint: string,
    toCoinMint: string,
    aIn: BigNumber,
    aOut: BigNumber,
    fromDec: number,
    toDec: number,
    address: string,
    tokens: List<TokenAmount>
  ): Promise<{ transaction: Transaction; signers: Account[] }> {
    const { amountIn, amountOut, mintAccountsAddresses, owner, transaction, signers } =
      await this.prepareSwapParams(address, fromDec, toDec, aIn, aOut);

    const from = tokens.find(el => el.address === fromCoinMint);
    const to = tokens.find(el => el.address === toCoinMint);

    if (!from || !to) {
      throw new Error('Miss token info');
    }

    const wsolAddress = mintAccountsAddresses[TOKENS.WSOL.mintAddress];
    if (fromCoinMint === NATIVE_SOLANA_MINT_ADDRESS && wsolAddress) {
      transaction.add(
        closeAccount({
          source: new PublicKey(wsolAddress),
          destination: owner,
          owner
        })
      );
    }

    const fromFinalAmount = Math.floor(parseFloat(amountIn.toString()));
    const toFinalAmount = Math.floor(parseFloat(amountOut.toString()));

    const { from: fromAccount, to: toAccount } =
      await this.privateBlockchainAdapter.getOrCreatesTokensAccounts(
        mintAccountsAddresses,
        fromCoinMint,
        toCoinMint,
        owner,
        fromFinalAmount,
        transaction,
        signers
      );

    transaction.add(
      RaydiumSwapManager.createSwapInstruction(
        new PublicKey(poolInfo.programId),
        new PublicKey(poolInfo.ammId),
        new PublicKey(poolInfo.ammAuthority),
        new PublicKey(poolInfo.ammOpenOrders),
        new PublicKey(poolInfo.ammTargetOrders),
        new PublicKey(poolInfo.poolCoinTokenAccount),
        new PublicKey(poolInfo.poolPcTokenAccount),
        new PublicKey(poolInfo.serumProgramId),
        new PublicKey(poolInfo.serumMarket),
        new PublicKey(poolInfo.serumBids),
        new PublicKey(poolInfo.serumAsks),
        new PublicKey(poolInfo.serumEventQueue),
        new PublicKey(poolInfo.serumCoinVaultAccount),
        new PublicKey(poolInfo.serumPcVaultAccount),
        new PublicKey(poolInfo.serumVaultSigner),
        fromAccount.key,
        toAccount.key,
        owner,
        fromFinalAmount,
        toFinalAmount
      )
    );
    RaydiumSwapManager.closeWethAccounts({ from: fromAccount, to: toAccount }, transaction, owner);

    return { transaction, signers };
  }

  private static closeWethAccounts(
    accounts: TokenAccounts,
    transaction: Transaction,
    owner: PublicKey
  ): void {
    if (accounts.from.isWeth) {
      transaction.add(
        closeAccount({
          source: accounts.from.key,
          destination: owner,
          owner
        })
      );
    }
    if (accounts.to.isWeth) {
      transaction.add(
        closeAccount({
          source: accounts.to.key,
          destination: owner,
          owner
        })
      );
    }
  }

  private static createSwapInstruction(
    programId: PublicKey,
    // tokenProgramId: PublicKey,
    // amm
    ammId: PublicKey,
    ammAuthority: PublicKey,
    ammOpenOrders: PublicKey,
    ammTargetOrders: PublicKey,
    poolCoinTokenAccount: PublicKey,
    poolPcTokenAccount: PublicKey,
    // serum
    serumProgramId: PublicKey,
    serumMarket: PublicKey,
    serumBids: PublicKey,
    serumAsks: PublicKey,
    serumEventQueue: PublicKey,
    serumCoinVaultAccount: PublicKey,
    serumPcVaultAccount: PublicKey,
    serumVaultSigner: PublicKey,
    // user
    userSourceTokenAccount: PublicKey,
    userDestTokenAccount: PublicKey,
    userOwner: PublicKey,

    amountIn: number,
    minAmountOut: number
  ): TransactionInstruction {
    const dataLayout = DATA_LAYOUT;

    const keys = [
      // spl token
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      // amm
      { pubkey: ammId, isSigner: false, isWritable: true },
      { pubkey: ammAuthority, isSigner: false, isWritable: false },
      { pubkey: ammOpenOrders, isSigner: false, isWritable: true },
      { pubkey: ammTargetOrders, isSigner: false, isWritable: true },
      { pubkey: poolCoinTokenAccount, isSigner: false, isWritable: true },
      { pubkey: poolPcTokenAccount, isSigner: false, isWritable: true },
      // serum
      { pubkey: serumProgramId, isSigner: false, isWritable: false },
      { pubkey: serumMarket, isSigner: false, isWritable: true },
      { pubkey: serumBids, isSigner: false, isWritable: true },
      { pubkey: serumAsks, isSigner: false, isWritable: true },
      { pubkey: serumEventQueue, isSigner: false, isWritable: true },
      { pubkey: serumCoinVaultAccount, isSigner: false, isWritable: true },
      { pubkey: serumPcVaultAccount, isSigner: false, isWritable: true },
      { pubkey: serumVaultSigner, isSigner: false, isWritable: false },
      { pubkey: userSourceTokenAccount, isSigner: false, isWritable: true },
      { pubkey: userDestTokenAccount, isSigner: false, isWritable: true },
      { pubkey: userOwner, isSigner: true, isWritable: false }
    ];

    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        instruction: 9,
        amountIn,
        minAmountOut
      },
      data
    );

    return new TransactionInstruction({
      keys,
      programId,
      data
    });
  }

  public async addTransactionMeta(transaction: Transaction, address: string): Promise<void> {
    transaction.feePayer = new PublicKey(address) || undefined;
    transaction.recentBlockhash = (
      await this.connection?.getRecentBlockhash('finalized')
    )?.blockhash;
  }

  public async unwrapSol(
    address: string
  ): Promise<{ transaction: Transaction; signers: Account[] }> {
    const { transaction, owner } = SolanaWeb3Public.createBaseInformation(address);
    const toPublicKey = new PublicKey(TOKENS.WSOL.mintAddress);
    const ata = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      toPublicKey,
      owner,
      true
    );

    transaction.add(
      closeAccount({
        source: new PublicKey(ata),
        destination: owner,
        owner
      })
    );

    return { transaction, signers: [] };
  }

  public async wrapSol(
    trade: InstantTrade,
    address: string,
    tokens: List<TokenAmount>
  ): Promise<{ transaction: Transaction; signers: Account[] }> {
    const { transaction, signers, owner } = SolanaWeb3Public.createBaseInformation(address);

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
      transaction,
      signers,
      fromFinalAmount
    );

    return { transaction, signers };
  }

  private async prepareSwapParams(
    address: string,
    fromDec: number,
    toDec: number,
    aIn: BigNumber,
    aOut: BigNumber
  ): Promise<PreparedSwapParams> {
    const { owner, transaction, signers } = SolanaWeb3Public.createBaseInformation(address);

    const mintAccountsAddresses = await this.privateBlockchainAdapter.getTokenAccounts(address);
    const fromDecimals = new BigNumber(10).exponentiatedBy(fromDec);
    const amountIn = new BigNumber(aIn.toString()).multipliedBy(fromDecimals);
    const toDecimals = new BigNumber(10).exponentiatedBy(toDec);
    const amountOut = new BigNumber(aOut.toString()).multipliedBy(toDecimals);

    return { owner, transaction, signers, mintAccountsAddresses, amountIn, amountOut };
  }
}
