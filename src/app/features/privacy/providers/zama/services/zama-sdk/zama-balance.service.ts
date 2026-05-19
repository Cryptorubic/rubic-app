import { Injectable } from '@angular/core';
import { BlockchainAdapterFactoryService } from '@app/core/services/sdk/sdk-legacy/blockchain-adapter-factory/blockchain-adapter-factory.service';
import { compareAddresses, EvmBlockchainName } from '@cryptorubic/core';
import { EvmAdapter } from '@cryptorubic/web3';
import { BehaviorSubject } from 'rxjs';
import BigNumber from 'bignumber.js';
import { ERC7984_TOKEN_ABI } from './abis/erc7984-token-abi';
import { RubicAny } from '@app/shared/models/utility-types/rubic-any';
import { isNil } from '@app/shared/utils/utils';
import { getAddress } from 'ethers';
import { ZamaInstanceService } from './zama-instance.service';
import { ZAMA_SUPPORTED_CHAINS } from '../../constants/chains';
import { ClearValueType, FhevmInstance } from '@zama-fhe/relayer-sdk/bundle';
import { ZamaTokensService } from './zama-tokens.service';
import { ZamaSignatureService } from './zama-signature.service';
import { ZamaSupportedToken } from './models/zama-supported-tokens';

const ZERO_ENCRYPTED_BALANCE = '0x0000000000000000000000000000000000000000000000000000000000000000';

@Injectable()
export class ZamaBalanceService {
  constructor(
    private readonly adapterFactory: BlockchainAdapterFactoryService,
    private readonly zamaInstanceService: ZamaInstanceService,
    private readonly zamaTokensService: ZamaTokensService,
    private readonly zamaSignatureService: ZamaSignatureService
  ) {}

  private getZamaInstance(blockchain: EvmBlockchainName): FhevmInstance {
    return this.zamaInstanceService.getInstance(blockchain);
  }

  private getAdapter(blockchain: EvmBlockchainName): EvmAdapter {
    return this.adapterFactory.getAdapter(blockchain);
  }

  private readonly _balances$ = new BehaviorSubject<
    Partial<Record<EvmBlockchainName, { tokenAddress: string; amount: BigNumber }[]>>
  >({});

  public readonly balances$ = this._balances$.asObservable();

  private readonly _pendingUnshieldBalances$ = new BehaviorSubject<
    Partial<
      Record<
        EvmBlockchainName,
        { tokenAddress: string; encryptedAmount: string; decryptedWeiAmount: BigNumber }[]
      >
    >
  >({});

  public readonly pendingUnshieldBalances$ = this._pendingUnshieldBalances$.asObservable();

  public clearBalances(): void {
    this._balances$.next({});
  }

  public async refreshBalances(): Promise<void> {
    try {
      const promises = ZAMA_SUPPORTED_CHAINS.map(chain =>
        this.fetchPrivateBalances(
          this.zamaTokensService.supportedTokensMapping[chain].map(token => token.tokenAddress),
          chain
        )
      );

      const balances = await Promise.all(promises);

      this._balances$.next(
        Object.fromEntries(
          ZAMA_SUPPORTED_CHAINS.map((chain, i) => {
            return [chain, balances[i]];
          })
        )
      );
    } catch (err) {
      console.error('FAILED TO REFRESH PRIVATE BALANCES', err);
    }
  }

  private async fetchPrivateBalances(
    tokens: string[],
    blockchain: EvmBlockchainName
  ): Promise<{ tokenAddress: string; amount: BigNumber }[]> {
    try {
      const tokenMapping = this.zamaTokensService.supportedTokensMapping[blockchain];
      const adapter = this.getAdapter(blockchain);

      const erc7984Addresses = tokenMapping.map(token => token.shieldedTokenAddress);

      const userAddress = adapter.signer.walletAddress;

      const encryptedBalances = await adapter.multicallByContract<string>({
        contracts: erc7984Addresses.map(erc7984Address => {
          return {
            abi: ERC7984_TOKEN_ABI,
            address: erc7984Address,
            args: [userAddress],
            functionName: 'confidentialBalanceOf'
          };
        })
      } as RubicAny);

      const handlePairs = encryptedBalances
        .map((encryptedBalance, i) => {
          if (
            encryptedBalance.error ||
            compareAddresses(encryptedBalance.result, ZERO_ENCRYPTED_BALANCE)
          )
            return null;

          return {
            handle: encryptedBalance.result,
            contractAddress: erc7984Addresses[i]
          };
        })
        .filter(v => !isNil(v));

      if (!handlePairs.length) return [];

      const decryptedBalances = await this.decryptBalances(handlePairs, userAddress, blockchain);

      return tokens.map(tokenAddress => {
        const erc7984Address = tokenMapping.find(token =>
          compareAddresses(tokenAddress, token.tokenAddress)
        )?.shieldedTokenAddress;

        if (!erc7984Address) return { tokenAddress, amount: new BigNumber(NaN) };

        const encryptedBalance = handlePairs.find(pair =>
          compareAddresses(pair.contractAddress, erc7984Address)
        );

        const decryptedBalance = new BigNumber(
          encryptedBalance
            ? decryptedBalances[encryptedBalance.handle as `0x${string}`].toString()
            : NaN
        );

        return { tokenAddress, amount: decryptedBalance };
      });
    } catch {
      return [];
    }
  }

