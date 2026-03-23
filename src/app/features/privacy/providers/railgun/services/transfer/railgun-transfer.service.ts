import { inject, Injectable } from '@angular/core';
import { calculateGasPrice, RailgunERC20AmountRecipient } from '@railgun-community/shared-models';
import {
  getGasDetailsForTransaction,
  getProviderWallet,
  serializeERC20Transfer
} from '@features/privacy/providers/railgun/utils/tx-utils';
import { RailgunFacadeService } from '@features/privacy/providers/railgun/services/railgun-facade.service';
import {
  fromRubicToPrivateChainMap,
  RailgunSupportedChain
} from '@features/privacy/providers/railgun/constants/network-map';
import { waitFor } from '@cryptorubic/web3';
import { BehaviorSubject } from 'rxjs';
import { RubicError } from '@core/errors/models/rubic-error';
import { GasService } from '@core/services/gas-service/gas.service';

@Injectable()
export class RailgunTransferService {
  private readonly railgunFacade = inject(RailgunFacadeService);

  private readonly _inProgress$ = new BehaviorSubject(false);

  private readonly gasService = inject(GasService);

  public async transferTokens(
    tokenAddress: string,
    tokenAmount: string,
    receiver: string,
    proofProgress: (progress: string) => void,
    blockchain: RailgunSupportedChain
  ): Promise<void> {
    try {
      if (this._inProgress$.value === true) {
        throw new RubicError(`Previos transfer hasn't done yet. Wait a bit.`);
      }
      this._inProgress$.next(true);
      const erc20AmountRecipients: RailgunERC20AmountRecipient[] = [
        serializeERC20Transfer(tokenAddress, BigInt(tokenAmount), receiver)
      ];
      const chain = fromRubicToPrivateChainMap[blockchain];

      const { gasEstimate } = await this.railgunFacade.gasEstimateForTransfer(
        chain,
        erc20AmountRecipients
      );

      // generate proof
      await this.railgunFacade.generateTransferProof(chain, erc20AmountRecipients, proofProgress);

      await waitFor(5_000);

      const mnemonic = await this.railgunFacade.getMnemonic();
      const { wallet } = getProviderWallet(blockchain, mnemonic);

      const transactionGasDetails = await getGasDetailsForTransaction(
        chain,
        gasEstimate,
        true,
        this.gasService
      );

      const overallBatchMinGasPrice = calculateGasPrice(transactionGasDetails);

      // populate tx

      const { transaction } = await this.railgunFacade.populateTransfer(
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
