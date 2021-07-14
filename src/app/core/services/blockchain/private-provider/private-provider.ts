import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { Token } from 'src/app/shared/models/tokens/Token';
import { AddEthChainParams } from 'src/app/shared/models/blockchain/add-eth-chain-params';
import { WALLET_NAME } from '../../../header/components/header/components/wallets-modal/models/providers';

export abstract class PrivateProvider {
  /**
   * @description is the blockchain provider installed
   */
  abstract get isInstalled(): boolean;

  /**
   * @description is the blockchain provider activated
   */
  abstract get isActive(): boolean;

  /**
   * @description Current provider name.
   */
  abstract get name(): WALLET_NAME;

  /**
   * @description current selected wallet address
   * @return current selected wallet address or undefined if isActive is false
   */
  get address(): string {
    if (!this.isActive) {
      return null;
    }
    return this.getAddress();
  }

  /**
   * @description current selected network
   * @return current selected network or undefined if isActive is false
   */
  get network(): IBlockchain {
    if (!this.isActive) {
      return null;
    }
    return this.getNetwork();
  }

  /**
   * @description default value for transactions gasLimit. Required for tests provider stub
   */
  public readonly defaultGasLimit: string | undefined = undefined;

  public errorsService: ErrorsService;

  public abstract getAddress(): string;

  public abstract getNetwork(): IBlockchain;

  protected constructor(errorsService: ErrorsService) {
    this.errorsService = errorsService;
  }

  /**
   * @description current selected network name
   * @return current selected network name or undefined if isActive is false
   */
  get networkName(): BLOCKCHAIN_NAME {
    return this.network?.name;
  }

  /**
   * @description activate the blockchain provider
   */
  public abstract activate(): Promise<void>;

  /**
   * @description deactivate the blockchain provider
   */
  public abstract deActivate(): void;

  /**
   * @description opens a window with suggestion to add token to user's wallet
   * @param token token to add
   */
  public abstract addToken(token: Token): Promise<void>;

  public async requestPermissions(): Promise<unknown[]> {
    return [{ parentCapability: 'eth_accounts' }];
  }

  public abstract switchChain(chainParams: string): Promise<null | never>;

  public abstract addChain(params: AddEthChainParams): Promise<null | never>;
}
