import { getInputUtxoAndBalance, Hinkal } from '@hinkal/common';
import { HinkalPrivateBalance } from '../../../../models/hinkal-private-balances';
import { BlockchainsInfo } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';

export class HinkalWorkerBalanceService {
  private readonly hinkal: Hinkal<unknown>;

  constructor(hinkal: Hinkal<unknown>) {
    this.hinkal = hinkal;
  }

  public async getBalances(): Promise<{ balances: HinkalPrivateBalance; chainId: number }> {
    const chainId = this.hinkal.getCurrentChainId();

    try {
      await this.hinkal.getEventsFromHinkal();
      const ethAddress = await this.hinkal.getEthereumAddress();
      const balances = await this.fetchBalances(chainId, ethAddress);
      const blockchain = BlockchainsInfo.getBlockchainNameById(chainId);
      return {
        balances: { [blockchain]: balances },
        chainId
      };
    } catch {
      return { chainId, balances: {} };
    }
  }

  private async fetchBalances(
    chainId: number,
    address: string
  ): Promise<{ tokenAddress: string; amount: string }[]> {
    try {
      const totalBalances = await this.hinkal.getTotalBalance().catch(() => []);
      console.log('TOTAL BALANCE', totalBalances);

      const { inputUtxos } = await getInputUtxoAndBalance({
        hinkal: this.hinkal,
        chainId,
        ethAddress: address,
        resetCacheBefore: false,
        allowRemoteDecryption: true
      });

      console.log('UTXO', inputUtxos);

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
        amount: amount.toString()
      }));
    } catch (err) {
      console.log('FETCHED BALANCE ERR', err);
      return [];
    }
  }
}
