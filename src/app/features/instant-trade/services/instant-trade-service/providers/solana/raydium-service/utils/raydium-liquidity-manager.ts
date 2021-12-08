import { AccountInfo, PublicKey } from '@solana/web3.js';
import { HttpClient } from '@angular/common/http';
import { SolanaWeb3Public } from '@core/services/blockchain/web3/web3-public-service/SolanaWeb3Public';
import {
  LIQUIDITY_POOLS,
  LiquidityPoolInfo
} from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/pools';
import {
  ACCOUNT_LAYOUT,
  AMM_INFO_LAYOUT,
  AMM_INFO_LAYOUT_STABLE,
  AMM_INFO_LAYOUT_V3,
  AMM_INFO_LAYOUT_V4,
  MINT_LAYOUT
} from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/structure';
import BigNumber from 'bignumber.js';
import { getBigNumber } from '@shared/utils/utils';
import { SolanaPrivateAdapterService } from '@core/services/blockchain/web3/web3-private-service/solana-private-adapter.service';
import { OpenOrders } from '@project-serum/serum';
import {
  LP_TOKENS,
  NATIVE_SOL,
  SolanaTokenInfo,
  TOKENS
} from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/tokens';
import {
  LIQUIDITY_POOL_PROGRAM_ID_V4,
  SERUM_PROGRAM_ID_V3
} from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/accounts';
import { List } from 'immutable';
import { TokenAmount } from '@shared/models/tokens/TokenAmount';

type LpAddress = { key: string; lpMintAddress: string; version: number };

type LpInfo = { [p: string]: LiquidityPoolInfo };

type LpDecimals = { [name: string]: number };

type PubKeyAccountInfo = { publicKey: PublicKey; accountInfo: AccountInfo<Buffer> };

export class RaydiumLiquidityManager {
  private allPools: LiquidityPoolInfo[];

  constructor(
    private readonly httpClient: HttpClient,
    private readonly publicBlockchainAdapter: SolanaWeb3Public,
    private readonly privateBlockchainAdapter: SolanaPrivateAdapterService
  ) {}

  public getAddressForWhat(address: string, pools: LiquidityPoolInfo[]): Partial<LpAddress> {
    for (const pool of pools) {
      for (const [key, value] of Object.entries(pool)) {
        if (key === 'lp') {
          if (value.mintAddress === address) {
            return {
              key: 'lpMintAddress',
              lpMintAddress: pool.lp.mintAddress,
              version: pool.version
            };
          }
        } else if (value === address) {
          return { key, lpMintAddress: pool.lp.mintAddress, version: pool.version };
        }
      }
    }
    return {};
  }

  public async requestInfos(
    fromSymbol: string,
    toSymbol: string,
    solanaTokens: List<TokenAmount>,
    multihops: boolean
  ): Promise<LpInfo> {
    const { ammAll, lpMintAddressList } = await this.fetchAmmAndMintAddresses();
    const lpMintListDecimals = await this.getLpMintListDecimals(lpMintAddressList);
    this.allPools = await this.getAllPools(ammAll, solanaTokens, lpMintListDecimals);

    return await this.getSpecificPools(this.allPools, multihops, fromSymbol, toSymbol);
  }

  public async getLpMintListDecimals(mintAddressInfos: string[]): Promise<LpDecimals> {
    const reLpInfoDict: LpDecimals = {};
    const mintList: PublicKey[] = [];
    mintAddressInfos.forEach(item => {
      const lpInfo = Object.values(LP_TOKENS).find(itemLpToken => itemLpToken.mintAddress === item);
      if (!lpInfo) {
        mintList.push(new PublicKey(item));
      }
      reLpInfoDict[item] = lpInfo ? lpInfo.decimals : null;
    });

    const mintAll = await this.privateBlockchainAdapter.getMultipleAccounts(mintList);

    for (let mintIndex = 0; mintIndex < mintAll.length; mintIndex += 1) {
      const itemMint = mintAll[mintIndex];
      if (itemMint) {
        const mintLayoutData = MINT_LAYOUT.decode(Buffer.from(itemMint.account.data));
        reLpInfoDict[mintList[mintIndex].toString()] = mintLayoutData.decimals;
      }
    }
    return Object.keys(reLpInfoDict).reduce((prev, key) => {
      if (reLpInfoDict[key] !== null) {
        return { ...prev, [key]: reLpInfoDict[key] };
      }
      return prev;
    }, {} as LpDecimals);
  }

