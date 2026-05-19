import { inject, Injectable } from '@angular/core';
import {
  NETWORK_CONFIG,
  NetworkName,
  RailgunERC20Amount,
  RailgunERC20AmountRecipient,
  RailgunERC20Recipient,
  RailgunNFTAmount,
  RailgunNFTAmountRecipient,
  RailgunPopulateTransactionResponse,
  RailgunWalletInfo,
  TransactionGasDetails,
  TXIDVersion
} from '@railgun-community/shared-models';
import { getOriginalGasDetailsForTransaction } from '@features/privacy/providers/railgun/utils/tx-utils';
import { Contract, ContractTransaction, HDNodeWallet, Wallet } from 'ethers';
import { PublicClient } from 'viem';
import { RubicApiService } from '@core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';
import { BlockchainName, Token } from '@cryptorubic/core';
import {
  gasEstimateForUnprovenCrossContractCalls,
  generateCrossContractCallsProof,
  populateProvedCrossContractCalls
} from '@railgun-community/wallet';
import { OutsideZone } from '@shared/decorators/outside-zone';
import { fromPrivateToRubicChainMap } from '@features/privacy/providers/railgun/constants/network-map';
import { RailgunFacadeService } from '@features/privacy/providers/railgun/services/railgun-facade.service';
import { AuthService } from '@core/services/auth/auth.service';
import { BlockchainAdapterFactoryService } from '@core/services/sdk/sdk-legacy/blockchain-adapter-factory/blockchain-adapter-factory.service';
import { PrivacySupportedNetworks } from '@features/privacy/providers/railgun/models/supported-networks';

@Injectable()
export class PrivateSwapService {
  private readonly apiService = inject(RubicApiService);

  private readonly railgunFacade = inject(RailgunFacadeService);

  private readonly authService = inject(AuthService);

  private readonly adaptersFactory = inject(BlockchainAdapterFactoryService);

  // private readonly worker = new Worker(new URL('./workersrailgun-worker', import.meta.url), {
  //   type: 'module'
  // });

  public async getRates(
    tokenFromAddress: string,
    tokenFromAmount: string,
    tokenToAddress: string,
    fromTokenDecimals: number,
    fromBlockchain: BlockchainName,
    toBlockchain: BlockchainName,
    receiverAddress?: string
  ): Promise<string> {
    const amountAfterFee = (BigInt(tokenFromAmount) * 9975n) / 10_000n;
    // const { wallet } = this.mnemonicService.getProviderWallet();
    const walletAddress = this.authService.userAddress;

    const swapData = await this.apiService.quoteBestSwapData({
      srcTokenAddress: tokenFromAddress,
      dstTokenAddress: tokenToAddress,
      srcTokenAmount: Token.fromWei(amountAfterFee.toString(), fromTokenDecimals).toFixed(),
      srcTokenBlockchain: fromBlockchain,
      dstTokenBlockchain: toBlockchain,
      receiver: receiverAddress || walletAddress,
      fromAddress: walletAddress,
      enableChecks: false
    });

    return swapData.estimate.destinationTokenAmount;
  }

