import { Injectable } from '@angular/core';
import { ZamaInstanceService } from './zama-instance.service';
import { EvmAdapter } from '@cryptorubic/web3';
import { BlockchainAdapterFactoryService } from '@app/core/services/sdk/sdk-legacy/blockchain-adapter-factory/blockchain-adapter-factory.service';
import { compareAddresses, EvmBlockchainName, TokenAmount } from '@cryptorubic/core';
import { ErrorsService } from '@app/core/errors/errors.service';
import { ERC7984_TOKEN_ABI } from './abis/erc7984-token-abi';
import { getAddress } from 'ethers';
import { FhevmInstance } from '@zama-fhe/relayer-sdk/bundle';
import { decodeEventLog } from 'viem';
import { ZamaTokensService } from './zama-tokens.service';

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

      const resp = await adapter.approveTokens(wrapToken.address, shieldedTokenAddress);

      return !!resp;
    } catch (err) {
      this.errorService.catch(err);
      return false;
    }
  }

  public async wrap(
    wrapToken: TokenAmount<EvmBlockchainName>,
    receiver?: string
  ): Promise<boolean> {
    try {
      const isApproved = await this.approveBeforeWrap(wrapToken);
      const adapter = this.getEvmAdapter(wrapToken.blockchain);

      const receiverAddress = receiver || adapter.signer.walletAddress;
      const shieldedTokenAddress = this.getErc7984Token(wrapToken.blockchain, wrapToken.address);
      if (!isApproved) return;

      const tx = EvmAdapter.encodeMethodCall(shieldedTokenAddress, ERC7984_TOKEN_ABI, 'wrap', [
        receiverAddress,
        wrapToken.stringWeiAmount
      ]);

      await adapter.signer.sendTransaction({
        txOptions: tx
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
