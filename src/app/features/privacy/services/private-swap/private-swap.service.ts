import { inject, Injectable } from '@angular/core';
import {
  calculateGasPrice,
  NETWORK_CONFIG,
  NetworkName,
  RailgunERC20Amount,
  RailgunERC20AmountRecipient,
  RailgunERC20Recipient,
  RailgunNFTAmount,
  RailgunNFTAmountRecipient,
  RailgunPopulateTransactionResponse,
  RailgunWalletInfo,
  RelayAdaptContract,
  TransactionGasDetails,
  TXIDVersion
} from '@railgun-community/shared-models';
import { MnemonicService } from '@features/privacy/services/mnemonic/mnemonic.service';
import {
  getGasDetailsForTransaction,
  getOriginalGasDetailsForTransaction,
  serializeERC20RelayAdaptUnshield,
  serializeERC20Transfer
} from '@features/privacy/utils/tx-utils';
import { Contract, ContractTransaction, HDNodeWallet, Wallet } from 'ethers';
import { encodeFunctionData, erc20Abi } from 'viem';
import { RubicApiService } from '@core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';
import { BLOCKCHAIN_NAME } from '@cryptorubic/core';
import { EvmTransactionConfig } from '@cryptorubic/web3';
import {
  gasEstimateForUnprovenCrossContractCalls,
  generateCrossContractCallsProof,
  populateProvedCrossContractCalls
} from '@railgun-community/wallet';
import { EncryptionService } from '@features/privacy/services/encryption/encryption.service';
import {
  RecipeERC20Info,
  RecipeInput,
  setRailgunFees,
  ZeroXSwapRecipe
} from '@railgun-community/cookbook';

@Injectable({
  providedIn: 'root'
})
export class PrivateSwapService {
  private readonly mnemonicService = inject(MnemonicService);

  private readonly encryptionService = inject(EncryptionService);

  private readonly apiService = inject(RubicApiService);

  public async getRates(
    tokenFromAddress: string,
    tokenFromAmount: string,
    tokenToAddress: string
  ): Promise<string> {
    const amountAfterFee = (BigInt(tokenFromAmount) * 9975n) / 10_000n;
    const { wallet } = this.mnemonicService.getProviderWallet();

    const swapData = await this.apiService.fetchBestSwapData<EvmTransactionConfig>({
      srcTokenAddress: tokenFromAddress,
      dstTokenAddress: tokenToAddress,
      srcTokenAmount: amountAfterFee.toString(),
      srcTokenBlockchain: BLOCKCHAIN_NAME.POLYGON,
      dstTokenBlockchain: BLOCKCHAIN_NAME.POLYGON,
      receiver: wallet.address,
      fromAddress: wallet.address,
      enableChecks: false
    });

    return swapData.estimate.destinationTokenAmount;
  }

