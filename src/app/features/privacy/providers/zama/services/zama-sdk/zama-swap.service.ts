import { Injectable } from '@angular/core';
import { ZamaInstanceService } from './zama-instance.service';
import { EvmAdapter, EvmTransactionConfig, viemBlockchainMapping } from '@cryptorubic/web3';
import { BlockchainAdapterFactoryService } from '@app/core/services/sdk/sdk-legacy/blockchain-adapter-factory/blockchain-adapter-factory.service';
import {
  compareAddresses,
  EvmBlockchainName,
  TokenAmount,
  wrappedNativeTokensList
} from '@cryptorubic/core';
import { ErrorsService } from '@app/core/errors/errors.service';
import { ERC7984_TOKEN_ABI, MULTICALL_ABI } from './abis/erc7984-token-abi';
import { getAddress } from 'ethers';
import { FhevmInstance } from '@zama-fhe/relayer-sdk/bundle';
import { decodeEventLog, erc20Abi } from 'viem';
import { ZamaTokensService } from './zama-tokens.service';
import { wrapAbi } from '@app/core/services/sdk/sdk-legacy/features/on-chain/calculation-manager/common/evm-wrap-trade/wrap-abi';
import BigNumber from 'bignumber.js';

@Injectable()
export class ZamaSwapService {
  constructor(
    private readonly zamaInstanceService: ZamaInstanceService,
    private readonly adapterFactory: BlockchainAdapterFactoryService,
    private readonly zamaTokensService: ZamaTokensService,
    private readonly errorService: ErrorsService
  ) {}

  private getEvmAdapter(blockchain: EvmBlockchainName): EvmAdapter {
    return this.adapterFactory.getAdapter(blockchain);
  }

  private getZamaInstance(blockchain: EvmBlockchainName): FhevmInstance {
    return this.zamaInstanceService.getInstance(blockchain);
  }

  private getErc7984Token(blockchain: EvmBlockchainName, erc20TokenAddress: string): string {
    return this.zamaTokensService.supportedTokensMapping[blockchain].find(token =>
      compareAddresses(token.tokenAddress, erc20TokenAddress)
    ).shieldedTokenAddress;
  }

  private async getShieldedTokenRate(
    shieldedTokenAddress: string,
    blockchain: EvmBlockchainName
  ): Promise<BigNumber> {
    try {
      const adapter = this.getEvmAdapter(blockchain);
      const rate = await adapter.callContractMethod(
        shieldedTokenAddress,
        ERC7984_TOKEN_ABI,
        'rate'
      );

      return new BigNumber(rate);
    } catch {
      return new BigNumber('1000000000000');
    }
  }

  private async approveBeforeWrap(wrapToken: TokenAmount<EvmBlockchainName>): Promise<boolean> {
    try {
      const adapter = this.getEvmAdapter(wrapToken.blockchain);
      const shieldedTokenAddress = this.getErc7984Token(wrapToken.blockchain, wrapToken.address);

      const userAddress = adapter.signer.walletAddress;

      const needApprove = await adapter.needApprove(
        wrapToken,
        shieldedTokenAddress,
        userAddress,
        wrapToken.stringWeiAmount
      );

      if (!needApprove) return true;

      const resp = await adapter.approveTokens(
        wrapToken.address,
        shieldedTokenAddress,
        wrapToken.weiAmount
      );

      return !!resp;
    } catch (err) {
      this.errorService.catch(err);
      return false;
    }
  }

  public async wrap(wrapToken: TokenAmount<EvmBlockchainName>): Promise<boolean> {
    try {
      const adapter = this.getEvmAdapter(wrapToken.blockchain);

      const receiverAddress = adapter.signer.walletAddress;
      const shieldedTokenAddress = this.getErc7984Token(wrapToken.blockchain, wrapToken.address);

      const erc7984TokenRate = await this.getShieldedTokenRate(
        shieldedTokenAddress,
        wrapToken.blockchain
      );

      const pureAmount = wrapToken.weiAmount
        .dividedBy(erc7984TokenRate)
        .integerValue(BigNumber.ROUND_DOWN)
        .multipliedBy(erc7984TokenRate)
        .toFixed(0);

      let callData: EvmTransactionConfig;

      // if(!wrapToken.isNative){
      //   this.approveBeforeWrap
      // }

      const shieldTx = EvmAdapter.encodeMethodCall(
        shieldedTokenAddress,
        ERC7984_TOKEN_ABI,
        'wrap',
        [receiverAddress, pureAmount]
      );

      if (wrapToken.isNative) {
        const wrapEthTx = EvmAdapter.encodeMethodCall(
          wrappedNativeTokensList[wrapToken.blockchain].address,
          wrapAbi,
          'deposit',
          [],
          pureAmount
        );

        const approveTx = EvmAdapter.encodeMethodCall(wrapEthTx.to, erc20Abi, 'approve', [
          shieldedTokenAddress,
          pureAmount
        ]);

        //@ts-ignore
        const multicall = viemBlockchainMapping[wrapToken.blockchain].contracts.multicall3.address;

        const calls = [
          {
            target: wrapEthTx.to,
            allowFailure: false,
            callData: wrapEthTx.data,
            value: wrapEthTx.value
          },
          {
            target: approveTx.to,
            allowFailure: false,
            callData: approveTx.data,
            value: '0'
          },
          {
            target: shieldTx.to,
            allowFailure: false,
            callData: shieldTx.data,
            value: '0'
          }
        ];

        callData = EvmAdapter.encodeMethodCall(
          multicall,
          MULTICALL_ABI,
          'aggregate3Value',
          [calls],
          wrapEthTx.value
        );
      } else {
        callData = shieldTx;
      }

      await adapter.signer.trySendTransaction({
        txOptions: callData
      });
      return true;
    } catch (err) {
      this.errorService.catch(err);
      return false;
    }
  }