  private async getAllPools(
    ammAll: PubKeyAccountInfo[],
    solanaTokens: List<TokenAmount>,
    lpMintListDecimals: { [p: string]: number }
  ): Promise<LiquidityPoolInfo[]> {
    const liquidityPools = [...LIQUIDITY_POOLS];
    const tokens: List<SolanaTokenInfo> = solanaTokens.map(el => ({
      symbol: el.symbol,
      name: el.name,
      mintAddress: el.address,
      decimals: el.decimals
    }));
    const { publicKey } = await this.privateBlockchainAdapter.createAmmAuthority(
      new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4)
    );
    const test = ammAll.reduce(
      (acc, curr, index) => {
        const ammInfo = AMM_INFO_LAYOUT_V4.decode(Buffer.from(curr.accountInfo.data));
        const fromCoin = ammInfo.coinMintAddress.toString();
        const toCoin = ammInfo.pcMintAddress.toString();

        const coin =
          tokens.find(item => item.mintAddress === fromCoin) ||
          Object.values(TOKENS).find(item => item.mintAddress === fromCoin);
        const pc =
          tokens.find(item => item.mintAddress === toCoin) ||
          Object.values(TOKENS).find(item => item.mintAddress === toCoin);

        if (!coin || !pc) {
          return acc;
        }

        const lp = Object.values(LP_TOKENS).find(
          item => item.mintAddress === ammInfo.lpMintAddress
        ) || {
          symbol: `${coin.symbol}-${pc.symbol}`,
          name: `${coin.symbol}-${pc.symbol}`,
          coin,
          pc,
          mintAddress: ammInfo.lpMintAddress.toString(),
          decimals: lpMintListDecimals[ammInfo.lpMintAddress]
        };
        const itemLiquidity: LiquidityPoolInfo = {
          name: `${coin.symbol}-${pc.symbol}`,
          coin,
          pc,
          lp,
          version: 4,
          programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
          ammId: ammAll[index].publicKey.toString(),
          ammAuthority: publicKey.toString(),
          ammOpenOrders: ammInfo.ammOpenOrders.toString(),
          ammTargetOrders: ammInfo.ammTargetOrders.toString(),
          ammQuantities: NATIVE_SOL.mintAddress,
          poolCoinTokenAccount: ammInfo.poolCoinTokenAccount.toString(),
          poolPcTokenAccount: ammInfo.poolPcTokenAccount.toString(),
          poolWithdrawQueue: ammInfo.poolWithdrawQueue.toString(),
          poolTempLpTokenAccount: ammInfo.poolTempLpTokenAccount.toString(),
          serumProgramId: SERUM_PROGRAM_ID_V3,
          serumMarket: ammInfo.serumMarket.toString(),
          serumBids: '461R7gK9GK1kLUXQbHgaW9L6PESQFSLGxKXahvcHEJwD' /* market.bids.toString() */,
          serumAsks: '461R7gK9GK1kLUXQbHgaW9L6PESQFSLGxKXahvcHEJwD' /* market.asks.toString() */,
          serumEventQueue:
            '461R7gK9GK1kLUXQbHgaW9L6PESQFSLGxKXahvcHEJwD' /* market.eventQueue.toString() */,
          serumCoinVaultAccount:
            '461R7gK9GK1kLUXQbHgaW9L6PESQFSLGxKXahvcHEJwD' /* market.baseVault.toString() */,
          serumPcVaultAccount:
            '461R7gK9GK1kLUXQbHgaW9L6PESQFSLGxKXahvcHEJwD' /* market.quoteVault.toString() */,
          serumVaultSigner:
            '461R7gK9GK1kLUXQbHgaW9L6PESQFSLGxKXahvcHEJwD' /* serumVaultSigner.toString() */,
          official: false
        };

        if (!liquidityPools.find(item => item.ammId === itemLiquidity.ammId)) {
          return [...acc, itemLiquidity];
        }
        return [
          ...acc.map(
            el =>
              (el.ammId === itemLiquidity.ammId && el.name !== itemLiquidity.name && !el.official
                ? itemLiquidity
                : el) as LiquidityPoolInfo
          )
        ];
      },
      [...liquidityPools]
    );
    return test;
  }

  private async getSpecificPools(
    allPools: LiquidityPoolInfo[],
    multihops: boolean,
    fromSymbol: string,
    toSymbol: string
  ): Promise<LpInfo> {
    const publicKeys: PublicKey[] = [];
    const liquidityPools: LpInfo = {};

    const LP = multihops
      ? allPools.filter(pool => pool.name.includes(fromSymbol) || pool.name.includes(toSymbol))
      : allPools.filter(
          pool =>
            pool.name === `${fromSymbol}-${toSymbol}` || pool.name === `${toSymbol}-${fromSymbol}`
        );

    LP.forEach(pool => {
      const { poolCoinTokenAccount, poolPcTokenAccount, ammOpenOrders, ammId, lp } = pool;

      publicKeys.push(
        new PublicKey(poolCoinTokenAccount),
        new PublicKey(poolPcTokenAccount),
        new PublicKey(ammOpenOrders),
        new PublicKey(ammId),
        new PublicKey(lp.mintAddress)
      );

      const poolInfo: LiquidityPoolInfo = { ...pool };

      poolInfo.coin.balance = new BigNumber(0);
      poolInfo.pc.balance = new BigNumber(0);

      liquidityPools[lp.mintAddress] = poolInfo;
    });

    const multipleInfo = await this.privateBlockchainAdapter.getMultipleAccounts(publicKeys);

    multipleInfo.forEach(info => {
      if (info) {
        const address = info.publicKey.toBase58();
        const data = Buffer.from(info.account.data);

        const { key, lpMintAddress, version } = this.getAddressForWhat(address, LP);

        if (key && lpMintAddress) {
          const poolInfo = liquidityPools[lpMintAddress];

          // eslint-disable-next-line default-case
          switch (key) {
            case 'poolCoinTokenAccount': {
              const parsed = ACCOUNT_LAYOUT.decode(data);
              // quick fix: Number can only safely store up to 53 bits
              poolInfo.coin.balance = poolInfo.coin.balance.plus(String(parsed.amount));

              break;
            }
            case 'poolPcTokenAccount': {
              const parsed = ACCOUNT_LAYOUT.decode(data);

              poolInfo.pc.balance = poolInfo.pc.balance.plus(String(parsed.amount));

              break;
            }
            case 'ammOpenOrders': {
              const OPEN_ORDERS_LAYOUT = OpenOrders.getLayout(
                new PublicKey(poolInfo.serumProgramId)
              );
              const parsed = OPEN_ORDERS_LAYOUT.decode(data);

              const { baseTokenTotal, quoteTokenTotal } = parsed;
              poolInfo.coin.balance = poolInfo.coin.balance.plus(String(baseTokenTotal));
              poolInfo.pc.balance = poolInfo.pc.balance.plus(String(quoteTokenTotal));

              break;
            }
            case 'ammId': {
              let parsed;
              if (version === 2) {
                parsed = AMM_INFO_LAYOUT.decode(data);
              } else if (version === 3) {
                parsed = AMM_INFO_LAYOUT_V3.decode(data);
              } else {
                if (version === 5) {
                  parsed = AMM_INFO_LAYOUT_STABLE.decode(data);
                  poolInfo.currentK = getBigNumber(parsed.currentK);
                } else parsed = AMM_INFO_LAYOUT_V4.decode(data);

                const { swapFeeNumerator, swapFeeDenominator } = parsed;
                poolInfo.fees = {
                  swapFeeNumerator: getBigNumber(swapFeeNumerator),
                  swapFeeDenominator: getBigNumber(swapFeeDenominator)
                };
              }

              const { status, needTakePnlCoin, needTakePnlPc } = parsed;
              poolInfo.status = getBigNumber(status);
              poolInfo.coin.balance = poolInfo.coin.balance.minus(getBigNumber(needTakePnlCoin));
              poolInfo.pc.balance = poolInfo.pc.balance.minus(getBigNumber(needTakePnlPc));

              break;
            }
            // getLpSupply
            case 'lpMintAddress': {
              const parsed = MINT_LAYOUT.decode(data);

              poolInfo.lp.totalSupply = new BigNumber(parsed.supply);

              break;
            }
          }
        }
      }
    });
    return liquidityPools;
  }

  private async fetchAmmAndMintAddresses(): Promise<{
    ammAll: PubKeyAccountInfo[];
    lpMintAddressList: string[];
  }> {
    const ammAll = await this.privateBlockchainAdapter.getFilteredProgramAccountsAmmOrMarketCache(
      'amm',
      new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4),
      [{ dataSize: AMM_INFO_LAYOUT_V4.span }]
    );

    const lpMintAddressList = ammAll.reduce((acc, curr) => {
      const ammLayout = AMM_INFO_LAYOUT_V4.decode(Buffer.from(curr.accountInfo.data));
      if (
        ammLayout.pcMintAddress.toString() === ammLayout.serumMarket.toString() ||
        ammLayout.lpMintAddress.toString() === '11111111111111111111111111111111'
      ) {
        return acc;
      }
      return [...acc, ammLayout.lpMintAddress.toString()];
    }, []);
    return { ammAll, lpMintAddressList };
  }
}
