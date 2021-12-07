import { Injectable } from '@angular/core';
import { BlockchainsBridgeProvider } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/blockchains-bridge-provider';
import { PublicBlockchainAdapterService } from 'src/app/core/services/blockchain/web3/web3-public-service/public-blockchain-adapter.service';
import { TranslateService } from '@ngx-translate/core';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { BridgeTrade } from 'src/app/features/bridge/models/BridgeTrade';
import { forkJoin, from, Observable, of, throwError } from 'rxjs';
import { TransactionReceipt } from 'web3-eth';
import { BridgeTokenPair } from 'src/app/features/bridge/models/BridgeTokenPair';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { List } from 'immutable';
import { catchError, first, map, switchMap, tap, timeout } from 'rxjs/operators';
import {
  EVO_ABI,
  EVO_ADDRESSES
} from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/binance-polygon-bridge-provider/constants/contract';
import BigNumber from 'bignumber.js';
import { EvoContractTokenInBlockchains } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/binance-polygon-bridge-provider/models/EvoContractToken';
import { EvoBridgeTokenPair } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/binance-polygon-bridge-provider/models/EvoBridgeTokenPair';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { UndefinedError } from 'src/app/core/errors/models/undefined.error';
import { BRIDGE_PROVIDER } from 'src/app/shared/models/bridge/BRIDGE_PROVIDER';
import { Web3Public } from 'src/app/core/services/blockchain/web3/web3-public-service/Web3Public';
import { AbiItem } from 'web3-utils';
import { EvoResponseToken } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/binance-polygon-bridge-provider/models/EvoResponseToken';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { PrivateAdapterService } from '@core/services/blockchain/web3/web3-private-service/private-adapter.service';
import { BridgeApiService } from 'src/app/core/services/backend/bridge-api/bridge-api.service';
import {
  BlockchainsConfig,
  TokensIdConfig
} from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/binance-polygon-bridge-provider/models/Config';
import { ConfigResponse } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/binance-polygon-bridge-provider/models/ConfigResponse';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import CustomError from '@core/errors/models/custom-error';

// Exclude MATIC token because it is not supported by EVO relayer
const EXCLUDED_TOKENS = {
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: ['0xcc42724c6683b7e57334c4e856f4c9965ed682bd'],
  [BLOCKCHAIN_NAME.POLYGON]: ['0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270']
};

type EvoBridgeBlockchains = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN | BLOCKCHAIN_NAME.POLYGON;

@Injectable()
export class BinancePolygonBridgeProviderService extends BlockchainsBridgeProvider {
  private evoTokenPairs: EvoBridgeTokenPair[];

  constructor(
    private web3PublicService: PublicBlockchainAdapterService,
    private web3PrivateService: PrivateAdapterService,
    private readonly translateService: TranslateService,
    private tokensService: TokensService,
    private authService: AuthService,
    private bridgeApiService: BridgeApiService
  ) {
    super();
    this.loadTokens().subscribe(tokens => {
      this._tokenPairs$.next(tokens);
      this.evoTokenPairs = tokens.toArray();
    });
  }

  approve(bridgeTrade: BridgeTrade): Observable<TransactionReceipt> {
    const { token } = bridgeTrade;
    const tokenFrom = token.tokenByBlockchain[bridgeTrade.fromBlockchain];

    return this.needApprove(bridgeTrade).pipe(
      switchMap(needApprove => {
        if (!needApprove) {
          console.error('You should check bridge trade allowance before approve');
          return throwError(new UndefinedError());
        }
        return this.web3PrivateService.approveTokens(
          tokenFrom.address,
          EVO_ADDRESSES[bridgeTrade.fromBlockchain as EvoBridgeBlockchains],
          'infinity',
          {
            onTransactionHash: bridgeTrade.onTransactionHash
          }
        );
      })
    );
  }

  getProviderType(): BRIDGE_PROVIDER {
    return BRIDGE_PROVIDER.EVO;
  }

