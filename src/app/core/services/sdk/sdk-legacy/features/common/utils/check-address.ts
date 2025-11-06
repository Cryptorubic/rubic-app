import { nonEvmChainAddressCorrectResponse } from '../models/non-evm-chain-address-correct-response';
import {
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainTradeType
} from '../../cross-chain/calculation-manager/models/cross-chain-trade-type';
import {
  changenowApiBlockchain,
  ChangenowCrossChainSupportedBlockchain
} from '../../cross-chain/calculation-manager/providers/changenow-provider/constants/changenow-api-blockchain';
import { OnChainTradeType } from '../../on-chain/calculation-manager/models/on-chain-trade-type';
import { BlockchainName } from '@cryptorubic/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Web3Pure, web3PureStore } from '@cryptorubic/web3';

async function checkAllChainsAddressCorrect(address: string): Promise<boolean> {
  const we3PureClasses = Object.values(web3PureStore);
  const resp = await Promise.all(
    we3PureClasses.map(web3Pure => web3Pure.isAddressCorrect(address))
  );
  const isCorrect = resp.some(isAddress => isAddress);

  return isCorrect;
}

/**
 *
 * @param address
 * @param toBlockchain  is null when search goes through all chains
 * @param crossChainType
 */
export async function isAddressCorrect(
  address: string,
  toBlockchain: BlockchainName | null,
  httpClient: HttpClient,
  crossChainType?: CrossChainTradeType | OnChainTradeType
): Promise<boolean> {
  try {
    if (!toBlockchain) {
      return checkAllChainsAddressCorrect(address);
    }

    if (crossChainType === CROSS_CHAIN_TRADE_TYPE.CHANGENOW) {
      const chain = changenowApiBlockchain[toBlockchain as ChangenowCrossChainSupportedBlockchain];
      const response = await firstValueFrom(
        httpClient.get<nonEvmChainAddressCorrectResponse>(
          `https://api.changenow.io/v2/validate/address?currency=${chain.toLowerCase()}&address=${address}`
        )
      );
      return response.result;
    }
    return Web3Pure.isAddressCorrect(toBlockchain, address);
  } catch {
    return true;
  }
}
