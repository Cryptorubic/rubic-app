import { inject, Injectable } from '@angular/core';
import {
  NETWORK_CONFIG,
  NetworkName,
  RailgunERC20AmountRecipient
} from '@railgun-community/shared-models';
import { Contract, HDNodeWallet, Wallet } from 'ethers';
import {
  getGasDetailsForTransaction,
  getProviderWallet,
  getShieldSignature,
  serializeERC20Transfer
} from '@features/privacy/providers/railgun/utils/tx-utils';
import { PopulateShieldResult } from '@features/privacy/providers/railgun/models/shield';
import { RailgunFacadeService } from '@features/privacy/providers/railgun/services/railgun-facade.service';
import { AuthService } from '@core/services/auth/auth.service';
import { BlockchainAdapterFactoryService } from '@core/services/sdk/sdk-legacy/blockchain-adapter-factory/blockchain-adapter-factory.service';
import { fromPrivateToRubicChainMap } from '@features/privacy/providers/railgun/constants/network-map';
import { PrivacySupportedNetworks } from '@features/privacy/providers/railgun/models/supported-networks';
import { Web3Pure } from '@cryptorubic/web3';
import { wrappedNativeTokensList } from '@cryptorubic/core';
import { PrivateLocalStorageService } from '@app/features/privacy/services/privacy-local-storage.service';
import { PRIVATE_TRADE_TYPE } from '@app/features/privacy/constants/private-trade-types';

@Injectable()
export class HideService {
  private readonly railgunFacade = inject(RailgunFacadeService);

  private readonly authService = inject(AuthService);

  private readonly adaptersFactory = inject(BlockchainAdapterFactoryService);

  private readonly privateLocalStorageService = inject(PrivateLocalStorageService);

  /**
   * Ensures allowances for all ERC-20 transfers in the shield request.
   * Approves spender for the exact amount if current allowance is insufficient.
   */
  public async ensureErc20Allowances(
    network: NetworkName,
    wallet: Wallet | HDNodeWallet,
    erc20AmountRecipients: RailgunERC20AmountRecipient[]
  ): Promise<void> {
    const spender = NETWORK_CONFIG[network].proxyContract;

    for (const amountRecipient of erc20AmountRecipients) {
      const contract = new Contract(
        amountRecipient.tokenAddress,
        [
          'function allowance(address owner, address spender) view returns (uint256)',
          'function approve(address spender, uint256 amount) external returns (bool)'
        ],
        wallet
      );

      // Ethers returns bigint in v6 for uint256
      const allowance: bigint = await contract.allowance(wallet.address, spender);

      if (allowance >= amountRecipient.amount) {
        continue;
      }

      const tx = await contract.approve(spender, amountRecipient.amount);
      await tx.wait();
    }
  }

  /**
   * Populates the actual transaction data for shielding, including gas details.
   */
  public async erc20PopulateShieldTransaction(
    network: PrivacySupportedNetworks,
    wallet: Wallet | HDNodeWallet,
    erc20AmountRecipients: RailgunERC20AmountRecipient[],
    sendWithPublicWallet: boolean
  ): Promise<PopulateShieldResult> {
    // 1) Ensure token approvals
    await this.ensureErc20Allowances(network, wallet, erc20AmountRecipients);

    // 2) Estimate gas for shield
    const { gasEstimate } = await this.railgunFacade.gasEstimateForShield(
      network,
      wallet,
      erc20AmountRecipients
    );

    // 3) Get shield private key and gas details
    const shieldPrivateKey = await getShieldSignature(wallet);

    const gasDetails = await getGasDetailsForTransaction(
      network,
      gasEstimate,
      sendWithPublicWallet,
      wallet
    );

    // 4) Populate shield transaction
    const { transaction, nullifiers } = await this.railgunFacade.populateShield(
      network,
      erc20AmountRecipients,
      shieldPrivateKey,
      gasDetails
    );

    return {
      gasEstimate,
      gasDetails,
      transaction,
      nullifiers
    };
  }

  /**
   * Populates the actual transaction data for shielding, including gas details.
   */
  public async nativePopulateShieldTransaction(
    network: PrivacySupportedNetworks,
    wallet: Wallet | HDNodeWallet,
    erc20AmountRecipients: RailgunERC20AmountRecipient[],
    sendWithPublicWallet: boolean
  ): Promise<PopulateShieldResult> {
    const { gasEstimate } = await this.railgunFacade.gasEstimateForShieldNative(
      network,
      wallet,
      erc20AmountRecipients
    );

    const gasDetails = await getGasDetailsForTransaction(
      network,
      gasEstimate,
      sendWithPublicWallet,
      wallet
    );

    const shieldPrivateKey = await getShieldSignature(wallet);

    const { transaction, nullifiers } = await this.railgunFacade.populateShieldNative(
      network,
      erc20AmountRecipients,
      shieldPrivateKey,
      gasDetails
    );

    return {
      gasEstimate,
      gasDetails,
      transaction,
      nullifiers
    };
  }

  /**
   * High-level helper: creates recipients, populates tx, sends it, waits for confirmation.
   */
  public async shield(
    railgunWalletAddress: string,
    tokenAddress: string,
    tokenAmount: bigint,
    opts: {
      network: PrivacySupportedNetworks;
      sendWithPublicWallet?: boolean;
      wallet?: Wallet | HDNodeWallet;
    }
  ): Promise<{
    txHash: string;
    gasEstimate: bigint;
    gasDetails: unknown;
    nullifiers: unknown;
  }> {
    const network = opts.network;
    const sendWithPublicWallet = opts?.sendWithPublicWallet ?? true;

    const mnemonic = await this.railgunFacade.getMnemonic();
    const blockchain = fromPrivateToRubicChainMap[network];
    const { wallet } = getProviderWallet(blockchain, mnemonic);

    const isNative = Web3Pure.isNativeAddress(blockchain, tokenAddress);
    const erc20TokenAddress = isNative ? wrappedNativeTokensList[blockchain].address : tokenAddress;

    const erc20AmountRecipients: RailgunERC20AmountRecipient[] = [
      serializeERC20Transfer(erc20TokenAddress, tokenAmount, railgunWalletAddress)
    ];

    const { gasEstimate, gasDetails, transaction, nullifiers } = isNative
      ? await this.nativePopulateShieldTransaction(
          network,
          wallet,
          erc20AmountRecipients,
          sendWithPublicWallet
        )
      : await this.erc20PopulateShieldTransaction(
          network,
          wallet,
          erc20AmountRecipients,
          sendWithPublicWallet
        );

    const sentTx = await wallet.sendTransaction(transaction);
    await sentTx.wait();

    this.privateLocalStorageService.markProviderAsShielded(PRIVATE_TRADE_TYPE.RAILGUN);

    return {
      txHash: sentTx.hash,
      gasEstimate,
      gasDetails,
      nullifiers
    };
  }
}