  needApprove(bridgeTrade: BridgeTrade): Observable<boolean> {
    const { token } = bridgeTrade;
    if (BlockchainsInfo.getBlockchainType(bridgeTrade.fromBlockchain) !== 'ethLike') {
      // @TODO Solana.
      throw new CustomError('Solana error');
    }
    const web3Public = this.web3PublicService[bridgeTrade.fromBlockchain] as Web3Public;
    const tokenFrom = token.tokenByBlockchain[bridgeTrade.fromBlockchain];

    if (!this.authService?.user?.address) {
      console.error('Should login before approve');
      return throwError(new UndefinedError());
    }

    return from(
      web3Public.getAllowance(
        tokenFrom.address,
        this.authService.user.address,
        EVO_ADDRESSES[bridgeTrade.fromBlockchain as EvoBridgeBlockchains]
      )
    ).pipe(
      map(allowance => bridgeTrade.amount.multipliedBy(10 ** tokenFrom.decimals).gt(allowance))
    );
  }

  createTrade(bridgeTrade: BridgeTrade): Observable<TransactionReceipt> {
    const onTransactionHash = (hash: string) => {
      if (typeof bridgeTrade.onTransactionHash === 'function') {
        bridgeTrade.onTransactionHash(hash);
      }
      this.bridgeApiService.postEvoTransaction(hash, bridgeTrade.fromBlockchain);
    };
    const tokenFrom = bridgeTrade.token.tokenByBlockchain[bridgeTrade.fromBlockchain];
    const destination = bridgeTrade.fromBlockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN ? 1 : 0;

    const evoToken = this.evoTokenPairs.find(
      evoTokenPair =>
        evoTokenPair.tokenByBlockchain[bridgeTrade.fromBlockchain].address.toLowerCase() ===
        tokenFrom.address.toLowerCase()
    ).evoInfo[bridgeTrade.fromBlockchain as EvoBridgeBlockchains];

    return from(
      this.web3PrivateService.executeContractMethod(
        EVO_ADDRESSES[bridgeTrade.fromBlockchain as EvoBridgeBlockchains],
        EVO_ABI as AbiItem[],
        'create',
        [
          evoToken.index,
          bridgeTrade.amount.multipliedBy(10 ** tokenFrom.decimals).toFixed(),
          destination,
          Web3Public.addressToBytes32(this.authService.user.address)
        ],
        {
          onTransactionHash
        }
      )
    ).pipe(
      tap(async receipt => {
        try {
          await this.bridgeApiService.notifyBridgeBot(
            bridgeTrade,
            receipt.transactionHash,
            this.authService.user.address
          );
        } catch (e) {
          console.error(e);
        }
      })
    );
  }

  getFee(
    tokenPair: BridgeTokenPair,
    toBlockchain: BLOCKCHAIN_NAME,
    amount: BigNumber
  ): Observable<number> {
    const fromBlockchain =
      toBlockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
        ? BLOCKCHAIN_NAME.POLYGON
        : BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;
    const evoToken = this.evoTokenPairs.find(
      evoTokenPair =>
        evoTokenPair.tokenByBlockchain[toBlockchain].address ===
        tokenPair.tokenByBlockchain[toBlockchain].address
    ).evoInfo[fromBlockchain];
    return of(evoToken.feeBase.plus(amount.multipliedBy(evoToken.fee).dividedBy(10000)).toNumber());
  }