  private async decryptBalances(
    handlePairs: {
      handle: string;
      contractAddress: string;
    }[],
    userAddress: string,
    blockchain: EvmBlockchainName
  ): Promise<Readonly<Record<`0x${string}`, ClearValueType>>> {
    try {
      const zamaInstance = this.zamaInstanceService.getInstance(blockchain);
      const signatureInfo = this.zamaSignatureService.signatureInfo;

      const erc7984Addresses = this.zamaTokensService.supportedTokensMapping[blockchain].map(
        token => token.shieldedTokenAddress
      );
      const checksumAddress = getAddress(userAddress);

      const decryptedBalances = await zamaInstance.userDecrypt(
        handlePairs,
        signatureInfo.privateKey,
        signatureInfo.publicKey,
        signatureInfo.signature.replace('0x', ''),
        erc7984Addresses,
        checksumAddress,
        signatureInfo.startTimeStamp,
        signatureInfo.durationDays
      );

      return decryptedBalances;
    } catch (err) {
      return {};
    }
  }

  public async refreshPendingUnshieldBalances(): Promise<void> {
    try {
      const promises = ZAMA_SUPPORTED_CHAINS.map(async chain => {
        const adapter = this.getAdapter(chain);
        const shieldTokens = this.zamaTokensService.supportedTokensMapping[chain];
        const walletAddress = adapter.signer.walletAddress;
        const pendingBalances = (
          await Promise.all(
            shieldTokens.map(token =>
              this.fetchPendingUnshieldBalance(token, walletAddress, adapter)
            )
          )
        ).flat();

        const handlePairs = shieldTokens
          .map((t, i) => {
            if (!pendingBalances[i]) return null;
            return {
              handle: pendingBalances[i].encryptedAmount,
              contractAddress: t.shieldedTokenAddress
            };
          })
          .filter(v => !isNil(v));

        const decryptedBalances = await this.decryptBalances(handlePairs, walletAddress, chain);

        return pendingBalances.map(pendingBalance => {
          return {
            tokenAddress: pendingBalance.tokenAddress,
            encryptedAmount: pendingBalance.encryptedAmount,
            decryptedWeiAmount: new BigNumber(
              decryptedBalances[pendingBalance?.encryptedAmount as `0x${string}`]?.toString() || '0'
            )
          };
        });
      });

      const balances = await Promise.all(promises);

      this._pendingUnshieldBalances$.next(
        Object.fromEntries(
          ZAMA_SUPPORTED_CHAINS.map((chain, i) => {
            return [chain, balances[i]];
          })
        )
      );
    } catch {}
  }

  private async fetchPendingUnshieldBalance(
    token: ZamaSupportedToken,
    walletAddress: string,
    adapter: EvmAdapter
  ): Promise<{ tokenAddress: string; encryptedAmount: string }[]> {
    try {
      const requestLogs = await adapter.public.getLogs({
        fromBlock: token.shieldedTokenDeployBlock,
        address: token.shieldedTokenAddress as `0x${string}`,
        event: {
          type: 'event',
          name: 'UnwrapRequested',
          inputs: [
            { indexed: true, internalType: 'address', name: 'receiver', type: 'address' },
            { indexed: true, internalType: 'bytes32', name: 'unwrapRequestId', type: 'bytes32' },
            { indexed: false, internalType: 'euint64', name: 'amount', type: 'bytes32' }
          ]
        },
        args: {
          receiver: walletAddress as `0x${string}`
        }
      });

      const finalizedLogs = await adapter.public.getLogs({
        fromBlock: token.shieldedTokenDeployBlock,
        address: token.shieldedTokenAddress as `0x${string}`,
        event: {
          type: 'event',
          name: 'UnwrapFinalized',
          inputs: [
            { indexed: true, internalType: 'address', name: 'receiver', type: 'address' },
            { indexed: true, internalType: 'bytes32', name: 'unwrapRequestId', type: 'bytes32' },
            { indexed: false, internalType: 'euint64', name: 'encryptedAmount', type: 'bytes32' },
            { indexed: false, internalType: 'uint64', name: 'cleartextAmount', type: 'uint64' }
          ]
        },
        args: {
          receiver: walletAddress as `0x${string}`,
          unwrapRequestId: requestLogs.map(log => log.data)
        }
      });

      const pendingLogs = requestLogs.filter(
        requestLog =>
          !finalizedLogs
            .map(finalizeLog => finalizeLog.args.unwrapRequestId?.toLowerCase())
            .includes(requestLog.data.toLowerCase())
      );

      if (!pendingLogs.length) return [];

      return pendingLogs.map(log => ({
        tokenAddress: token.tokenAddress,
        encryptedAmount: log.args.amount
      }));
    } catch {
      return [];
    }
  }
}
