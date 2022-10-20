import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import networks from '@app/shared/constants/blockchain/networks';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import BigNumber from 'bignumber.js';
import { BlockchainName, BLOCKCHAIN_NAME, EvmWeb3Public, Injector, Web3Pure } from 'rubic-sdk';
import {
  distinctUntilChanged,
  filter,
  firstValueFrom,
  from,
  map,
  Observable,
  Subject,
  switchMap,
  tap
} from 'rxjs';
import { SwapFormInput } from '../../../main-form/models/swap-form';
import { SwapFormService } from '../../../main-form/services/swap-form-service/swap-form.service';
import { debridgeBaseAbi, debridgePoolAbi, debridgePools } from './constants/debridge-pools';
import { symbiosisPoolAbi, symbiosisPools } from './constants/symbiosis-pools';
import { CelerLiquidityInfo } from './models/celer-liquidity-info.interface';
import { OptimizePayload, PairInfo } from './models/optimize-payload.interface';
import { OptimizeResponse } from './models/optimize-response.interface';

const supportedTokenSymbols = ['USDC', 'USDC.e', 'BUSD'];

@Injectable()
export class LiquiditySharingService {
  private readonly _destroy$ = new Subject<void>();

  constructor(
    private readonly swapsFormService: SwapFormService,
    private readonly httpClient: HttpClient
  ) {}

  public initLiquiditySharingObserver(): Observable<OptimizeResponse> {
    return this.swapsFormService.commonTrade.valueChanges.pipe(
      map(form => form.input),
      filter(input =>
        Boolean(
          input.fromToken &&
            input.toToken &&
            input.fromAmount &&
            supportedTokenSymbols.includes(input.fromToken.symbol) &&
            supportedTokenSymbols.includes(input.toToken.symbol)
        )
      ),
      distinctUntilChanged(
        (prev, curr) =>
          prev.fromToken?.blockchain === curr.fromToken?.blockchain &&
          prev.toToken?.symbol === curr.toToken?.symbol &&
          prev?.fromAmount?.toNumber() === curr?.fromAmount?.toNumber()
      ),
      switchMap(input => from(this.getOptimizePayload(input))),
      switchMap(payload => {
        console.log(
          '%c [OPTIMIZATION] request payload',
          'background: #222; color: #bada55',
          payload
        );
        return this.optimize(payload);
      }),
      tap(response =>
        console.log(
          '%c [OPTIMIZATION] optimization response',
          'background: #222; color: #bada55',
          response
        )
      )
    );
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
              console.log(
                '%c [OPTIMIZATION] celer empty API liquidity info',
                'background: #222; color: #bada55'
              );
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
              console.log(
                '%c [OPTIMIZATION] celer unsupported pair',
                'background: #222; color: #bada55'
              );
              return { reserveX: '0', reserveY: '0' };
            }

            return { reserveX: reserveX.toString(), reserveY: reserveY.toString() };
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
    const poolAndBase = debridgePools[poolBlockchain];
    const web3Public = Injector.web3PublicService.getWeb3Public(poolBlockchain) as EvmWeb3Public;

    if (
      ![inputToken.blockchain, outputToken.blockchain].some(
        blockchain => blockchain === BLOCKCHAIN_NAME.ETHEREUM
      )
    ) {
      console.log(
        '%c [OPTIMIZATION] debridge unsupported pair',
        'background: #222; color: #bada55'
      );
      return { reserveX: '0', reserveY: '0' };
    }

    const virtualPrice = await web3Public.callContractMethod(
      poolAndBase.base,
      debridgeBaseAbi,
      'get_virtual_price'
    );
    const zeroIndexTokens = await web3Public.callContractMethod(
      poolAndBase.pool,
      debridgePoolAbi,
      'balances',
      [0]
    );
    const firstIndexTokens = await web3Public.callContractMethod(
      poolAndBase.pool,
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
    let poolInfo: { address: string; decimals: [number, number]; blockchain: BlockchainName } =
      symbiosisPools[inputToken.blockchain][outputToken.blockchain] ||
      symbiosisPools[outputToken.blockchain][inputToken.blockchain];

    if (!poolInfo) {
      console.log(
        '%c [OPTIMIZATION] symbiosis unsupported pair',
        'background: #222; color: #bada55'
      );
      return { reserveX: '0', reserveY: '0' };
    }

    const web3Public = Injector.web3PublicService.getWeb3Public(
      poolInfo.blockchain
    ) as EvmWeb3Public;
    const zeroIndexTokenBalance = await web3Public.callContractMethod(
      poolInfo.address,
      symbiosisPoolAbi,
      'getTokenBalance',
      [0]
    );
    const firstIndexTokenBalance = await web3Public.callContractMethod(
      poolInfo.address,
      symbiosisPoolAbi,
      'getTokenBalance',
      [1]
    );

    return symbiosisPools[inputToken.blockchain][outputToken.blockchain]?.address ===
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
      frontBestTrade: {
        input: '0',
        output: '0',
        loss: '0'
      },
      bridges: { cBridge, deBridge, symbiosis }
    };
  }

  private optimize(payload: OptimizePayload): Observable<OptimizeResponse> {
    return this.httpClient.post<OptimizeResponse>(
      'https://cco.rubic.exchange/optimize',
      { ...payload },
      { withCredentials: false }
    );
  }
}