  private loadTokens(): Observable<List<EvoBridgeTokenPair>> {
    const loadTokensAndConfig$ = from(this.fetchSupportedTokens()).pipe(
      switchMap(evoTokens => {
        const blockchainTokens: Record<EvoBridgeBlockchains, number[]> = {
          [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [],
          [BLOCKCHAIN_NAME.POLYGON]: []
        };

        evoTokens.forEach(token =>
          Object.entries(token).forEach(([key, value]) =>
            blockchainTokens[key as EvoBridgeBlockchains].push(value.index)
          )
        );
        return from(this.fetchConfigs(blockchainTokens)).pipe(
          map(config => ({ evoTokens, config }))
        );
      }),
      timeout(3000),
      catchError((err: unknown) => {
        console.error(err);
        return of({ evoTokens: [], config: {} });
      })
    );

    return forkJoin([
      this.tokensService.tokens$.pipe(first(tokens => !!tokens?.size)),
      loadTokensAndConfig$
    ]).pipe(
      map(([swapTokens, { evoTokens, config }]) =>
        List(this.buildBridgeTokenPairs(evoTokens, config, swapTokens.toArray()))
      )
    );
  }

  private async fetchSupportedTokens(): Promise<EvoContractTokenInBlockchains[]> {
    const blockchains: EvoBridgeBlockchains[] = [
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      BLOCKCHAIN_NAME.POLYGON
    ];
    const tokensListPromises = blockchains.map(blockchain =>
      this.web3PublicService[blockchain].callContractMethod<string[]>(
        EVO_ADDRESSES[blockchain as EvoBridgeBlockchains],
        EVO_ABI as AbiItem[],
        'listTokensNames'
      )
    );

    const tokensInBlockchains: string[][] = await Promise.all(tokensListPromises);
    if (tokensInBlockchains.length !== 2) {
      console.error('Error while loading evo tokens');
      throw new UndefinedError();
    }

    if (tokensInBlockchains[0].length !== tokensInBlockchains[1].length) {
      // eslint-disable-next-line no-console
      console.warn('[EVO TOKENS WARNING]: BSC tokens number is not equal to POLYGON tokens number');
    }

    const tokensInfoPromises = blockchains.map(blockchain => {
      if (BlockchainsInfo.getBlockchainType(blockchain) !== 'ethLike') {
        // @TODO Solana.
        throw new CustomError('Solana error');
      }
      const blockchainAdapter = this.web3PublicService[blockchain] as Web3Public;
      return blockchainAdapter.multicallContractMethods<EvoResponseToken>(
        EVO_ADDRESSES[blockchain as EvoBridgeBlockchains],
        EVO_ABI,
        [
          ...Array(Math.min(tokensInBlockchains[0].length, tokensInBlockchains[1].length)).keys()
        ].map(number => ({ methodName: 'tokens', methodArguments: [number] }))
      );
    });

    const tokens = (await Promise.all(tokensInfoPromises)).map(responses =>
      responses.map(response => response.output)
    );
    const bscTokens = tokens[0].filter(
      token =>
        !EXCLUDED_TOKENS[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].includes(token.token.toLowerCase())
    );
    const polygonTokens = tokens[1].filter(
      token => !EXCLUDED_TOKENS[BLOCKCHAIN_NAME.POLYGON].includes(token.token.toLowerCase())
    );

    return bscTokens.map((token, index) => ({
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        symbol: tokensInBlockchains[0][index],
        address: token.token,
        defaultFee: new BigNumber(token.defaultFee),
        defaultFeeBase: new BigNumber(token.defaultFeeBase),
        feeTarget: token.feeTarget,
        defaultMinAmount: new BigNumber(token.defaultMinAmount),
        defaultMaxAmount: new BigNumber(token.defaultMaxAmount),
        bonus: Number(token.bonus),
        index
      },
      [BLOCKCHAIN_NAME.POLYGON]: {
        symbol: tokensInBlockchains[1][index],
        address: polygonTokens[index].token,
        defaultFee: new BigNumber(polygonTokens[index].defaultFee),
        defaultFeeBase: new BigNumber(polygonTokens[index].defaultFeeBase),
        feeTarget: polygonTokens[index].feeTarget,
        defaultMinAmount: new BigNumber(polygonTokens[index].defaultMinAmount),
        defaultMaxAmount: new BigNumber(polygonTokens[index].defaultMaxAmount),
        bonus: Number(polygonTokens[index].bonus),
        index
      }
    }));
  }

