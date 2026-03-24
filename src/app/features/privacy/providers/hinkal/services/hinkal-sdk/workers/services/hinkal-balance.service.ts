import { getApprovedUtxos, getInputUtxoAndBalance, Hinkal } from '@hinkal/common';
import { HinkalPrivateBalance } from '../../../../models/hinkal-private-balances';
import { BlockchainsInfo } from '@cryptorubic/core';

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
      const approvedUtxos = await getApprovedUtxos(this.hinkal, false);

      const { inputUtxos } = await getInputUtxoAndBalance({
        hinkal: this.hinkal,
        chainId,
        ethAddress: address,
        resetCacheBefore: false,
        allowRemoteDecryption: true
      });

      const allUtxoAddresses = [
        ...inputUtxos.map(utxo => ({ tokenAddress: utxo.erc20TokenAddress, amount: utxo.amount })),
        ...approvedUtxos.map(utxo => ({ tokenAddress: utxo.tokenAddress, amount: utxo.amount }))
      ];

      console.log('UTXO', allUtxoAddresses);

      const fetchedBalances = allUtxoAddresses.reduce((acc, val) => {
        const balance = acc[val.tokenAddress.toLowerCase()];
        const currAmount = val.amount;
        acc[val.tokenAddress.toLowerCase()] = balance ? balance + currAmount : currAmount;

        return acc;
      }, {} as Record<string, bigint>);

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
