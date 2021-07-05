import { Injectable } from '@angular/core';
import { BlockchainsBridgeProvider } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/blockchains-bridge-provider';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { TranslateService } from '@ngx-translate/core';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { BridgeTrade } from 'src/app/features/bridge/models/BridgeTrade';
import { from, Observable, of } from 'rxjs';
import { TransactionReceipt } from 'web3-eth';
import { BridgeToken } from 'src/app/features/bridge/models/BridgeToken';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { List } from 'immutable';
import { map, withLatestFrom } from 'rxjs/operators';
import {
  EVO_ABI,
  EVO_ADDRESSES
} from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/binance-polygon-bridge-provider/constants/contract';
import BigNumber from 'bignumber.js';
import { EvoContractTokenInBlockchains } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/binance-polygon-bridge-provider/models/EvoContractToken';
import { EvoBridgeToken } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/binance-polygon-bridge-provider/models/EvoBridgeToken';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { UndefinedError } from 'src/app/core/errors/models/undefined.error';
import { BRIDGE_PROVIDER } from 'src/app/shared/models/bridge/BRIDGE_PROVIDER';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { AbiItem } from 'web3-utils';
import { EvoResponseToken } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/binance-polygon-bridge-provider/models/EvoResponseToken';

@Injectable()
export class BinancePolygonBridgeProviderService extends BlockchainsBridgeProvider {
  private evoTokens: EvoContractTokenInBlockchains[];

  constructor(
    private web3PublicService: Web3PublicService,
    private readonly translateService: TranslateService,
    private tokensService: TokensService
  ) {
    super();
    this.loadTokens().subscribe(tokens => this.tokens$.next(tokens));
  }

  approve(bridgeTrade: BridgeTrade): Observable<TransactionReceipt> {
    return undefined;
  }

  getProviderType(): BRIDGE_PROVIDER {
    return BRIDGE_PROVIDER.EVO;
  }

  needApprove(bridgeTrade: BridgeTrade): Observable<boolean> {
    return undefined;
  }

  createTrade(bridgeTrade: BridgeTrade): Observable<TransactionReceipt> {
    return undefined;
  }

  getFee(
    bridgeToken: BridgeToken,
    toBlockchain: BLOCKCHAIN_NAME,
    amount: BigNumber
  ): Observable<number> {
    const fromBlockchain =
      toBlockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
        ? BLOCKCHAIN_NAME.POLYGON
        : BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;
    const evoToken = this.evoTokens.find(
      token => token[toBlockchain].address === bridgeToken.blockchainToken[toBlockchain].address
    )[fromBlockchain];
    return of(evoToken.feeBase.plus(amount.multipliedBy(evoToken.fee).dividedBy(10000)).toNumber());
  }

  private loadTokens(): Observable<List<EvoBridgeToken>> {
    return from(this.tokensService.tokens).pipe(
      withLatestFrom(this.fetchSupportedTokens()),
      map(([swapTokens, contractTokens]) =>
        List(this.buildBridgeTokens(contractTokens, swapTokens.toArray()))
      )
    );
  }

  private async fetchSupportedTokens(): Promise<EvoContractTokenInBlockchains[]> {
    const blockchains = [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN, BLOCKCHAIN_NAME.POLYGON];
    const tokensListPromises = blockchains.map(blockchain =>
      this.web3PublicService[blockchain].callContractMethod(
        EVO_ADDRESSES[blockchain],
        EVO_ABI,
        'listTokensNames'
      )
    );

    const tokensInBlockchains: string[][] = await Promise.all(tokensListPromises);
    if (
      tokensInBlockchains.length !== 2 ||
      tokensInBlockchains[0].length !== tokensInBlockchains[1].length
    ) {
      console.error('Error while loading evo tokens');
      throw new UndefinedError();
    }

    const tokensInfoPromises = blockchains.map(blockchain =>
      (this.web3PublicService[blockchain] as Web3Public).multicallContractMethod<EvoResponseToken>(
        EVO_ADDRESSES[blockchain],
        EVO_ABI as AbiItem[],
        'tokens',
        [...Array(tokensInBlockchains[0].length).keys()].map(number => [number])
      )
    );

    const tokens = await Promise.all(tokensInfoPromises);
    const bscTokens = tokens[0];
    const polygonTokens = tokens[1];
    this.evoTokens = bscTokens.map((token, index) => ({
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        symbol: tokensInBlockchains[0][index],
        address: token.token,
        fee: new BigNumber(token.fee),
        feeBase: new BigNumber(token.feeBase),
        feeTarget: token.feeTarget,
        minAmount: Number(token.minAmount),
        dailyLimit: new BigNumber(token.dailyLimit),
        bonus: Number(token.bonus)
      },
      [BLOCKCHAIN_NAME.POLYGON]: {
        symbol: tokensInBlockchains[1][index],
        address: polygonTokens[index].token,
        fee: new BigNumber(polygonTokens[index].fee),
        feeBase: new BigNumber(polygonTokens[index].feeBase),
        feeTarget: polygonTokens[index].feeTarget,
        minAmount: Number(polygonTokens[index].minAmount),
        dailyLimit: new BigNumber(polygonTokens[index].dailyLimit),
        bonus: Number(polygonTokens[index].bonus)
      }
    }));

    return this.evoTokens;
  }

  private buildBridgeTokens(
    contractTokens: EvoContractTokenInBlockchains[],
    swapTokens: TokenAmount[]
  ): EvoBridgeToken[] {
    const bscSwapTokens = swapTokens.filter(
      token => token.blockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
    );
    const polygonSwapTokens = swapTokens.filter(
      token => token.blockchain === BLOCKCHAIN_NAME.POLYGON
    );

    return contractTokens
      .map(contractToken => {
        const bscSwapToken = bscSwapTokens.find(
          item =>
            item.address.toLowerCase() ===
            contractToken[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].address.toLowerCase()
        );
        const polygonSwapToken = polygonSwapTokens.find(
          item =>
            item.address.toLowerCase() ===
            contractToken[BLOCKCHAIN_NAME.POLYGON].address.toLowerCase()
        );

        if (!bscSwapToken || !polygonSwapToken) {
          return null;
        }

        return {
          evoInfo: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
              fee: contractToken[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].fee,
              feeBase: contractToken[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].feeBase,
              dailyLimit: contractToken[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].dailyLimit
            },
            [BLOCKCHAIN_NAME.POLYGON]: {
              fee: contractToken[BLOCKCHAIN_NAME.POLYGON].fee,
              feeBase: contractToken[BLOCKCHAIN_NAME.POLYGON].feeBase,
              dailyLimit: contractToken[BLOCKCHAIN_NAME.POLYGON].dailyLimit
            }
          },
          symbol: bscSwapToken.symbol,
          image: bscSwapToken.image,
          rank: bscSwapToken.rank,
          blockchainToken: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
              ...bscSwapToken,
              address: contractToken[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].address,
              minAmount:
                contractToken[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].minAmount /
                10 ** bscSwapToken.decimals,
              maxAmount: contractToken[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].dailyLimit.toNumber()
            },
            [BLOCKCHAIN_NAME.POLYGON]: {
              ...bscSwapToken,
              address: contractToken[BLOCKCHAIN_NAME.POLYGON].address,
              minAmount:
                contractToken[BLOCKCHAIN_NAME.POLYGON].minAmount / 10 ** polygonSwapToken.decimals,
              maxAmount: contractToken[BLOCKCHAIN_NAME.POLYGON].dailyLimit.toNumber()
            }
          }
        };
      })
      .filter(elem => elem);
  }
}
