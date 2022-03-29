import BigNumber from 'bignumber.js';
import { LiquidityPoolInfo } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/pools';
import InstantTradeToken from '@features/instant-trade/models/instant-trade-token';
import {
  NATIVE_SOL,
  WRAPPED_SOL
} from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/tokens';
import { RaydiumRouterInfo } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/raydium-router-info';
import { RaydiumStableManager } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/utils/raydium-stable-manager';
import { PublicKey, Signer, TransactionInstruction } from '@solana/web3.js';
import {
  LIQUIDITY_POOL_PROGRAM_ID_V4,
  LIQUIDITY_POOL_PROGRAM_ID_V5,
  ROUTE_SWAP_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/accounts';
import { SolanaWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-private.service';
// @ts-ignore
import { nu64, struct, u8 } from 'buffer-layout';
import InstantTrade from '@features/instant-trade/models/instant-trade';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { RaydiumSwapManager } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/utils/raydium-swap-manager';
import { RaydiumLiquidityManager } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/utils/raydium-liquidity-manager';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { List } from 'immutable';
import { NATIVE_SOLANA_MINT_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import { subtractPercent } from '@shared/utils/utils';
import { SolanaWeb3Public } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-public';
import { BaseTransaction } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-types';

export class RaydiumRouterManager {
  public static readonly transitTokens = ['USDC', 'wSOL', 'SOL', 'mSOL', 'RAY', 'PAI', 'USDT'];

  private _routerInfo: RaydiumRouterInfo;

  private stableSwapManager: RaydiumStableManager;

  public get routerInfo(): RaydiumRouterInfo {
    return this._routerInfo;
  }

  private set routerInfo(value: RaydiumRouterInfo) {
    this._routerInfo = value;
  }

  private _currentPoolInfo: LiquidityPoolInfo;

  public get currentPoolInfo(): LiquidityPoolInfo {
    return this._currentPoolInfo;
  }

  public set currentPoolInfo(info: LiquidityPoolInfo) {
    this._currentPoolInfo = info;
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

  constructor(
    private readonly privateBlockchainAdapter: SolanaWeb3PrivateService,
    private readonly walletConnectorService: WalletConnectorService
  ) {
    this.stableSwapManager = new RaydiumStableManager();
  }

  public async createRouteSwap(
    poolsInfo: LiquidityPoolInfo[],
    trade: InstantTrade,
    slippage: number
  ): Promise<BaseTransaction> {
    const [poolInfoA, poolInfoB] = poolsInfo;

    const setupInstructions: TransactionInstruction[] = [];
    const signers: Signer[] = [];
    const tradeInstructions: TransactionInstruction[] = [];

    const { amountIn, amountOut, owner } = await RaydiumSwapManager.prepareSwapParams(
      this.walletConnectorService.address,
      trade.from.token.decimals,
      trade.to.token.decimals,
      trade.from.amount,
      subtractPercent(trade.to.amount, slippage),
      this.privateBlockchainAdapter
    );

    const fromMint = trade.from.token.address;
    const toMint = trade.to.token.address;
    const middleMint = this.routerInfo.middleCoin.address;

    const fromFinalAmount = Math.floor(parseFloat(amountIn.toString()));
    const middleFinalAmount = Math.floor(parseFloat(this.routerInfo.route[1].amountA.toString()));
    const toFinalAmount = Math.floor(parseFloat(amountOut.toString()));

    const { from: fromAccount } = await this.privateBlockchainAdapter.getOrCreatesTokensAccounts(
      fromMint,
      middleMint,
      owner,
      fromFinalAmount,
      setupInstructions,
      signers,
      true
    );

    const { from: middleAccount, to: toAccount } =
      await this.privateBlockchainAdapter.getOrCreatesTokensAccounts(
        middleMint,
        toMint,
        owner,
        middleFinalAmount,
        setupInstructions,
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

    const firstSwap =
      poolInfoA.version === 5
        ? RaydiumStableManager.createRouteStableSwapInInstruction(
            new PublicKey(ROUTE_SWAP_PROGRAM_ID),
            new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V5),
            new PublicKey(poolInfoA.ammId),
            new PublicKey(poolInfoB.ammId),
            new PublicKey(poolInfoA.ammAuthority),
            new PublicKey(poolInfoA.ammOpenOrders),
            new PublicKey(poolInfoA.poolCoinTokenAccount),
            new PublicKey(poolInfoA.poolPcTokenAccount),
            new PublicKey(poolInfoA.modelDataAccount),
            new PublicKey(poolInfoA.serumProgramId),
            new PublicKey(poolInfoA.serumMarket),
            new PublicKey(poolInfoA.serumBids),
            new PublicKey(poolInfoA.serumAsks),
            new PublicKey(poolInfoA.serumEventQueue),
            new PublicKey(poolInfoA.poolCoinTokenAccount),
            new PublicKey(poolInfoA.poolPcTokenAccount),
            PublicKey.default,
            newFromTokenAccount,
            newMiddleTokenAccount,
            publicKey,
            owner,
            fromFinalAmount,
            toFinalAmount
          )
        : RaydiumRouterManager.createRouteSwapInInstruction(
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
            new PublicKey(poolInfoA?.serumVaultSigner || NATIVE_SOL.mintAddress),
            newFromTokenAccount,
            newMiddleTokenAccount,
            publicKey,
            owner,
            fromFinalAmount,
            toFinalAmount
          );

    const secondSwap =
      poolInfoB.version === 5
        ? RaydiumStableManager.createRouteStableSwapOutInstruction(
            new PublicKey(ROUTE_SWAP_PROGRAM_ID),
            new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V5),
            new PublicKey(poolInfoA.ammId),
            new PublicKey(poolInfoB.ammId),
            new PublicKey(poolInfoB.ammAuthority),
            new PublicKey(poolInfoB.ammOpenOrders),
            new PublicKey(poolInfoB.poolCoinTokenAccount),
            new PublicKey(poolInfoB.poolPcTokenAccount),
            new PublicKey(poolInfoB.modelDataAccount),
            new PublicKey(poolInfoB.serumProgramId),
            new PublicKey(poolInfoB.serumMarket),
            new PublicKey(poolInfoB.serumBids),
            new PublicKey(poolInfoB.serumAsks),
            new PublicKey(poolInfoB.serumEventQueue),
            new PublicKey(poolInfoB.poolCoinTokenAccount),
            new PublicKey(poolInfoB.poolPcTokenAccount),
            PublicKey.default,
            newMiddleTokenAccount,
            newToTokenAccount,
            publicKey,
            owner
          )
        : RaydiumRouterManager.createRouteSwapOutInstruction(
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
            new PublicKey(poolInfoB?.serumVaultSigner || NATIVE_SOL.mintAddress),
            newMiddleTokenAccount,
            newToTokenAccount,
            publicKey,
            owner
          );

    tradeInstructions.push(firstSwap);
    tradeInstructions.push(secondSwap);

    return SolanaWeb3Public.createTransactions(setupInstructions, tradeInstructions, signers);
  }

  private getSwapRouter(
    poolInfos: { [p: string]: LiquidityPoolInfo },
    fromMint: string,
    toMint: string
  ): [LiquidityPoolInfo, LiquidityPoolInfo][] {
    const fromCoinMint =
      fromMint === WRAPPED_SOL.mintAddress || fromMint === NATIVE_SOLANA_MINT_ADDRESS
        ? NATIVE_SOL.mintAddress
        : fromMint;
    const toCoinMint =
      toMint === WRAPPED_SOL.mintAddress || toMint === NATIVE_SOLANA_MINT_ADDRESS
        ? NATIVE_SOL.mintAddress
        : toMint;
    const transitTokensPools = Object.values(
      Object.fromEntries(
        RaydiumRouterManager.transitTokens
          .map(coolToken => {
            const pools = Object.values(poolInfos).filter(pool => {
              const firstTokenAddress = pool.coin.mintAddress;
              const secondTokenAddress = pool.pc.mintAddress;
              return (
                pool.name.includes(coolToken) &&
                (firstTokenAddress === fromCoinMint ||
                  pool.coin.mintAddress === toCoinMint ||
                  secondTokenAddress === fromCoinMint ||
                  pool.pc.mintAddress === toCoinMint)
              );
            });
            return [coolToken, pools];
          })
          .filter(([_, pools]: [string, LiquidityPoolInfo[]]) => {
            const hasPools = pools?.length;
            const isTradeToken = pools.length > 30;

            if (!hasPools || isTradeToken) {
              return false;
            }

            const hasFormToken = pools.find(pool => {
              return [pool.pc.mintAddress, pool.coin.mintAddress].includes(fromCoinMint);
            });

            const hasToToken = pools.find(pool => {
              return [pool.pc.mintAddress, pool.coin.mintAddress].includes(toCoinMint);
            });

            return hasFormToken && hasToToken;
          })
      )
    ).flat() as LiquidityPoolInfo[];

    return transitTokensPools.reduce((acc, curr) => {
      if (curr.coin.mintAddress === fromCoinMint) {
        return [
          ...acc,
          ...transitTokensPools
            .filter(
              p2 =>
                curr.ammId !== p2.ammId &&
                ((p2.pc.mintAddress === curr.pc.mintAddress &&
                  p2.coin.mintAddress === toCoinMint) ||
                  (p2.coin.mintAddress === curr.pc.mintAddress && p2.pc.mintAddress === toCoinMint))
            )
            .map(ap => [curr, ap] as [LiquidityPoolInfo, LiquidityPoolInfo])
        ];
      }
      if (curr.pc.mintAddress === fromCoinMint) {
        return [
          ...acc,
          ...transitTokensPools
            .filter(
              p2 =>
                curr.ammId !== p2.ammId &&
                ((p2.pc.mintAddress === curr.coin.mintAddress &&
                  p2.coin.mintAddress === toCoinMint) ||
                  (p2.coin.mintAddress === curr.coin.mintAddress &&
                    p2.pc.mintAddress === toCoinMint))
            )
            .map(ap => [curr, ap] as [LiquidityPoolInfo, LiquidityPoolInfo])
        ];
      }
      return acc;
    }, [] as [LiquidityPoolInfo, LiquidityPoolInfo][]);
  }

  public calculate(
    poolInfos: { [p: string]: LiquidityPoolInfo },
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken,
    amount: BigNumber,
    slippage: number
  ): RaydiumRouterInfo | null {
    const routesInfo = this.getSwapRouter(poolInfos, fromToken.address, toToken.address);
    const fromCoinMint =
      fromToken.address === WRAPPED_SOL.mintAddress ||
      fromToken.address === NATIVE_SOLANA_MINT_ADDRESS
        ? NATIVE_SOL.mintAddress
        : fromToken.address;

    if (routesInfo?.length) {
      this.routerInfo = routesInfo.reduce(
        (acc, route) => {
          // First token route
          const middleCoin =
            route[0].coin.mintAddress === fromCoinMint ? route[0].pc : route[0].coin;

          const { amountOutWithSlippage: amountOutWithSlippageA } =
            route[0].version === 5
              ? RaydiumStableManager.getSwapOutAmountStable(
                  route[0],
                  fromToken.address,
                  middleCoin.mintAddress,
                  amount.toString(),
                  slippage
                )
              : RaydiumSwapManager.getSwapOutAmount(
                  route[0],
                  fromToken.address,
                  middleCoin.mintAddress,
                  amount.toString(),
                  slippage
                );

          const { amountOut, priceImpact } =
            route[1].version === 5
              ? RaydiumStableManager.getSwapOutAmountStable(
                  route[1],
                  middleCoin.mintAddress,
                  toToken.address,
                  amountOutWithSlippageA.toString(),
                  slippage
                )
              : RaydiumSwapManager.getSwapOutAmount(
                  route[1],
                  middleCoin.mintAddress,
                  toToken.address,
                  amountOutWithSlippageA.toString(),
                  slippage
                );

          if (amountOut.gt(acc.maxAmountOut)) {
            return {
              maxAmountOut: amountOut,
              priceImpact,
              middleCoin: {
                address: middleCoin.mintAddress,
                symbol: middleCoin.symbol
              },
              route: [
                {
                  type: 'amm',
                  id: route[0].ammId,
                  amountA: amount.toNumber(),
                  amountB: amountOutWithSlippageA.toNumber(),
                  mintA: fromToken.address,
                  mintB: middleCoin.mintAddress
                },
                {
                  type: 'amm',
                  id: route[1].ammId,
                  amountA: amountOutWithSlippageA.toNumber(),
                  amountB: amountOut.toNumber(),
                  mintA: middleCoin.mintAddress,
                  mintB: toToken.address
                }
              ]
            } as RaydiumRouterInfo;
          }
          return acc;
        },
        {
          maxAmountOut: new BigNumber(0)
        } as RaydiumRouterInfo
      );
      return this.routerInfo;
    }
    return null;
  }

  public async calculateTrade(
    liquidityManager: RaydiumLiquidityManager,
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken,
    slippageTolerance: number,
    tokens: List<TokenAmount>
  ): Promise<{
    maxAmountOut: BigNumber;
    middleCoin: { address: string; symbol: string };
    priceImpact: number;
    poolInfo: LiquidityPoolInfo[];
  }> {
    const fromCoinMint =
      fromToken.address === WRAPPED_SOL.mintAddress ||
      fromToken.address === NATIVE_SOLANA_MINT_ADDRESS
        ? NATIVE_SOL.mintAddress
        : fromToken.address;
    const toCoinMint =
      toToken.address === WRAPPED_SOL.mintAddress || toToken.address === NATIVE_SOLANA_MINT_ADDRESS
        ? NATIVE_SOL.mintAddress
        : toToken.address;

    const poolInfos = await liquidityManager.requestInfos(
      fromToken.symbol,
      toToken.symbol,
      tokens,
      true
    );

    const { maxAmountOut, middleCoin, priceImpact } = this.calculate(
      poolInfos,
      fromToken,
      toToken,
      fromAmount,
      slippageTolerance
    );
    const poolInfo: LiquidityPoolInfo[] = [];
    if (maxAmountOut) {
      poolInfo[0] = Object.values(poolInfos)
        .filter(
          p =>
            (p.coin.mintAddress === fromCoinMint && p.pc.mintAddress === middleCoin.address) ||
            (p.coin.mintAddress === middleCoin.address && p.pc.mintAddress === fromCoinMint)
        )
        .pop();
      poolInfo[1] = Object.values(poolInfos)
        .filter(
          p =>
            (p.coin.mintAddress === middleCoin.address && p.pc.mintAddress === toCoinMint) ||
            (p.coin.mintAddress === toCoinMint && p.pc.mintAddress === middleCoin.address)
        )
        .pop();
    }
    return { maxAmountOut, middleCoin, priceImpact, poolInfo };
  }
}
