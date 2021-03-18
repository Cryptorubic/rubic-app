import Web3 from 'web3';

import { BehaviorSubject } from 'rxjs';
import { IBlockchain } from '../../../../shared/models/blockchain/IBlockchain';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';

export abstract class PrivateProvider {
  /**
   * @description default value for transactions gasLimit. Required for tests provider stub
   */
  public readonly defaultGasLimit: string | undefined = undefined;

  /**
   * @description observable address of the selected wallet
   */
  public abstract readonly onAddressChanges: BehaviorSubject<string>;

  /**
   * @description observable value of the network id and name
   */
  public abstract readonly onNetworkChanges: BehaviorSubject<IBlockchain>;

  /**
   * @description an instance of web3 to access the blockchain
   */
  abstract get web3(): Web3;

  /**
   * @description is the blockchain provider installed
   */
  abstract get isInstalled(): boolean;

  /**
   * @description is the blockchain provider activated
   */
  abstract get isActive(): boolean;

  /**
   * @description current selected wallet address
   * @return current selected wallet address or undefined if isActive is false
   */
  get address(): string {
    if (!this.isActive) {
      return undefined;
    }
    return this.getAddress();
  }

  protected abstract getAddress(): string;

  /**
   * @description current selected network
   * @return current selected network or undefined if isActive is false
   */
  get network(): IBlockchain {
    if (!this.isActive) {
      return undefined;
    }
    return this.getNetwork();
  }

  protected abstract getNetwork(): IBlockchain;

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
  public abstract async activate(): Promise<void>;

  /**
   * @description deactivate the blockchain provider
   */
  public abstract deActivate(): void;
}
