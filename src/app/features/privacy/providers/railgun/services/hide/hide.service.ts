import { inject, Injectable } from '@angular/core';
import {
  NETWORK_CONFIG,
  NetworkName,
  RailgunERC20AmountRecipient,
  TXIDVersion
} from '@railgun-community/shared-models';
import { HDNodeWallet, Wallet } from 'ethers';
import { gasEstimateForShield, populateShield } from '@railgun-community/wallet';
import {
  getGasDetailsForTransaction,
  getShieldSignature,
  serializeERC20Transfer
} from '@features/privacy/providers/railgun/utils/tx-utils';
import { PopulateShieldResult } from '@features/privacy/providers/railgun/models/shield';
import { RailgunFacadeService } from '@features/privacy/providers/railgun/services/railgun-facade.service';
import { AuthService } from '@core/services/auth/auth.service';
import { BlockchainAdapterFactoryService } from '@core/services/sdk/sdk-legacy/blockchain-adapter-factory/blockchain-adapter-factory.service';
import { PrivacySupportedNetworks } from '@features/privacy/providers/railgun/models/supported-networks';
import { fromPrivateToRubicChainMap } from '@features/privacy/providers/railgun/constants/network-map';
import { erc20Abi, PublicClient, WalletClient } from 'viem';

@Injectable()
export class HideService {
  private readonly railgunFacade = inject(RailgunFacadeService);

  private readonly authService = inject(AuthService);

  private readonly adaptersFactory = inject(BlockchainAdapterFactoryService);

  /**
   * Estimates gas for an ERC-20 shield transaction.
   */
  public async erc20ShieldGasEstimate(
    network: PrivacySupportedNetworks,
    walletAddress: string,
    erc20AmountRecipients: RailgunERC20AmountRecipient[]
  ): Promise<bigint> {
    const blockchain = fromPrivateToRubicChainMap[network];
    const adapter = this.adaptersFactory.getAdapter(blockchain);
    // @ts-ignore
    const client = adapter.signer.wallet as WalletClient;

    const shieldPrivateKey = await getShieldSignature(client, this.authService.userAddress);

    // Address of public wallet we are shielding from

    const { gasEstimate } = await gasEstimateForShield(
      TXIDVersion.V2_PoseidonMerkle,
      network,
      shieldPrivateKey,
      erc20AmountRecipients,
      [], // nftAmountRecipients
      walletAddress
    );

    return gasEstimate;
  }

  /**
   * Ensures allowances for all ERC-20 transfers in the shield request.
   * Approves spender for the exact amount if current allowance is insufficient.
   */
  public async ensureErc20Allowances(
    network: PrivacySupportedNetworks,
    walletAddress: string,
    erc20AmountRecipients: RailgunERC20AmountRecipient[]
  ): Promise<void> {
    const spender = NETWORK_CONFIG[network].proxyContract;
    const adapter = this.adaptersFactory.getAdapter(fromPrivateToRubicChainMap[network]);

    // @ts-ignore
    const publicClient = adapter.public as PublicClient;
    const walletClient = adapter.signer;

    for (const amountRecipient of erc20AmountRecipients) {
      // Ethers returns bigint in v6 for uint256
      const allowance = await publicClient.readContract({
        address: amountRecipient.tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [walletAddress as `0x${string}`, spender as `0x${string}`]
      });

      if (allowance >= amountRecipient.amount) {
        continue;
      }

      await walletClient.writeContract(
        amountRecipient.tokenAddress as `0x${string}`,
        erc20Abi,
        'approve',
        '0x',
        [spender as `0x${string}`, amountRecipient.amount]
      );
    }
  }

  /**
   * Populates the actual transaction data for shielding, including gas details.
   */
  public async erc20PopulateShieldTransaction(
    network: PrivacySupportedNetworks,
    erc20AmountRecipients: RailgunERC20AmountRecipient[]
  ): Promise<PopulateShieldResult> {
    const blockchain = fromPrivateToRubicChainMap[network];
    const adapter = this.adaptersFactory.getAdapter(blockchain);
    // @ts-ignore
    const client = adapter.public as PublicClient;

    // @ts-ignore
    const walletClient = adapter.signer.wallet as WalletClient;

    // 1) Ensure token approvals
    await this.ensureErc20Allowances(network, this.authService.userAddress, erc20AmountRecipients);

    // 2) Estimate gas for shield
    const gasEstimate = await this.erc20ShieldGasEstimate(
      network,
      this.authService.userAddress,
      erc20AmountRecipients
    );

    // 3) Get shield private key and gas details
    const shieldPrivateKey = await getShieldSignature(walletClient, this.authService.userAddress);

    const gasDetails = await getGasDetailsForTransaction(network, gasEstimate, true, client);

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
      network?: PrivacySupportedNetworks;
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

    const blockchain = fromPrivateToRubicChainMap[network];
    const adapter = this.adaptersFactory.getAdapter(blockchain);

    // const wallet = opts?.wallet ?? this.railgunFacade.getProviderWallet();

    const erc20AmountRecipients: RailgunERC20AmountRecipient[] = [
      serializeERC20Transfer(tokenAddress, tokenAmount, railgunWalletAddress)
    ];

    const { gasEstimate, gasDetails, transaction, nullifiers } =
      await this.erc20PopulateShieldTransaction(network, erc20AmountRecipients);

    const sentTx = await adapter.signer.sendTransaction({
      txOptions: transaction
    });

    return {
      txHash: sentTx.transactionHash,
      gasEstimate,
      gasDetails,
      nullifiers
    };
  }
}
