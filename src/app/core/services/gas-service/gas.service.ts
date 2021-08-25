import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of, timer } from 'rxjs';
import { catchError, map, mergeMap, startWith } from 'rxjs/operators';
import { HttpService } from 'src/app/core/services/http/http.service';
import { EthGasPriceResponse } from 'src/app/core/services/gas-service/models/eth-gas-response';
import { BscGasResponse } from 'src/app/core/services/gas-service/models/bsc-gas-response';
import { PolygonGasResponse } from 'src/app/core/services/gas-service/models/polygon-gas-response';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';

interface NetworksGasPrice<T> {
  [BLOCKCHAIN_NAME.ETHEREUM]: T;
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: T;
  [BLOCKCHAIN_NAME.POLYGON]: T;
}

@Injectable({
  providedIn: 'root'
})
export class GasService {
  /**
   * Gas price functions for different networks.
   */
  private readonly gasPriceFunctions: NetworksGasPrice<() => Observable<number>>;

  /**
   * Current from blockchain.
   */
  private readonly fromChain$: Observable<BLOCKCHAIN_NAME | null>;

  /**
   * Current gas price subject.
   */
  private readonly currentNetworkGasPrice$: BehaviorSubject<number>;

  /**
   * Gas price update interval in seconds.
   */
  private readonly requestInterval: number;

  /**
   * Gas price for current network.
   */
  public get gasPrice(): Observable<number> {
    return this.currentNetworkGasPrice$.asObservable();
  }

  constructor(
    private readonly httpService: HttpService,
    private readonly swapFormService: SwapFormService
  ) {
    this.requestInterval = 60;
    this.fromChain$ = this.swapFormService.input.controls.fromBlockchain.valueChanges;
    this.currentNetworkGasPrice$ = new BehaviorSubject<number>(null);
    this.gasPriceFunctions = {
      [BLOCKCHAIN_NAME.ETHEREUM]: this.fetchEthGas.bind(this),
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: this.fetchBscGas.bind(this),
      [BLOCKCHAIN_NAME.POLYGON]: this.fetchPolygonGas.bind(this)
    };
    this.fetchGas();
  }

  /**
   * @description Fetch gas in current network.
   */
  public fetchGas(): void {
    const timer$ = timer(0, this.requestInterval * 1000);
    combineLatest([this.fromChain$.pipe(startWith(BLOCKCHAIN_NAME.ETHEREUM)), timer$])
      .pipe(
        mergeMap(([blockchainName, _]) => {
          if (this.gasPriceFunctions[blockchainName]) {
            return this.gasPriceFunctions[blockchainName]();
          }
          return null;
        })
      )
      .subscribe(gasPrice => {
        this.currentNetworkGasPrice$.next(gasPrice as number);
      });
  }

  /**
   * @description Get ETH gas from MyWish api.
   * @return Observable<number> Average gas price.
   */
  private fetchEthGas(): Observable<number | null> {
    const gasResponse$ = this.httpService
      .get('', null, 'https://gas-api.mywish.io/')
      .pipe(
        catchError(() =>
          this.httpService.get('', null, 'https://ethgasstation.info/api/ethgasAPI.json')
        )
      );
    return gasResponse$.pipe(
      map((el: EthGasPriceResponse) => el.average / 10),
      catchError(() => of(null))
    );
  }

  /**
   * @description Get BSC gas from BscGas api.
   * @return Observable<number> Average gas price.
   */
  private fetchBscGas(): Observable<number | null> {
    // Uncomment when bsc API will be ready
    // return this.httpService.get('', null, 'https://bscgas.info/gas/').pipe(
    //   map((el: BscGasResponse) => el.standard),
    //   catchError(() => of(null))
    // );
    return of(null);
  }

  /**
   * @description Get Polygon gas from gas station api.
   * @return Observable<number> Average gas price.
   */
  private fetchPolygonGas(): Observable<number | null> {
    return this.httpService.get('', null, 'https://gasstation-mainnet.matic.network/').pipe(
      map((el: PolygonGasResponse) => Math.floor(el.standard)),
      catchError(() => of(null))
    );
  }
}
