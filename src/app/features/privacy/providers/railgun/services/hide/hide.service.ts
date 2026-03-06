import { inject, Injectable } from '@angular/core';
import {
  NETWORK_CONFIG,
  NetworkName,
  RailgunERC20AmountRecipient,
  TXIDVersion
} from '@railgun-community/shared-models';
import { Contract, HDNodeWallet, Wallet } from 'ethers';
import { gasEstimateForShield, populateShield } from '@railgun-community/wallet';
import {
  getGasDetailsForTransaction,
  getShieldSignature,
  serializeERC20Transfer
} from '@features/privacy/providers/railgun/utils/tx-utils';
import { PopulateShieldResult } from '@features/privacy/providers/railgun/models/shield';
import { MnemonicService } from '@features/privacy/providers/railgun/services/mnemonic/mnemonic.service';

@Injectable({
  providedIn: 'root'
})
export class HideService {
  private readonly mnemonicService = inject(MnemonicService);

  /**
   * Estimates gas for an ERC-20 shield transaction.
   */
  public async erc20ShieldGasEstimate(
    network: NetworkName,
    wallet: Wallet | HDNodeWallet,
    erc20AmountRecipients: RailgunERC20AmountRecipient[]
  ): Promise<bigint> {
    const shieldPrivateKey = await getShieldSignature(wallet);

    // Address of public wallet we are shielding from
    const fromWalletAddress = wallet.address;

    const { gasEstimate } = await gasEstimateForShield(
      TXIDVersion.V2_PoseidonMerkle,
      network,
      shieldPrivateKey,
      erc20AmountRecipients,
      [], // nftAmountRecipients
      fromWalletAddress
    );

    return gasEstimate;
  }

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
    network: NetworkName,
    wallet: Wallet | HDNodeWallet,
    erc20AmountRecipients: RailgunERC20AmountRecipient[],
    sendWithPublicWallet: boolean
  ): Promise<PopulateShieldResult> {
    // 1) Ensure token approvals
    await this.ensureErc20Allowances(network, wallet, erc20AmountRecipients);

    // 2) Estimate gas for shield
    const gasEstimate = await this.erc20ShieldGasEstimate(network, wallet, erc20AmountRecipients);

    // 3) Get shield private key and gas details
    const shieldPrivateKey = await getShieldSignature(wallet);

    const gasDetails = await getGasDetailsForTransaction(
      network,
      gasEstimate,
      sendWithPublicWallet,
      wallet
    );

    // 4) Populate shield transaction
    const { transaction, nullifiers } = await populateShield(
      TXIDVersion.V2_PoseidonMerkle,
      network,
      shieldPrivateKey,
      erc20AmountRecipients,
      [],
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
  public async shieldERC20(
    railgunWalletAddress: string,
    tokenAddress: string,
    tokenAmount: bigint,
    opts?: {
      network?: NetworkName;
      sendWithPublicWallet?: boolean;
      wallet?: Wallet | HDNodeWallet;
    }
  ): Promise<{
    txHash: string;
    gasEstimate: bigint;
    gasDetails: unknown;
    nullifiers: unknown;
  }> {
    const network = opts?.network || NetworkName.Polygon;
    const sendWithPublicWallet = opts?.sendWithPublicWallet ?? true;

    const wallet = opts?.wallet ?? this.mnemonicService.getProviderWallet().wallet;

    const erc20AmountRecipients: RailgunERC20AmountRecipient[] = [
      serializeERC20Transfer(tokenAddress, tokenAmount, railgunWalletAddress)
    ];

    const { gasEstimate, gasDetails, transaction, nullifiers } =
      await this.erc20PopulateShieldTransaction(
        network,
        wallet,
        erc20AmountRecipients,
        sendWithPublicWallet
      );

    const sentTx = await wallet.sendTransaction(transaction);
    await sentTx.wait();

    return {
      txHash: sentTx.hash,
      gasEstimate,
      gasDetails,
      nullifiers
    };
  }
}
