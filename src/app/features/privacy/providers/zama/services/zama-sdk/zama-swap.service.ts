import { Injectable } from '@angular/core';
import { ZamaInstanceService } from './zama-instance.service';
import {
  EvmAdapter,
  EvmTransactionConfig,
  GasPrice,
  viemBlockchainMapping
} from '@cryptorubic/web3';
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
import { decodeEventLog, erc20Abi, TransactionReceipt } from 'viem';
import { ZamaTokensService } from './zama-tokens.service';
import { wrapAbi } from '@app/core/services/sdk/sdk-legacy/features/on-chain/calculation-manager/common/evm-wrap-trade/wrap-abi';
import BigNumber from 'bignumber.js';
import { GasService } from '@app/core/services/gas-service/gas.service';

@Injectable()
export class ZamaSwapService {
  constructor(
    private readonly zamaInstanceService: ZamaInstanceService,
    private readonly adapterFactory: BlockchainAdapterFactoryService,
    private readonly zamaTokensService: ZamaTokensService,
    private readonly errorService: ErrorsService,
    private readonly gasService: GasService
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

  private async getGasPriceOptions(blockchain: EvmBlockchainName): Promise<GasPrice | null> {
    try {
      const { shouldCalculateGasPrice, gasPriceOptions } = await this.gasService.getGasInfo(
        blockchain
      );

      return shouldCalculateGasPrice ? gasPriceOptions : null;
    } catch {
      return null;
    }
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

  public async getPureTokenAmount(
    token: TokenAmount<EvmBlockchainName>
  ): Promise<TokenAmount<EvmBlockchainName>> {
    const shieldedTokenAddress = this.getErc7984Token(token.blockchain, token.address);

    const erc7984TokenRate = await this.getShieldedTokenRate(
      shieldedTokenAddress,
      token.blockchain
    );

    const pureWeiAmount = token.weiAmount
      .dividedBy(erc7984TokenRate)
      .integerValue(BigNumber.ROUND_DOWN)
      .multipliedBy(erc7984TokenRate);

    return new TokenAmount({
      ...token,
      weiAmount: pureWeiAmount
    });
  }

  public async needApprove(pureTokenAmount: TokenAmount<EvmBlockchainName>): Promise<boolean> {
    if (pureTokenAmount.isNative) return false;

    const adapter = this.getEvmAdapter(pureTokenAmount.blockchain);
    const shieldedTokenAddress = this.getErc7984Token(
      pureTokenAmount.blockchain,
      pureTokenAmount.address
    );

    const userAddress = adapter.signer.walletAddress;

    const needApprove = await adapter.needApprove(
      pureTokenAmount,
      shieldedTokenAddress,
      userAddress,
      pureTokenAmount.stringWeiAmount
    );

    return needApprove;
  }

  public async approve(pureTokenAmount: TokenAmount<EvmBlockchainName>): Promise<void> {
    try {
      if (pureTokenAmount.isNative) return;

      const adapter = this.getEvmAdapter(pureTokenAmount.blockchain);
      const shieldedTokenAddress = this.getErc7984Token(
        pureTokenAmount.blockchain,
        pureTokenAmount.address
      );

      const needApprove = await this.needApprove(pureTokenAmount);

      if (!needApprove) return;

      await adapter.approveTokens(
        pureTokenAmount.address,
        shieldedTokenAddress,
        pureTokenAmount.weiAmount
      );
    } catch (err) {
      throw err;
    }
  }

  public async wrap(pureTokenAmount: TokenAmount<EvmBlockchainName>): Promise<boolean> {
    try {
      const adapter = this.getEvmAdapter(pureTokenAmount.blockchain);

      const receiverAddress = adapter.signer.walletAddress;
      const shieldedTokenAddress = this.getErc7984Token(
        pureTokenAmount.blockchain,
        pureTokenAmount.address
      );

      let callData: EvmTransactionConfig;

      const shieldTx = EvmAdapter.encodeMethodCall(
        shieldedTokenAddress,
        ERC7984_TOKEN_ABI,
        'wrap',
        [receiverAddress, pureTokenAmount.stringWeiAmount]
      );

      if (pureTokenAmount.isNative) {
        const wrapEthTx = EvmAdapter.encodeMethodCall(
          wrappedNativeTokensList[pureTokenAmount.blockchain].address,
          wrapAbi,
          'deposit',
          [],
          pureTokenAmount.stringWeiAmount
        );

        const approveTx = EvmAdapter.encodeMethodCall(wrapEthTx.to, erc20Abi, 'approve', [
          shieldedTokenAddress,
          pureTokenAmount.stringWeiAmount
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

      const gasPriceOptions = await this.getGasPriceOptions(pureTokenAmount.blockchain);

      await adapter.signer.trySendTransaction({
        txOptions: {
          ...callData,
          gasPriceOptions
        }
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

      const callData = EvmAdapter.encodeMethodCall(
        shieldedTokenAddress,
        ERC7984_TOKEN_ABI,
        'confidentialTransfer',
        [receiver, encryptedAmount, inputProof]
      );

      const gasPriceOptions = await this.getGasPriceOptions(transferToken.blockchain);

      await adapter.signer.trySendTransaction({
        txOptions: {
          ...callData,
          gasPriceOptions
        }
      });
      return true;
    } catch (err) {
      this.errorService.catch(err);
      return false;
    }
  }

  public async unwrap(
    unwrapToken: TokenAmount<EvmBlockchainName>,
    receiver?: string,
    onTransactionSuccess?: (receipt: TransactionReceipt) => void
  ): Promise<void> {
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

      const unshieldTx = EvmAdapter.encodeMethodCall(
        shieldedTokenAddress,
        ERC7984_TOKEN_ABI,
        'unwrap',
        [userAddress, receiverAddress, encryptedAmount, inputProof]
      );

      const gasPriceOptions = await this.getGasPriceOptions(unwrapToken.blockchain);

      const receipt = await adapter.signer.trySendTransaction({
        txOptions: {
          ...unshieldTx,
          gasPriceOptions
        }
      });

      onTransactionSuccess?.(receipt);
    } catch (err) {
      throw err;
    }
  }

  public async finalizeUnwrap(
    unwrapToken: TokenAmount<EvmBlockchainName>,
    receipt: TransactionReceipt
  ): Promise<boolean> {
    try {
      const zamaInstance = this.getZamaInstance(unwrapToken.blockchain);
      const shieldedTokenAddress = this.getErc7984Token(
        unwrapToken.blockchain,
        unwrapToken.address
      );
      const adapter = this.getEvmAdapter(unwrapToken.blockchain);

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
