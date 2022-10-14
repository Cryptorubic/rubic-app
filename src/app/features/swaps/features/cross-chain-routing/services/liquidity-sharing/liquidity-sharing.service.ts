import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import networks from '@app/shared/constants/blockchain/networks';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME, EvmWeb3Public, Injector, Web3Pure } from 'rubic-sdk';
import {
  distinctUntilChanged,
  filter,
  firstValueFrom,
  from,
  map,
  Observable,
  Subject,
  switchMap,
  takeUntil
} from 'rxjs';
import { SwapFormInput } from '../../../main-form/models/swap-form';
import { SwapFormService } from '../../../main-form/services/swap-form-service/swap-form.service';
import { debridgeBaseAbi, debridgePoolAbi, debridgePools } from './constants/debridge-pools';
import { symbiosisPoolAbi, symbiosisPools } from './constants/symbiosis-pools';
import { CelerLiquidityInfo } from './models/celer-liquidity-info.interface';
import { OptimizePayload, PairInfo } from './models/optimize-payload.interface';
import { OptimizeResponse } from './models/optimize-response.interface';

@Injectable()
export class LiquiditySharingService {
  private readonly _destroy$ = new Subject<void>();

  constructor(
    private readonly swapsFormService: SwapFormService,
    private readonly httpClient: HttpClient
  ) {}

  public initLiquiditySharingObserver(): void {
    this.swapsFormService.commonTrade.valueChanges
      .pipe(
        map(form => form.input),
        distinctUntilChanged((prev, curr) => {
          return (
            prev.fromToken?.blockchain === curr.fromToken?.blockchain &&
            prev.toToken?.symbol === curr.toToken?.symbol &&
            prev?.fromAmount?.toNumber() === curr?.fromAmount?.toNumber()
          );
        }),
        filter(input => {
          return Boolean(input.fromToken && input.toToken && input.fromAmount);
        }),
        switchMap(input => {
          return from(this.getOptimizePayload(input));
        }),
        takeUntil(this._destroy$)
      )
      .subscribe(payload => {
        console.log(payload);
      });
  }

  private async getCelerLiquidityInfo(
    inputToken: TokenAmount,
    outputToken: TokenAmount
  ): Promise<PairInfo> {
    const srcNetworkChainId = networks.find(network => network.name === inputToken.blockchain).id;
    const dstNetworkChainId = networks.find(network => network.name === outputToken.blockchain).id;
    return firstValueFrom(
      this.httpClient
        .get<CelerLiquidityInfo>('https://cbridge-prod2.celer.app/v1/getLPInfoList')
        .pipe(
          map(celerLiquidityInfoResponse => {
            if (celerLiquidityInfoResponse.lp_info.length === 0) {
              console.log('[CELER LIQUIDITY] empty celer API liquidity info');
              return { reserveX: '0', reserveY: '0' };
            }

            const { lp_info } = celerLiquidityInfoResponse;
            const reserveX = lp_info.find(
              item =>
                item.chain.id === srcNetworkChainId &&
                item.token.token.address.toLowerCase() === inputToken.address.toLowerCase()
            ).total_liquidity;
            const reserveY = lp_info.find(
              item =>
                item.chain.id === dstNetworkChainId &&
                item.token.token.address.toLowerCase() === outputToken.address.toLowerCase()
            ).total_liquidity;

            if (!reserveX || !reserveY) {
              console.log('[CELER LIQUIDITY] unsupported pair');
              return { reserveX: '0', reserveY: '0' };
            }

            return { reserveX, reserveY };
          })
        )
    );
  }

