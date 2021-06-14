import { Observable } from 'rxjs';
import { SupportedTokensInfo } from '../models/SupportedTokensInfo';
import { SWAP_PROVIDER_TYPE } from '../models/SwapProviderType';

export abstract class SwapProvider {
  public abstract tokens: Observable<SupportedTokensInfo>;

  public abstract TYPE: SWAP_PROVIDER_TYPE;
}
