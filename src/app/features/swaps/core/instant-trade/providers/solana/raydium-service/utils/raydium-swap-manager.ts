import InstantTradeToken from '@features/swaps/features/instant-trade/models/instant-trade-token';
import BigNumber from 'bignumber.js';
import InstantTrade from '@features/swaps/features/instant-trade/models/instant-trade';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { LiquidityPoolInfo } from '@features/swaps/core/instant-trade/providers/solana/raydium-service/models/pools';
// @ts-ignore
import { nu64, struct, u8 } from 'buffer-layout';
import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { closeAccount } from '@project-serum/serum/lib/token-instructions';
import { DATA_LAYOUT } from '@features/swaps/core/instant-trade/providers/solana/raydium-service/models/structure';
import { TOKEN_PROGRAM_ID } from '@features/swaps/core/instant-trade/providers/solana/raydium-service/models/accounts';
import { SolanaWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-private.service';
import { SolanaWeb3Public } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-public';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { List } from 'immutable';
import {
  NATIVE_SOL,
  TOKENS
} from '@features/swaps/core/instant-trade/providers/solana/raydium-service/models/tokens';
import { NATIVE_SOLANA_MINT_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import { PreparedSwapParams } from '@features/swaps/core/instant-trade/providers/solana/raydium-service/models/prepared-swap-params';
import { TokenAccounts } from '@features/swaps/core/instant-trade/providers/solana/raydium-service/models/token-accounts';
import { subtractPercent } from '@shared/utils/utils';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { RaydiumStableManager } from '@features/swaps/core/instant-trade/providers/solana/raydium-service/utils/raydium-stable-manager';
import { SwapOutAmount } from '@features/swaps/core/instant-trade/providers/solana/raydium-service/models/swap-out-amount';
import { RaydiumTokenAmount } from '@features/swaps/core/instant-trade/providers/solana/raydium-service/models/raydium-token-amount';
import { RaydiumRouterManager } from '@features/swaps/core/instant-trade/providers/solana/raydium-service/utils/raydium-router-manager';
import { BaseTransaction } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-types';

export class RaydiumSwapManager {
  public static getSwapOutAmount(
    poolInfo: LiquidityPoolInfo,
    fromCoinMint: string,
    toCoinMint: string,
    amount: string,
    slippage: number
  ): SwapOutAmount {
    const { coin, pc, fees } = poolInfo;
    const { swapFeeNumerator, swapFeeDenominator } = fees;
    const coinMint =
      coin.mintAddress === NATIVE_SOL.mintAddress ? NATIVE_SOLANA_MINT_ADDRESS : coin.mintAddress;
    const toMint =
      pc.mintAddress === NATIVE_SOL.mintAddress ? NATIVE_SOLANA_MINT_ADDRESS : pc.mintAddress;

    if (fromCoinMint === coinMint && toCoinMint === toMint) {
      // coin2pc
      const fromAmount = new RaydiumTokenAmount(amount, coin.decimals, false);
      const fromAmountWithFee = fromAmount.wei
        .multipliedBy(swapFeeDenominator - swapFeeNumerator)
        .dividedBy(swapFeeDenominator);

      const denominator = coin.balance.plus(fromAmountWithFee);
      const amountOut = pc.balance.multipliedBy(fromAmountWithFee).dividedBy(denominator);
      const amountOutWithSlippage = amountOut.dividedBy(1 + slippage / 100);

      const outBalance = pc.balance.minus(amountOut);
      const beforePrice = new RaydiumTokenAmount(
        parseFloat(new RaydiumTokenAmount(pc.balance, pc.decimals).fixed()) /
          parseFloat(new RaydiumTokenAmount(coin.balance, coin.decimals).fixed()),
        pc.decimals,
        false
      );
      const afterPrice = new RaydiumTokenAmount(
        parseFloat(new RaydiumTokenAmount(outBalance, pc.decimals).fixed()) /
          parseFloat(new RaydiumTokenAmount(denominator, coin.decimals).fixed()),
        pc.decimals,
        false
      );
      const priceImpact =
        Math.abs(
          (parseFloat(beforePrice.fixed()) - parseFloat(afterPrice.fixed())) /
            parseFloat(beforePrice.fixed())
        ) * 100;

      return {
        amountIn: fromAmount.toWei(),
        amountOut: new RaydiumTokenAmount(amountOut, pc.decimals)
          .toWei()
          .dividedBy(10 ** pc.decimals),
        amountOutWithSlippage: new RaydiumTokenAmount(amountOutWithSlippage, pc.decimals)
          .toWei()
          .dividedBy(10 ** pc.decimals),
        priceImpact
      };
    }
    // pc2coin
    const fromAmount = new RaydiumTokenAmount(amount, pc.decimals, false);
    const fromAmountWithFee = fromAmount.wei
      .multipliedBy(swapFeeDenominator - swapFeeNumerator)
      .dividedBy(swapFeeDenominator);

    const denominator = pc.balance.plus(fromAmountWithFee);
    const amountOut = coin.balance.multipliedBy(fromAmountWithFee).dividedBy(denominator);
    const amountOutWithSlippage = amountOut.dividedBy(1 + slippage / 100);

    const outBalance = coin.balance.minus(amountOut);

    const beforePrice = new RaydiumTokenAmount(
      parseFloat(new RaydiumTokenAmount(pc.balance, pc.decimals).fixed()) /
        parseFloat(new RaydiumTokenAmount(coin.balance, coin.decimals).fixed()),
      pc.decimals,
      false
    );
    const afterPrice = new RaydiumTokenAmount(
      parseFloat(new RaydiumTokenAmount(denominator, pc.decimals).fixed()) /
        parseFloat(new RaydiumTokenAmount(outBalance, coin.decimals).fixed()),
      pc.decimals,
      false
    );
    const priceImpact =
      Math.abs(
        (parseFloat(afterPrice.fixed()) - parseFloat(beforePrice.fixed())) /
          parseFloat(beforePrice.fixed())
      ) * 100;

    return {
      amountIn: fromAmount.toWei(),
      amountOut: new RaydiumTokenAmount(amountOut, coin.decimals)
        .toWei()
        .dividedBy(10 ** coin.decimals),
      amountOutWithSlippage: new RaydiumTokenAmount(amountOutWithSlippage, coin.decimals)
        .toWei()
        .dividedBy(10 ** coin.decimals),
      priceImpact
    };
  }

  private static closeWethAccounts(
    accounts: TokenAccounts,
    instructions: TransactionInstruction[],
    owner: PublicKey
  ): void {
    if (accounts.from.isWeth) {
      instructions.push(
        closeAccount({
          source: accounts.from.key,
          destination: owner,
          owner
        })
      );
    }
    if (accounts.to.isWeth) {
      instructions.push(
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

  public static async prepareSwapParams(
    address: string,
    fromDec: number,
    toDec: number,
    aIn: BigNumber,
    aOut: BigNumber,
    privateBlockchainAdapter: SolanaWeb3PrivateService
  ): Promise<PreparedSwapParams> {
    const { owner, setupInstructions, tradeInstructions, signers } =
      SolanaWeb3Public.createBaseSwapInformation(address);

    const mintAccountsAddresses = await privateBlockchainAdapter.getTokenAccounts(address);
    const fromDecimals = new BigNumber(10).exponentiatedBy(fromDec);
    const amountIn = aIn.multipliedBy(fromDecimals);
    const toDecimals = new BigNumber(10).exponentiatedBy(toDec);
    const amountOut = aOut.multipliedBy(toDecimals);

    return {
      owner,
      setupInstructions,
      tradeInstructions,
      signers,
      mintAccountsAddresses,
      amountIn,
      amountOut
    };
  }

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

  private static createSwapStableBaseInInstruction(
    programId: PublicKey,
    // amm
    ammId: PublicKey,
    ammAuthority: PublicKey,
    ammOpenOrders: PublicKey,
    poolCoinTokenAccount: PublicKey,
    poolPcTokenAccount: PublicKey,
    modelDataAccount: PublicKey,
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
    const dataLayout = struct([u8('instruction'), nu64('amountIn'), nu64('minAmountOut')]);

    const keys = [
      // spl token
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      // amm
      { pubkey: ammId, isSigner: false, isWritable: true },
      { pubkey: ammAuthority, isSigner: false, isWritable: false },
      { pubkey: ammOpenOrders, isSigner: false, isWritable: true },
      { pubkey: poolCoinTokenAccount, isSigner: false, isWritable: true },
      { pubkey: poolPcTokenAccount, isSigner: false, isWritable: true },
      { pubkey: modelDataAccount, isSigner: false, isWritable: false },
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

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly privateBlockchainAdapter: SolanaWeb3PrivateService,
    private readonly publicBlockchainAdapter: SolanaWeb3Public,
    private readonly connection: Connection
  ) {}

  public async createSwapTrade(
    poolInfos: LiquidityPoolInfo[],
    trade: InstantTrade,
    tokens: List<TokenAmount>,
    slippageTolerance: number
  ): Promise<BaseTransaction> {
    const [poolInfo] = poolInfos;
    const fromCoinMint = trade.from.token.address;
    const toCoinMint = trade.to.token.address;

    const {
      amountIn,
      amountOut,
      mintAccountsAddresses,
      owner,
      signers,
      setupInstructions,
      tradeInstructions
    } = await RaydiumSwapManager.prepareSwapParams(
      this.walletConnectorService.address,
      trade.from.token.decimals,
      trade.to.token.decimals,
      trade.from.amount,
      subtractPercent(trade.to.amount, slippageTolerance),
      this.privateBlockchainAdapter
    );

    const from = tokens.find(el => el.address === fromCoinMint);
    const to = tokens.find(el => el.address === toCoinMint);

    if (!from || !to) {
      throw new Error('Miss token info');
    }

    const wsolAddress = mintAccountsAddresses[TOKENS.WSOL.mintAddress];
    if (fromCoinMint === NATIVE_SOLANA_MINT_ADDRESS && wsolAddress) {
      setupInstructions.push(
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
        fromCoinMint,
        toCoinMint,
        owner,
        fromFinalAmount,
        setupInstructions,
        signers
      );

    tradeInstructions.push(
      poolInfo.version === 5
        ? RaydiumSwapManager.createSwapStableBaseInInstruction(
            new PublicKey(poolInfo.programId),
            new PublicKey(poolInfo.ammId),
            new PublicKey(poolInfo.ammAuthority),
            new PublicKey(poolInfo.ammOpenOrders),
            new PublicKey(poolInfo.poolCoinTokenAccount),
            new PublicKey(poolInfo.poolPcTokenAccount),
            new PublicKey(poolInfo.modelDataAccount),
            new PublicKey(poolInfo.serumProgramId),
            new PublicKey(poolInfo.serumMarket),
            new PublicKey(poolInfo.serumBids),
            new PublicKey(poolInfo.serumAsks),
            new PublicKey(poolInfo.serumEventQueue),
            new PublicKey(poolInfo.serumCoinVaultAccount),
            new PublicKey(poolInfo.serumPcVaultAccount),
            new PublicKey(poolInfo?.serumVaultSigner || NATIVE_SOL.mintAddress),
            fromAccount.key,
            toAccount.key,
            owner,
            fromFinalAmount,
            toFinalAmount
          )
        : RaydiumSwapManager.createSwapInstruction(
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
            new PublicKey(poolInfo?.serumVaultSigner || NATIVE_SOL.mintAddress),
            fromAccount.key,
            toAccount.key,
            owner,
            fromFinalAmount,
            toFinalAmount
          )
    );
    RaydiumSwapManager.closeWethAccounts(
      { from: fromAccount, to: toAccount },
      tradeInstructions,
      owner
    );

    return SolanaWeb3Public.createTransactions(setupInstructions, tradeInstructions, signers);
  }

  public async addTransactionMeta(transaction: Transaction, address: string): Promise<void> {
    transaction.feePayer = new PublicKey(address) || undefined;
    transaction.recentBlockhash = (
      await this.connection?.getRecentBlockhash('finalized')
    )?.blockhash;
  }

  public calculateSwap(
    directPoolInfos: LiquidityPoolInfo[],
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken,
    slippageTolerance: number,
    routerManager: RaydiumRouterManager
  ): {
    amountOut: BigNumber;
    priceImpact: number;
    poolInfo: [LiquidityPoolInfo];
  } {
    const { amountOut, priceImpact, bestRoute, poolInfo } = directPoolInfos.reduce(
      (acc, pool, index) => {
        const { amountOut: poolAmountOut, priceImpact: poolPriceImpact } =
          pool.version === 5
            ? RaydiumStableManager.getSwapOutAmountStable(
                pool,
                fromToken.address,
                toToken.address,
                fromAmount.toString(),
                slippageTolerance
              )
            : RaydiumSwapManager.getSwapOutAmount(
                pool,
                fromToken.address,
                toToken.address,
                fromAmount.toString(),
                slippageTolerance
              );
        if (poolAmountOut.gt(acc.amountOut)) {
          return {
            amountOut: poolAmountOut,
            priceImpact: poolPriceImpact,
            bestRoute: index,
            poolInfo: [pool]
          };
        }
        return acc;
      },
      {
        amountOut: new BigNumber(0),
        priceImpact: 100,
        bestRoute: 0,
        poolInfo: null
      }
    );

    routerManager.currentPoolInfo = directPoolInfos[bestRoute];
    return { amountOut, priceImpact, poolInfo };
  }
}