  private async getDebridgeLiquidityInfo(
    inputToken: TokenAmount,
    outputToken: TokenAmount
  ): Promise<PairInfo> {
    const poolBlockchain =
      inputToken.blockchain === BLOCKCHAIN_NAME.ETHEREUM
        ? outputToken.blockchain
        : inputToken.blockchain;
    const srcPoolAndBase = debridgePools[poolBlockchain];
    const srcWeb3Public = Injector.web3PublicService.getWeb3Public(poolBlockchain) as EvmWeb3Public;

    if (
      ![inputToken.blockchain, outputToken.blockchain].some(
        blockchain => blockchain === BLOCKCHAIN_NAME.ETHEREUM
      )
    ) {
      console.log('[DEBRIDGE LIQUIDITY] unsupported pair');
      return { reserveX: '0', reserveY: '0' };
    }

    const virtualPrice = await srcWeb3Public.callContractMethod(
      srcPoolAndBase.base,
      debridgeBaseAbi,
      'get_virtual_price'
    );
    const zeroIndexTokens = await srcWeb3Public.callContractMethod(
      srcPoolAndBase.pool,
      debridgePoolAbi,
      'balances',
      [0]
    );
    const firstIndexTokens = await srcWeb3Public.callContractMethod(
      srcPoolAndBase.pool,
      debridgePoolAbi,
      'balances',
      [1]
    );
    const firstIndexTokensWithPrice = Web3Pure.fromWei(firstIndexTokens, 18)
      .multipliedBy(new BigNumber(`${virtualPrice}`).dividedBy(10 ** 18))
      .toString();

    return inputToken.blockchain === BLOCKCHAIN_NAME.ETHEREUM
      ? {
          reserveX: Web3Pure.fromWei(zeroIndexTokens, 6).toString(),
          reserveY: firstIndexTokensWithPrice
        }
      : {
          reserveX: firstIndexTokensWithPrice,
          reserveY: Web3Pure.fromWei(zeroIndexTokens, 6).toString()
        };
  }

  private async getSymbiosisLiquidityInfo(
    inputToken: TokenAmount,
    outputToken: TokenAmount
  ): Promise<PairInfo> {
    const srcWeb3Public = Injector.web3PublicService.getWeb3Public(
      inputToken.blockchain
    ) as EvmWeb3Public;
    let poolInfo: { address: string; decimals: [number, number] } =
      symbiosisPools[inputToken.blockchain][outputToken.blockchain] ||
      symbiosisPools[outputToken.blockchain][inputToken.blockchain];

    if (!poolInfo) {
      console.log('[SYMBIOSIS LIQUIDITY] unsupported pair');
      return { reserveX: '0', reserveY: '0' };
    }

    const zeroIndexTokenBalance = await srcWeb3Public.callContractMethod(
      poolInfo.address,
      symbiosisPoolAbi,
      'getTokenBalance',
      [0]
    );
    const firstIndexTokenBalance = await srcWeb3Public.callContractMethod(
      poolInfo.address,
      symbiosisPoolAbi,
      'getTokenBalance',
      [1]
    );

    return symbiosisPools[inputToken.blockchain][outputToken.blockchain].address ===
      poolInfo.address
      ? {
          reserveX: Web3Pure.fromWei(firstIndexTokenBalance, poolInfo.decimals[1]).toString(),
          reserveY: Web3Pure.fromWei(zeroIndexTokenBalance, poolInfo.decimals[0]).toString()
        }
      : {
          reserveX: Web3Pure.fromWei(zeroIndexTokenBalance, poolInfo.decimals[0]).toString(),
          reserveY: Web3Pure.fromWei(firstIndexTokenBalance, poolInfo.decimals[1]).toString()
        };
  }

  private async getOptimizePayload(input: SwapFormInput): Promise<OptimizePayload> {
    const cBridge = await this.getCelerLiquidityInfo(input.fromToken, input.toToken);
    const deBridge = await this.getDebridgeLiquidityInfo(input.fromToken, input.toToken);
    const symbiosis = await this.getSymbiosisLiquidityInfo(input.fromToken, input.toToken);

    return {
      fromAmount: input.fromAmount.toString(),
      fromToken: input.fromToken.symbol,
      fromBlockchain: input.fromBlockchain,
      toToken: input.toToken.symbol,
      toBlockchain: input.toBlockchain,
      frontCalculations: {
        cBridge: {
          input: '0',
          output: '0',
          loss: '0'
        },
        symbiosis: {
          input: '0',
          output: '0',
          loss: '0'
        },
        deBridge: {
          input: '0',
          output: '0',
          loss: '0'
        }
      },
      bridges: { cBridge, deBridge, symbiosis }
    };
  }

  private optimize(payload: OptimizePayload): Observable<OptimizeResponse> {
    return this.httpClient.post<OptimizeResponse>('', { ...payload });
  }

  public stopLiquiditySharingObserver(): void {
    this._destroy$.next();
  }
}
