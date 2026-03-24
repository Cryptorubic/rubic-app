import { inject, Injectable } from '@angular/core';
import { calculateGasPrice, RailgunERC20AmountRecipient } from '@railgun-community/shared-models';
import {
  getGasDetailsForTransaction,
  getProviderWallet,
  serializeERC20Transfer
} from '@features/privacy/providers/railgun/utils/tx-utils';
import { RailgunFacadeService } from '@features/privacy/providers/railgun/services/railgun-facade.service';
import { AuthService } from '@core/services/auth/auth.service';
import {
  fromRubicToPrivateChainMap,
  RailgunSupportedChain
} from '@features/privacy/providers/railgun/constants/network-map';
import { waitFor } from '@cryptorubic/web3';
import { RubicError } from '@core/errors/models/rubic-error';
import { BehaviorSubject } from 'rxjs';
import { GasService } from '@core/services/gas-service/gas.service';

@Injectable()
export class RevealService {
  private readonly railgunFacade = inject(RailgunFacadeService);

  private readonly authService = inject(AuthService);

  private readonly _inProgress$ = new BehaviorSubject(false);

  private readonly gasService = inject(GasService);

  public async unshield(
    tokenAddress: string,
    tokenAmount: string,
    proofProgress: (progress: string) => void,
    tokenBlockchain: RailgunSupportedChain
  ): Promise<void> {
    try {
      if (this._inProgress$.value === true) {
        throw new RubicError(`Previos transfer hasn't done yet. Wait a bit.`);
      }
      this._inProgress$.next(true);
      const erc20AmountRecipients: RailgunERC20AmountRecipient[] = [
        serializeERC20Transfer(tokenAddress, BigInt(tokenAmount), this.authService.userAddress)
      ];
      const chain = fromRubicToPrivateChainMap[tokenBlockchain];

      const { gasEstimate } = await this.railgunFacade.gasEstimateForUnshield(
        chain,
        erc20AmountRecipients
      );

      // generate unshield proof
      await this.railgunFacade.generateUnshieldProof(chain, erc20AmountRecipients, proofProgress);

      await waitFor(5_000);

      const mnemonic = await this.railgunFacade.getMnemonic();
      const { wallet } = getProviderWallet(tokenBlockchain, mnemonic);

      const transactionGasDetails = await getGasDetailsForTransaction(
        chain,
        gasEstimate,
        true,
        this.gasService
      );

      const overallBatchMinGasPrice = calculateGasPrice(transactionGasDetails);

      const { transaction } = await this.railgunFacade.populateUnshield(
        chain,
        erc20AmountRecipients,
        transactionGasDetails,
        overallBatchMinGasPrice
      );

      await wallet.sendTransaction(transaction);
    } catch (err) {
      throw err;
    } finally {
      setTimeout(() => {
        this._inProgress$.next(false);
      }, 10_000);
    }
  }
}
