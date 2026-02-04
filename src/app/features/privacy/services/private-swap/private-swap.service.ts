import { inject, Injectable } from '@angular/core';
import {
  RailgunERC20Amount,
  RailgunERC20Recipient,
  RailgunWalletInfo
} from '@railgun-community/shared-models';
import { MnemonicService } from '@features/privacy/services/mnemonic/mnemonic.service';
import { serializeERC20RelayAdaptUnshield } from '@features/privacy/utils/tx-utils';
import { Contract, ContractTransaction } from 'ethers';
import { erc20Abi } from 'viem';
import { RubicApiService } from '@core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';
import { BLOCKCHAIN_NAME } from '@cryptorubic/core';
import { EvmTransactionConfig } from '@cryptorubic/web3';

@Injectable({
  providedIn: 'root'
})
export class PrivateSwapService {
  private readonly mnemonicService = inject(MnemonicService);

  private readonly apiService = inject(RubicApiService);

  public async crossContractCall(
    _encryptionKey: string,
    railgunWalletInfo: RailgunWalletInfo,
    tokenFromAddress: string,
    tokenFromAmount: string,
    tokenToAddress: string
  ): Promise<void> {
    const { wallet, provider } = this.mnemonicService.getProviderWallet();

    const _erc20AmountUnshieldAmounts: RailgunERC20Amount[] = [
      serializeERC20RelayAdaptUnshield(
        tokenFromAddress, // WETH
        BigInt(tokenFromAmount)
      )
    ];

    const amountAfterFee = (BigInt(tokenFromAmount) * 9975n) / 10_000n;

    const swapData = await this.apiService.fetchBestSwapData<EvmTransactionConfig>({
      srcTokenAddress: tokenFromAddress,
      dstTokenAddress: tokenToAddress,
      srcTokenAmount: amountAfterFee.toString(),
      srcTokenBlockchain: BLOCKCHAIN_NAME.POLYGON,
      dstTokenBlockchain: BLOCKCHAIN_NAME.POLYGON,
      receiver: wallet.address
    });

    const erc20 = new Contract(tokenFromAddress, erc20Abi, provider);
    // @ts-ignore
    const transactionApprove0x = await erc20.populateTransaction.approve(
      swapData.transaction.to,
      amountAfterFee
    );

    const _crossContractCalls: ContractTransaction[] = [transactionApprove0x, swapData.transaction];

    const _relayAdaptUnshieldERC20Amounts = [
      {
        address: tokenFromAddress,
        amount: BigInt(tokenFromAmount)
      }
    ];

    const _relayAdaptShieldERC20Recipients: RailgunERC20Recipient[] = [
      {
        tokenAddress: tokenFromAddress,
        recipientAddress: railgunWalletInfo.railgunAddress
      },
      {
        tokenAddress: tokenToAddress,
        recipientAddress: railgunWalletInfo.railgunAddress
      }
    ];
    //
    // const erc20AmountShieldRecipients: RailgunERC20Recipient[] = [
    //   serializeERC20Transfer(
    //     tokenToAddress, // WETH
    //     BigInt(tokenToAmount),
    //     railgunWalletInfo.railgunAddress
    //   )
    // ];
    //
    // const crossContractCalls: ContractTransaction[] = [
    //   {
    //     to: unwrap.to,
    //     data: unwrap.data, // unwrapeth
    //     value: 0n
    //   }
    // ];
    //
    // const minGasLimit = 2_500_000n; // high estimate but should be enough.
    // // const overallBatchMinGasPrice = 1n;
    // const gasEstimate = await crossContractGasEstimate(
    //   encryptionKey,
    //   TEST_NETWORK,
    //   railgunWalletInfo.id,
    //   erc20AmountUnshieldAmounts,
    //   [],
    //   erc20AmountShieldRecipients,
    //   [],
    //   crossContractCalls,
    //   minGasLimit,
    //   true
    // );
    //
    // console.log('Private CrossContract TX gasEstimate: ', gasEstimate);
    //
    // const transactionGasDetails = await getGasDetailsForTransaction(
    //   TEST_NETWORK,
    //   gasEstimate,
    //   true,
    //   wallet
    // );
    // const overallBatchMinGasPrice = calculateGasPrice(transactionGasDetails);
    //
    // // generate proof
    // await crossContractGenerateProof(
    //   encryptionKey,
    //   TEST_NETWORK,
    //   railgunWalletInfo.id,
    //   erc20AmountUnshieldAmounts,
    //   [],
    //   erc20AmountShieldRecipients,
    //   [],
    //   crossContractCalls,
    //   overallBatchMinGasPrice,
    //   minGasLimit,
    //   true
    // );
    //
    // // populate tx
    // const transaction = await crossContractCallsPopulateTransaction(
    //   TEST_NETWORK,
    //   railgunWalletInfo.id,
    //   erc20AmountUnshieldAmounts,
    //   [],
    //   erc20AmountShieldRecipients,
    //   [],
    //   crossContractCalls,
    //   transactionGasDetails,
    //   overallBatchMinGasPrice,
    //   true
    // );
    // console.log('CrossContractCall transaction: ', transaction);
    // // send private ERC20 tx.
    // // submission via self-signed or public-broadcaster not shown.
  }
}
