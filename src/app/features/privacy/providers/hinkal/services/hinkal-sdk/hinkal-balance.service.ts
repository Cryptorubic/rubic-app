import { Injectable } from '@angular/core';
import { HinkalInstanceService } from './hinkal-instance.service';
import { BehaviorSubject } from 'rxjs';
import { HinkalPrivateBalance } from '../../models/hinkal-private-balances';
import { blockchainId, EvmBlockchainName } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { getInputUtxoAndBalance } from '@hinkal/common';
import { HINKAL_SUPPORTED_CHAINS } from '../../constants/hinkal-supported-chains';

@Injectable()
export class HinkalBalanceService {
  constructor(private readonly hinkalInstanceService: HinkalInstanceService) {}

  private readonly _balances$ = new BehaviorSubject<HinkalPrivateBalance>({});

  public readonly balances$ = this._balances$.asObservable();

  public async refreshBalances(): Promise<void> {
    try {
      const ethAddress = await this.hinkalInstanceService.hinkalInstance.getEthereumAddress();

      const promises = HINKAL_SUPPORTED_CHAINS.map(chain => {
        return this.fetcPrivateBalances(chain, ethAddress);
      });

      const balances = await Promise.all(promises);

      this._balances$.next(
        Object.fromEntries(HINKAL_SUPPORTED_CHAINS.map((chain, i) => [chain, balances[i]]))
      );
    } catch (err) {
      console.error('FAILED TO REFRESH HINKAL BALANCES', err);
    }
  }

  private async fetcPrivateBalances(
    blockchain: EvmBlockchainName,
    address: string
  ): Promise<{ tokenAddress: string; amount: BigNumber }[]> {
    try {
      const hinkalInstance = this.hinkalInstanceService.hinkalInstance;

      const { inputUtxos } = await getInputUtxoAndBalance({
        hinkal: hinkalInstance,
        chainId: blockchainId[blockchain],
        resetCacheBefore: true,
        allowRemoteDecryption: true,
        ethAddress: address,
        passedShieldedPrivateKey: hinkalInstance.userKeys.getShieldedPrivateKey(),
        passedShieldedPublicKey: hinkalInstance.userKeys.getShieldedPublicKey()
      });
      const fetchedBalances = inputUtxos.reduce((acc, val) => {
        const balance = acc[val.erc20TokenAddress.toLowerCase()];
        const currAmount = new BigNumber(val.amount.toString());

        return {
          ...acc,
          [val.erc20TokenAddress.toLowerCase()]: balance ? balance.plus(currAmount) : currAmount
        };
      }, {} as Record<string, BigNumber>);

      return Object.entries(fetchedBalances).map(([token, amount]) => ({
        tokenAddress: token,
        amount
      }));
    } catch (err) {
      console.error('FAILED TO FETCH HINKAL BALANCE', err);
      return [];
    }
  }
}
