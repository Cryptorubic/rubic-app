import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { LimitOrder } from '@core/services/limit-orders/models/limit-order';
import { AuthService } from '@core/services/auth/auth.service';
import { SdkService } from '@core/services/sdk/sdk.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { first } from 'rxjs/operators';
import { EvmBlockchainName } from 'rubic-sdk';

@Injectable()
export class LimitOrdersService {
  private readonly _orders$ = new BehaviorSubject<LimitOrder[]>([]);

  public readonly orders$ = this._orders$.asObservable();

  private readonly _loading$ = new BehaviorSubject(false);

  public readonly loading$ = this._loading$.asObservable();

  /**
   * Set to true by default and after orders list was changed.
   * Set to false after update.
   * @private
   */
  private dirtyState = true;

  constructor(
    private readonly authService: AuthService,
    private readonly sdkService: SdkService,
    private readonly tokensService: TokensService
  ) {}

  public async shouldUpdateOrders(): Promise<void> {
    if (this.dirtyState) {
      await this.updateOrders();
    }
  }

  private async updateOrders(): Promise<void> {
    const walletAddress = this.authService.userAddress;
    if (!walletAddress) {
      return;
    }

    this._loading$.next(true);
    this._orders$.next(await this.getUserTrades(walletAddress));
    this._loading$.next(false);
    this.dirtyState = false;
  }

  private async getUserTrades(walletAddress: string): Promise<LimitOrder[]> {
    const orders = await this.sdkService.limitOrderManager.getUserTrades(walletAddress);
    await firstValueFrom(this.tokensService.tokens$.pipe(first(v => Boolean(v))));
    return Promise.all(
      orders.map(async order => {
        const [fromToken, toToken] = await Promise.all([
          this.tokensService.findToken(order.fromToken, true),
          this.tokensService.findToken(order.toToken, true)
        ]);

        return {
          ...order,
          fromToken,
          toToken
        };
      })
    );
  }

  public setDirty(): void {
    this.dirtyState = true;
  }

  public async cancelOrder(blockchain: EvmBlockchainName, orderHash: string): Promise<void> {
    await this.sdkService.limitOrderManager.cancelOrder(blockchain, orderHash);
    const updatedOrders = this._orders$.value.filter(({ hash }) => hash === orderHash);
    this._orders$.next(updatedOrders);
  }
}
