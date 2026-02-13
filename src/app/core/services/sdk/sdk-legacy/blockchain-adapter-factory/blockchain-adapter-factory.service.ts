import { Injectable } from '@angular/core';
import { RubicError } from '@app/core/errors/models/rubic-error';
import { RubicAny } from '@app/shared/models/utility-types/rubic-any';
import {
  BitcoinBlockchainName,
  BlockchainName,
  EvmBlockchainName,
  SolanaBlockchainName,
  StellarBlockchainName,
  SuiBlockchainName,
  TonBlockchainName,
  TronBlockchainName
} from '@cryptorubic/core';
import {
  AbstractAdapter,
  BitcoinAdapter,
  EvmAdapter,
  BlockchainAdapterFactoryService as SdkAdapterFactory,
  SolanaAdapter,
  SuiAdapter,
  TonAdapter,
  TronAdapter
} from '@cryptorubic/web3';
import { StellarAdapter } from 'node_modules/@cryptorubic/web3/src/lib/adapter/adapters/adapter-stellar/stellar-adapter';

@Injectable({
  providedIn: 'root'
})
export class BlockchainAdapterFactoryService {
  private _adapterFactory: SdkAdapterFactory | null = null;

  public get adapterFactory(): SdkAdapterFactory {
    if (!this._adapterFactory) {
      throw new RubicError('_adapterFactory is not initialized.');
    }
    return this._adapterFactory;
  }

  /**
   * Set adapter factory from monorepo on app initialization
   */
  public setAdapterFactory(adapterFactory: SdkAdapterFactory): void {
    this._adapterFactory = adapterFactory;
  }

  public getAdapter(blockchain: SolanaBlockchainName): SolanaAdapter;
  public getAdapter(blockchain: EvmBlockchainName): EvmAdapter;
  public getAdapter(blockchain: TronBlockchainName): TronAdapter;
  public getAdapter(blockchain: TonBlockchainName): TonAdapter;
  public getAdapter(blockchain: SuiBlockchainName): SuiAdapter;
  public getAdapter(blockchain: BitcoinBlockchainName): BitcoinAdapter;
  public getAdapter(blockchain: StellarBlockchainName): StellarAdapter;
  public getAdapter(blockchain: BlockchainName): AbstractAdapter<unknown, unknown, BlockchainName> {
    return this.adapterFactory.getAdapter(blockchain as RubicAny);
  }
}
