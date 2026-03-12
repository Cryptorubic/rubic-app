import { Injectable } from '@angular/core';
import { ZamaSupportedTokens } from './models/zama-supported-tokens';
import { ZAMA_SUPPORTED_CHAINS } from '../../constants/chains';
import { EvmBlockchainName } from '@cryptorubic/core';
import { BlockchainAdapterFactoryService } from '@app/core/services/sdk/sdk-legacy/blockchain-adapter-factory/blockchain-adapter-factory.service';
import { EvmAdapter } from '@cryptorubic/web3';
import { ZAMA_SUPPORTED_TOKENS } from './constants/zama-tokens';

@Injectable()
export class ZamaTokensService {
  constructor(private readonly adapterFactory: BlockchainAdapterFactoryService) {}

  private getAdapter(blockchain: EvmBlockchainName): EvmAdapter {
    return this.adapterFactory.getAdapter(blockchain);
  }

  private _supportedTokensMapping: ZamaSupportedTokens;

  public get supportedTokensMapping(): ZamaSupportedTokens {
    return this._supportedTokensMapping || {};
  }

  public async initTokensMapping(): Promise<void> {
    try {
      const tokens = await Promise.all(
        ZAMA_SUPPORTED_CHAINS.map(blockchain => this.getShieldedTokenMapping(blockchain))
      );
      this._supportedTokensMapping = Object.fromEntries(
        ZAMA_SUPPORTED_CHAINS.map((chain, i) => [chain, tokens[i]])
      ) as ZamaSupportedTokens;
    } catch (err) {
      console.error(`FAILED TO GET SHIELDED TOKENS`, err);
      // this._supportedTokensMapping = {};
    }
  }

  private async getShieldedTokenMapping(
    blockchain: EvmBlockchainName
  ): Promise<{ tokenAddress: string; shieldedTokenAddress: string }[]> {
    // @TODO fetch token mapping from tokenWrapperRegistry contract
    const tokens = ZAMA_SUPPORTED_TOKENS[blockchain];
    return tokens || [];
    // try {
    //   const tokenRegistryContract = TOKEN_WRAPPER_REGISTRY_ADDRESSES[blockchain];
    //   const adapter = this.getAdapter(blockchain);

    //   const resp = await adapter.read<
    //     { confidentialTokenAddress: string; tokenAddress: string; isValid: boolean }[]
    //   >(tokenRegistryContract, TOKEN_WRAPPER_REGISTRY_ABI, 'getTokenConfidentialTokenPairs', []);

    //   return resp.map(tokenInfo => ({
    //     tokenAddress: tokenInfo.tokenAddress,
    //     shieldedTokenAddress: tokenInfo.confidentialTokenAddress
    //   }));
    // } catch (err) {
    //   console.error(`FAILED TO GET ${blockchain} SHIELDED TOKENS`, err);
    //   return [];
    // }
  }
}
