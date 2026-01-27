import { Injectable } from '@angular/core';
import { WakuBroadcasterClient } from '@railgun-community/waku-broadcaster-client-web';
import { Chain, SelectedBroadcaster } from '@railgun-community/shared-models';
import { broadcasterChains } from '@features/privacy/constants/broadcaster-chains';

@Injectable({
  providedIn: 'root'
})
export class BroadcasterService {
  public async initAllBroadcasters(): Promise<void> {
    const initPromises = Object.values(broadcasterChains).map(chain => this.initBroadcaster(chain));
    await Promise.all(initPromises);
  }

  public async initBroadcaster(chain: Chain): Promise<void> {
    const config = {
      feeExpirationTimeout: 30_000,
      peerDiscoveryTimeout: 10_000,
      useDNSDiscovery: true,
      trustedFeeSigner: ''
    };
    const statusCallback = (status: unknown) => {
      console.log('Connection status:', chain, status);
    };
    await WakuBroadcasterClient.start(chain, config, statusCallback);
  }

  public async findBroadcaster(chain: Chain, tokenAddress: string): Promise<SelectedBroadcaster> {
    const selectedBroadcaster = await WakuBroadcasterClient.findBestBroadcaster(
      chain,
      tokenAddress,
      false // useRelayAdapt
    );

    if (selectedBroadcaster) {
      console.log('Found broadcaster:', selectedBroadcaster.railgunAddress);
    } else {
      console.log('No broadcaster found for this token');
    }

    return selectedBroadcaster;
  }

  public async sendTransaction(_chain: Chain, _tokenAddress: string): Promise<void> {
    // const txidVersion = TXIDVersion.V2_PoseidonMerkle; // or V3
    // const to = '0x...'; // Destination address
    // const data = '0x...'; // Transaction data
    // const nullifiers = ['0x...']; // Nullifiers
    // const overallBatchMinGasPrice = 1000000000n; // Min gas price
    // const useRelayAdapt = false; // Whether to use Relay Adapt
    // const preTransactionPOIs = {}; // POIs
    //
    // const selectedBroadcaster = await this.findBroadcaster(chain, tokenAddress);
    // if (!selectedBroadcaster) {
    //   console.error('No broadcaster available for the specified token.');
    //   return;
    // }
    //
    // const broadcasterTransaction = await BroadcasterTransaction.create(
    //   txidVersion,
    //   to,
    //   data,
    //   selectedBroadcaster.railgunAddress,
    //   selectedBroadcaster.feesID,
    //   chain,
    //   nullifiers,
    //   overallBatchMinGasPrice,
    //   useRelayAdapt,
    //   preTransactionPOIs
    // );
    //
    // try {
    //   const response = await BroadcasterTransaction.send(broadcasterTransaction);
    //   console.log('Transaction submitted. Tx Hash:', response.txHash);
    // } catch (error) {
    //   console.error('Failed to send transaction:', error);
    // }
  }
}