  public async crossContractCall(
    railgunWalletInfo: RailgunWalletInfo,
    tokenFromAddress: string,
    tokenFromAmount: string,
    tokenToAddress: string
  ): Promise<void> {
    const { wallet } = this.mnemonicService.getProviderWallet();
    const encryptionKey = await this.encryptionService.unlockFromPassword(
      this.encryptionService.lastUsedPassword
    );
    const networkName = 'Polygon' as NetworkName;

    const amountAfterFee = (BigInt(tokenFromAmount) * 9975n) / 10_000n;

    const swapData = await this.apiService.fetchBestSwapData<
      EvmTransactionConfig & { approvalAddress: string }
    >({
      srcTokenAddress: tokenFromAddress,
      dstTokenAddress: tokenToAddress,
      srcTokenAmount: amountAfterFee.toString(),
      srcTokenBlockchain: BLOCKCHAIN_NAME.POLYGON,
      dstTokenBlockchain: BLOCKCHAIN_NAME.POLYGON,
      receiver: wallet.address,
      fromAddress: RelayAdaptContract.Polygon,
      enableChecks: false,
      integratorAddress: '0x51c276f1392E87D4De6203BdD80c83f5F62724d4'
    });

    const amountAfterFeeString = amountAfterFee.toString();
    const erc20data = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'approve',
      // @ts-ignore
      args: [swapData.transaction.approvalAddress, amountAfterFeeString]
    });
    // @ts-ignore
    const transactionApprove0x = {
      data: erc20data,
      to: tokenFromAddress,
      value: 0n
    };

    const swapTx = { ...swapData.transaction };

    if (swapTx.gas) {
      // @ts-ignore
      swapTx.gas = BigInt(swapTx.gas);
    }

    if (swapTx.gasPrice) {
      // @ts-ignore
      swapTx.gasPrice = BigInt(swapTx.gasPrice);
    }

    if (swapTx.maxFeePerGas) {
      // @ts-ignore
      swapTx.maxFeePerGas = BigInt(swapTx.maxFeePerGas);
    }

    if (swapTx.maxPriorityFeePerGas) {
      // @ts-ignore
      swapTx.maxPriorityFeePerGas = BigInt(swapTx.maxPriorityFeePerGas);
    }

    if (swapTx.value) {
      // @ts-ignore
      swapTx.value = BigInt(swapTx.value);
    }

    delete swapTx.approvalAddress;

    // @ts-ignore
    const crossContractCalls: ContractTransaction[] = [transactionApprove0x, swapTx];

    const relayAdaptUnshieldERC20Amounts: RailgunERC20Amount[] = [
      serializeERC20RelayAdaptUnshield(tokenFromAddress, BigInt(tokenFromAmount))
    ];

    const relayAdaptShieldERC20Recipients: RailgunERC20Recipient[] = [
      serializeERC20Transfer(tokenFromAddress, 1n, railgunWalletInfo.railgunAddress),
      serializeERC20Transfer(tokenToAddress, 1n, railgunWalletInfo.railgunAddress)
    ];

    const minGasLimit = 2_500_000n; // high estimate but should be enough.
    // const overallBatchMinGasPrice = 1n;
    const gasEstimate = await this.crossContractGasEstimate(
      encryptionKey,
      networkName,
      railgunWalletInfo.id,
      relayAdaptUnshieldERC20Amounts,
      [],
      relayAdaptShieldERC20Recipients,
      [],
      crossContractCalls,
      minGasLimit,
      true
    );
    console.log('Private CrossContract TX gasEstimate: ', gasEstimate);

    const transactionGasDetails = await getGasDetailsForTransaction(
      NetworkName.Polygon,
      gasEstimate,
      true,
      wallet
    );
    const overallBatchMinGasPrice = calculateGasPrice(transactionGasDetails);

    // generate proof
    await this.crossContractGenerateProof(
      encryptionKey,
      NetworkName.Polygon,
      railgunWalletInfo.id,
      relayAdaptUnshieldERC20Amounts,
      [],
      relayAdaptShieldERC20Recipients,
      [],
      crossContractCalls,
      overallBatchMinGasPrice,
      minGasLimit,
      true
    );

    // populate tx
    const { transaction } = await this.crossContractCallsPopulateTransaction(
      NetworkName.Polygon,
      railgunWalletInfo.id,
      relayAdaptUnshieldERC20Amounts,
      [],
      relayAdaptShieldERC20Recipients,
      [],
      crossContractCalls,
      transactionGasDetails,
      overallBatchMinGasPrice,
      true
    );
    console.log('CrossContractCall transaction: ', transaction);

    const sentTx = await wallet.sendTransaction(transaction);
    console.log(sentTx);
    await sentTx.wait();
  }

  private async crossContractGasEstimate(
    encryptionKey: string,
    network: NetworkName,
    railgunWalletID: string,
    erc20AmountUnshieldAmounts: RailgunERC20Amount[],
    erc721AmountUnshieldAmounts: RailgunNFTAmount[],
    erc20ShieldRecipients: RailgunERC20Recipient[],
    erc721AmountShieldRecipients: RailgunNFTAmountRecipient[],
    crossContractCalls: ContractTransaction[],
    minGasLimit: bigint, // provided by user, or cookbook output.
    sendWithPublicWallet: boolean = true,
    feeTokenDetails: RailgunERC20AmountRecipient | undefined = undefined
  ): Promise<bigint> {
    const { wallet } = this.mnemonicService.getProviderWallet();

    const originalGasDetails = await getOriginalGasDetailsForTransaction(
      wallet,
      network,
      sendWithPublicWallet
    );
    console.log('CrossContract: originalGasDetails: ', originalGasDetails);
    const { gasEstimate } = await gasEstimateForUnprovenCrossContractCalls(
      TXIDVersion.V2_PoseidonMerkle,
      network,
      railgunWalletID,
      encryptionKey,
      erc20AmountUnshieldAmounts,
      erc721AmountUnshieldAmounts,
      erc20ShieldRecipients,
      erc721AmountShieldRecipients,
      crossContractCalls,
      originalGasDetails,
      feeTokenDetails,
      sendWithPublicWallet,
      minGasLimit
    );
    return gasEstimate;
  }

  private async crossContractGenerateProof(
    encryptionKey: string,
    network: NetworkName,
    railgunWalletID: string,
    erc20AmountUnshieldAmounts: RailgunERC20Amount[],
    erc721AmountUnshieldAmounts: RailgunNFTAmount[],
    erc20AmountShieldRecipients: RailgunERC20Recipient[],
    erc721AmountShieldRecipients: RailgunNFTAmountRecipient[],
    crossContractCalls: ContractTransaction[],
    overallBatchMinGasPrice: bigint,
    minGasLimit: bigint,
    sendWithPublicWallet: boolean = true,
    broadcasterFeeERC20AmountRecipient: RailgunERC20AmountRecipient | undefined = undefined
  ): Promise<void> {
    const progressCallback = (progress: number) => {
      // Handle proof progress (show in UI).
      // Proofs can take 20-30 seconds on slower devices.
      console.log('CrossContract Call Proof progress: ', progress);
    };
    // GENERATES RAILGUN SPENDING PROOF
    await generateCrossContractCallsProof(
      TXIDVersion.V2_PoseidonMerkle,
      network,
      railgunWalletID,
      encryptionKey,
      erc20AmountUnshieldAmounts,
      erc721AmountUnshieldAmounts,
      erc20AmountShieldRecipients,
      erc721AmountShieldRecipients,
      crossContractCalls,
      broadcasterFeeERC20AmountRecipient,
      sendWithPublicWallet,
      overallBatchMinGasPrice,
      minGasLimit,
      progressCallback
    );
  }

  private async crossContractCallsPopulateTransaction(
    network: NetworkName,
    railgunWalletID: string,
    erc20AmountUnshieldAmounts: RailgunERC20Amount[],
    erc721AmountUnshieldAmounts: RailgunNFTAmount[],
    erc20AmountShieldRecipients: RailgunERC20Recipient[],
    erc721AmountShieldRecipients: RailgunNFTAmountRecipient[],
    crossContractCalls: ContractTransaction[],
    transactionGasDetails: TransactionGasDetails,
    overallBatchMinGasPrice: bigint,
    sendWithPublicWallet: boolean = true,
    broadcasterFeeERC20AmountRecipient: RailgunERC20AmountRecipient | undefined = undefined
  ): Promise<RailgunPopulateTransactionResponse> {
    const populateResponse = await populateProvedCrossContractCalls(
      TXIDVersion.V2_PoseidonMerkle,
      network,
      railgunWalletID,
      erc20AmountUnshieldAmounts,
      erc721AmountUnshieldAmounts,
      erc20AmountShieldRecipients,
      erc721AmountShieldRecipients,
      crossContractCalls,
      broadcasterFeeERC20AmountRecipient,
      sendWithPublicWallet,
      overallBatchMinGasPrice,
      transactionGasDetails
    );

    return populateResponse;
  }

  public async ensureErc20Allowances(
    network: NetworkName,
    wallet: Wallet | HDNodeWallet,
    erc20AmountRecipients: RailgunERC20AmountRecipient[]
  ): Promise<void> {
    const spender = NETWORK_CONFIG[network].relayAdaptContract;

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

  public async swapWithZeroX(
    railgunWalletInfo: RailgunWalletInfo,
    tokenFromAddress: string,
    tokenFromDecimals: number,
    tokenFromAmount: string,
    tokenToAddress: string,
    tokenToDecimals: number
  ): Promise<void> {
    const { wallet } = this.mnemonicService.getProviderWallet();
    const encryptionKey = await this.encryptionService.unlockFromPassword(
      this.encryptionService.lastUsedPassword
    );
    const networkName = 'Polygon' as NetworkName;

    // @ts-ignore
    setRailgunFees(networkName, 50n, 50n);

    // const amountAfterFee = (BigInt(tokenFromAmount) * 9975n) / 10_000n;

    const sellERC20Info: RecipeERC20Info = {
      tokenAddress: tokenFromAddress,
      decimals: BigInt(tokenFromDecimals)
    };

    const buyERC20Info: RecipeERC20Info = {
      tokenAddress: tokenToAddress,
      decimals: BigInt(tokenToDecimals)
    };

    const slippagePercentage = BigInt(500);

    const swap = new ZeroXSwapRecipe(sellERC20Info, buyERC20Info, slippagePercentage);

    // Inputs that will be unshielded from private balance.
    const unshieldERC20Amounts = [
      {
        ...sellERC20Info,
        amount: BigInt(tokenFromAmount) // hexadecimal amount
      }
    ];

    const recipeInput: RecipeInput = {
      // @ts-ignore
      networkName: NetworkName.Polygon,
      erc20Amounts: unshieldERC20Amounts,
      railgunAddress: railgunWalletInfo.railgunAddress,
      nfts: []
    };

    const { crossContractCalls, erc20AmountRecipients, minGasLimit } = await swap.getRecipeOutput(
      recipeInput
    );

    // Outputs to re-shield after the Recipe multicall.
    const shieldERC20 = erc20AmountRecipients.map(x => ({
      ...x,
      recipientAddress: railgunWalletInfo.railgunAddress
    }));

    const gasEstimate = await this.crossContractGasEstimate(
      encryptionKey,
      networkName,
      railgunWalletInfo.id,
      unshieldERC20Amounts,
      [],
      shieldERC20,
      [],
      crossContractCalls,
      minGasLimit,
      true
    );
    console.log('Private CrossContract TX gasEstimate: ', gasEstimate);

    const transactionGasDetails = await getGasDetailsForTransaction(
      NetworkName.Polygon,
      gasEstimate,
      true,
      wallet
    );
    const overallBatchMinGasPrice = calculateGasPrice(transactionGasDetails);

    // generate proof
    await this.crossContractGenerateProof(
      encryptionKey,
      NetworkName.Polygon,
      railgunWalletInfo.id,
      unshieldERC20Amounts,
      [],
      shieldERC20,
      [],
      crossContractCalls,
      overallBatchMinGasPrice,
      minGasLimit,
      true
    );

    // populate tx
    const { transaction } = await this.crossContractCallsPopulateTransaction(
      NetworkName.Polygon,
      railgunWalletInfo.id,
      unshieldERC20Amounts,
      [],
      shieldERC20,
      [],
      crossContractCalls,
      transactionGasDetails,
      overallBatchMinGasPrice,
      true
    );
    console.log('CrossContractCall transaction: ', transaction);

    const sentTx = await wallet.sendTransaction(transaction);
    console.log(sentTx);
    await sentTx.wait();
  }
}