  public async crossContractCall(
    _railgunWalletInfo: RailgunWalletInfo,
    _tokenFromAddress: string,
    _tokenFromAmount: string,
    _tokenToAddress: string,
    _fromTokenDecimals: number,
    _fromBlockchain: BlockchainName,
    _toBlockchain: BlockchainName,
    _receiverAddress?: string
  ): Promise<void> {
    // const password = 'password';
    // const encryptionKey = await this.railgunFacade.unlockFromPassword(password);
    // const amountAfterFee = (BigInt(tokenFromAmount) * 9975n) / 10_000n;
    // const walletAddress = this.authService.userAddress;
    //
    // const swapData = await this.apiService.fetchBestSwapData<
    //   EvmTransactionConfig & { approvalAddress: string }
    // >({
    //   srcTokenAddress: tokenFromAddress,
    //   dstTokenAddress: tokenToAddress,
    //   srcTokenAmount: Token.fromWei(amountAfterFee.toString(), fromTokenDecimals).toFixed(),
    //   srcTokenBlockchain: fromBlockchain,
    //   dstTokenBlockchain: toBlockchain,
    //   receiver: receiverAddress || RelayAdaptContract.Polygon,
    //   fromAddress: walletAddress,
    //   enableChecks: false,
    //   integratorAddress: '0x51c276f1392E87D4De6203BdD80c83f5F62724d4',
    //   slippage: 0.05
    // });
    //
    // const amountAfterFeeString = amountAfterFee.toString();
    // const erc20data = encodeFunctionData({
    //   abi: erc20Abi,
    //   functionName: 'approve',
    //   // @ts-ignore
    //   args: [swapData.transaction.approvalAddress, amountAfterFeeString]
    // });
    // // @ts-ignore
    // const transactionApprove0x = {
    //   data: erc20data,
    //   to: tokenFromAddress,
    //   value: 0n
    // };
    //
    // const swapTx = { ...swapData.transaction };
    //
    // if (swapTx.gas) {
    //   // @ts-ignore
    //   swapTx.gas = BigInt(swapTx.gas);
    // }
    //
    // if (swapTx.gasPrice) {
    //   // @ts-ignore
    //   swapTx.gasPrice = BigInt(swapTx.gasPrice);
    // }
    //
    // if (swapTx.maxFeePerGas) {
    //   // @ts-ignore
    //   swapTx.maxFeePerGas = BigInt(swapTx.maxFeePerGas);
    // }
    //
    // if (swapTx.maxPriorityFeePerGas) {
    //   // @ts-ignore
    //   swapTx.maxPriorityFeePerGas = BigInt(swapTx.maxPriorityFeePerGas);
    // }
    //
    // if (swapTx.value) {
    //   // @ts-ignore
    //   swapTx.value = BigInt(swapTx.value);
    // }
    //
    // delete swapTx.approvalAddress;
    //
    // // @ts-ignore
    // const crossContractCalls: ContractTransaction[] = [transactionApprove0x, swapTx];
    //
    // const relayAdaptUnshieldERC20Amounts: RailgunERC20Amount[] = [
    //   serializeERC20RelayAdaptUnshield(tokenFromAddress, BigInt(tokenFromAmount))
    // ];
    //
    // const relayAdaptShieldERC20Recipients: RailgunERC20Recipient[] = [
    //   serializeERC20Transfer(tokenToAddress, 1n, railgunWalletInfo.railgunAddress)
    // ];
    //
    // const networkName = fromRubicToPrivateChainMap[fromBlockchain];
    // const minGasLimit = 5_000_000n; // high estimate but should be enough.
    // // const overallBatchMinGasPrice = 1n;
    // const gasEstimate = await this.crossContractGasEstimate(
    //   encryptionKey,
    //   networkName,
    //   railgunWalletInfo.id,
    //   relayAdaptUnshieldERC20Amounts,
    //   [],
    //   [],
    //   [],
    //   crossContractCalls,
    //   minGasLimit,
    //   true
    // );
    //
    // const adapter = this.adaptersFactory.getAdapter(fromBlockchain as EvmBlockchainName);
    //
    // const transactionGasDetails = await getGasDetailsForTransaction(
    //   NetworkName.Polygon,
    //   gasEstimate,
    //   true,
    //   walletAddress,
    //   // @ts-ignore
    //   adapter.public as PublicClient
    // );
    // const overallBatchMinGasPrice = calculateGasPrice(transactionGasDetails);
    //
    // // generate proof
    // await this.crossContractGenerateProof(
    //   encryptionKey,
    //   NetworkName.Polygon,
    //   railgunWalletInfo.id,
    //   relayAdaptUnshieldERC20Amounts,
    //   [],
    //   relayAdaptShieldERC20Recipients,
    //   [],
    //   crossContractCalls,
    //   overallBatchMinGasPrice,
    //   minGasLimit,
    //   true
    // );
    //
    // // populate tx
    // const { transaction } = await this.crossContractCallsPopulateTransaction(
    //   NetworkName.Polygon,
    //   railgunWalletInfo.id,
    //   relayAdaptUnshieldERC20Amounts,
    //   [],
    //   relayAdaptShieldERC20Recipients,
    //   [],
    //   crossContractCalls,
    //   transactionGasDetails,
    //   overallBatchMinGasPrice,
    //   true
    // );
    //
    // const sentTx = await adapter.signer.sendTransaction({
    //   txOptions: {
    //     to: transaction.to,
    //     data: transaction.data,
    //     value: transaction.value
    //     // gasLimit: transaction.gasLimit.toString(),
    //     // maxFeePerGas: transaction.maxFeePerGas,
    //     // maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
    //     // gasPrice: transaction.gasPrice
    //   }
    // });
    //
    // console.log(sentTx);
  }

  private async crossContractGasEstimate(
    encryptionKey: string,
    network: PrivacySupportedNetworks,
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
    // const { wallet } = this.mnemonicService.getProviderWallet();
    // const walletAddress = this.authService.userAddress;

    const blockchain = fromPrivateToRubicChainMap[network];
    const adapter = this.adaptersFactory.getAdapter(blockchain);
    // @ts-ignore
    const client = adapter.public as PublicClient;

    // @ts-ignore
    const originalGasDetails = await getOriginalGasDetailsForTransaction(network, client);
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

  @OutsideZone
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
}
