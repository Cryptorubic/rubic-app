import { Observable } from 'rxjs';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { SupportedTokensInfo } from '../models/SupportedTokensInfo';
import { SWAP_PROVIDER_TYPE } from '../models/SwapProviderType';

export abstract class SwapProvider {
  public abstract tokens: Observable<SupportedTokensInfo>;

  public TYPE: SWAP_PROVIDER_TYPE;

  protected getSupportedTokensInfoTemplate(): SupportedTokensInfo {
    const supportedBlockchains = Object.values(BLOCKCHAIN_NAME);

    const arrayToObject = (array: any[], value: any) =>
      array.reduce((acc, elem) => {
        acc[elem] = {
          ...value
        };
        return acc;
      }, {});

    const subObject = arrayToObject(supportedBlockchains, []);

    return arrayToObject(supportedBlockchains, subObject);
  }
}