  public async confidentialTransfer(
    transferToken: TokenAmount<EvmBlockchainName>,
    receiver: string
  ): Promise<boolean> {
    try {
      const adapter = this.getEvmAdapter(transferToken.blockchain);
      const shieldedTokenAddress = this.getErc7984Token(
        transferToken.blockchain,
        transferToken.address
      );

      const userAddress = getAddress(adapter.signer.walletAddress);
      const zamaInstance = this.getZamaInstance(transferToken.blockchain);

      const buffer = zamaInstance.createEncryptedInput(shieldedTokenAddress, userAddress);

      buffer.add64(BigInt(transferToken.stringWeiAmount));

      const ciphertexts = await buffer.encrypt();

      const encryptedAmount = '0x' + Buffer.from(ciphertexts.handles[0]).toString('hex');
      const inputProof = '0x' + Buffer.from(ciphertexts.inputProof).toString('hex');

      const tx = EvmAdapter.encodeMethodCall(
        shieldedTokenAddress,
        ERC7984_TOKEN_ABI,
        'confidentialTransfer',
        [receiver, encryptedAmount, inputProof]
      );

      await adapter.signer.trySendTransaction({
        txOptions: tx
      });
      return true;
    } catch (err) {
      this.errorService.catch(err);
      return false;
    }
  }

  public async unwrap(
    unwrapToken: TokenAmount<EvmBlockchainName>,
    receiver?: string
  ): Promise<boolean> {
    try {
      const adapter = this.getEvmAdapter(unwrapToken.blockchain);

      const userAddress = getAddress(adapter.signer.walletAddress);
      const receiverAddress = receiver ? getAddress(receiver) : userAddress;

      const zamaInstance = this.getZamaInstance(unwrapToken.blockchain);

      const shieldedTokenAddress = this.getErc7984Token(
        unwrapToken.blockchain,
        unwrapToken.address
      );

      const buffer = zamaInstance.createEncryptedInput(shieldedTokenAddress, userAddress);
      buffer.add64(BigInt(unwrapToken.stringWeiAmount));

      const ciphertexts = await buffer.encrypt();

      const encryptedAmount = '0x' + Buffer.from(ciphertexts.handles[0]).toString('hex');
      const inputProof = '0x' + Buffer.from(ciphertexts.inputProof).toString('hex');

      const tx = EvmAdapter.encodeMethodCall(shieldedTokenAddress, ERC7984_TOKEN_ABI, 'unwrap', [
        userAddress,
        receiverAddress,
        encryptedAmount,
        inputProof
      ]);

      const receipt = await adapter.signer.trySendTransaction({
        txOptions: tx
      });

      const log = receipt.logs.find(l => {
        try {
          const decoded = decodeEventLog({
            abi: ERC7984_TOKEN_ABI,
            data: l.data,
            //@ts-ignore
            topics: l.topics
          });

          return decoded.eventName === 'UnwrapRequested';
        } catch {
          return false;
        }
      });

      const burntAmount = decodeEventLog({
        abi: ERC7984_TOKEN_ABI,
        data: log.data,
        //@ts-ignore
        topics: log.topics
      }).args as unknown as { amount: `0x${string}` };

      const decryptedBurnAmount = await zamaInstance.publicDecrypt([burntAmount.amount]);

      const finilizeWrapTx = EvmAdapter.encodeMethodCall(
        shieldedTokenAddress,
        ERC7984_TOKEN_ABI,
        'finalizeUnwrap',
        [
          burntAmount.amount,
          decryptedBurnAmount.clearValues[burntAmount.amount],
          decryptedBurnAmount.decryptionProof
        ]
      );

      await adapter.signer.trySendTransaction({ txOptions: finilizeWrapTx });
      return true;
    } catch (err) {
      this.errorService.catch(err);
      return false;
    }
  }
}