  private buildBridgeTokenPairs(
    contractTokens: EvoContractTokenInBlockchains[],
    config: BlockchainsConfig,
    swapTokens: TokenAmount[]
  ): EvoBridgeTokenPair[] {
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

        const bscConfigToken =
          config[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN][
            contractToken[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].index
          ];
        const polygonConfigToken =
          config[BLOCKCHAIN_NAME.POLYGON][contractToken[BLOCKCHAIN_NAME.POLYGON].index];

        const validBN = (bn1: BigNumber, bn2: BigNumber) => (bn1 && bn1.gt(0) ? bn1 : bn2);

        return {
          evoInfo: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
              fee: validBN(
                bscConfigToken.fee,
                contractToken[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].defaultFee
              ),
              feeBase: validBN(
                bscConfigToken.feeBase,
                contractToken[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].defaultFeeBase
              ),
              index: contractToken[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].index
            },
            [BLOCKCHAIN_NAME.POLYGON]: {
              fee: validBN(
                polygonConfigToken.fee,
                contractToken[BLOCKCHAIN_NAME.POLYGON].defaultFee
              ),
              feeBase: validBN(
                polygonConfigToken.feeBase,
                contractToken[BLOCKCHAIN_NAME.POLYGON].defaultFeeBase
              ),
              index: contractToken[BLOCKCHAIN_NAME.POLYGON].index
            }
          },
          symbol: bscSwapToken.symbol,
          image: bscSwapToken.image,
          rank: bscSwapToken.rank,
          price: bscSwapToken.price,
          tokenByBlockchain: {
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
              ...bscSwapToken,
              address: contractToken[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].address,
              minAmount: Number(
                validBN(
                  bscConfigToken.minAmount,
                  contractToken[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].defaultMinAmount
                )
                  .div(10 ** bscSwapToken.decimals)
                  .toFixed(2)
              ),
              maxAmount: Number(
                validBN(
                  bscConfigToken.maxAmount,
                  contractToken[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].defaultMaxAmount
                )
                  .div(10 ** bscSwapToken.decimals)
                  .toFixed(2)
              )
            },
            [BLOCKCHAIN_NAME.POLYGON]: {
              ...polygonSwapToken,
              address: contractToken[BLOCKCHAIN_NAME.POLYGON].address,
              minAmount: Number(
                validBN(
                  polygonConfigToken.minAmount,
                  contractToken[BLOCKCHAIN_NAME.POLYGON].defaultMinAmount
                )
                  .div(10 ** polygonSwapToken.decimals)
                  .toFixed(2)
              ),
              maxAmount: Number(
                validBN(
                  polygonConfigToken.maxAmount,
                  contractToken[BLOCKCHAIN_NAME.POLYGON].defaultMaxAmount
                )
                  .div(10 ** polygonSwapToken.decimals)
                  .toFixed(2)
              )
            }
          }
        };
      })
      .filter(elem => elem);
  }

  private async fetchConfigs(blockchainTokenIds: {
    [key in BLOCKCHAIN_NAME]?: number[];
  }): Promise<BlockchainsConfig> {
    const blockchains = [
      {
        name: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
        destinationId: 0
      },
      {
        name: BLOCKCHAIN_NAME.POLYGON,
        destinationId: 1
      }
    ] as const;

    const blockchainPromises: Promise<TokensIdConfig>[] = blockchains.map(async blockchain => {
      const tokenIds = blockchainTokenIds[blockchain.name];
      if (BlockchainsInfo.getBlockchainType(blockchain.name) !== 'ethLike') {
        // @TODO Solana.
        throw new CustomError('Solana error');
      }
      const configResponse = (
        await (
          this.web3PublicService[blockchain.name] as Web3Public
        ).multicallContractMethods<ConfigResponse>(
          EVO_ADDRESSES[blockchain.name],
          EVO_ABI,
          tokenIds.map(id => ({
            methodName: 'configs',
            methodArguments: [id, blockchain.destinationId]
          }))
        )
      ).map(response => response.output);

      const result: TokensIdConfig = {};

      configResponse.forEach((response, index) => {
        result[tokenIds[index]] = {
          tokenId: tokenIds[index],
          destination: blockchain.name,
          fee: response.fee ? new BigNumber(response.fee) : null,
          feeBase: response.feeBase ? new BigNumber(response.feeBase) : null,
          minAmount: response.minAmount ? new BigNumber(response.minAmount) : null,
          maxAmount: response.maxAmount ? new BigNumber(response.maxAmount) : null,
          directTransferAllowed: response.directTransferAllowed
        };
      });

      return result;
    });

    const blockchainsConfig = {} as BlockchainsConfig;

    (await Promise.all(blockchainPromises)).forEach(
      (config, index) => (blockchainsConfig[blockchains[index].name] = config)
    );

    return blockchainsConfig;
  }
}
