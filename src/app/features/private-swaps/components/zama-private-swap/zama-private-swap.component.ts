import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BlockchainAdapterFactoryService } from '@app/core/services/sdk/sdk-legacy/blockchain-adapter-factory/blockchain-adapter-factory.service';
import { BLOCKCHAIN_NAME, compareAddresses, Token, TokenAmount } from '@cryptorubic/core';
import { EvmAdapter } from '@cryptorubic/web3';
import { ERC7984_TOKEN_ABI } from '../../constants/erc7984-token-abi';
import { createInstance, initSDK } from '@zama-fhe/relayer-sdk/bundle';
import { FhevmInstance } from '@zama-fhe/relayer-sdk/web';
import { SEPOLIA_TEST2_TOKEN, TOKENS } from '../../constants/sepolia-test-tokens';
import { AuthService } from '@app/core/services/auth/auth.service';
import { FormControl } from '@angular/forms';
import { ErrorsService } from '@app/core/errors/errors.service';
import { BehaviorSubject, distinctUntilChanged, filter, switchMap } from 'rxjs';
import { getAddress } from 'ethers/lib/utils';
import { ERC20_MOCK_ABI } from '../../constants/erc20mock-abi';
import { ShortenAmountPipe } from '@app/shared/pipes/shorten-amount.pipe';
import { decodeEventLog } from 'viem';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
// aclContractAddress: '0xcA2E8f1F656CD25C01F05d0b243Ab1ecd4a8ffb6',
// kmsContractAddress: '0x77627828a55156b04Ac0DC0eb30467f1a552BB03',
// inputVerifierContractAddress: '0xCe0FC2e05CFff1B719EFF7169f7D80Af770c8EA2',
// gatewayChainId: 1,
// relayerUrl: 'https://gateway.mainnet.zama.ai',
// chainId: 1,
// network:
//   'https://lb.drpc.org/ogrpc?network=ethereum&dkey=AuU5r20j6ECLgozoeJVc3wsB-MZsFSUR8K7gQszWOGuW',
// verifyingContractAddressDecryption: '0x0000000000000000000000000000000000000000',
// verifyingContractAddressInputVerification: '0x0000000000000000000000000000000000000000'

interface StateInfo {
  isConfidential: boolean;
  token: TokenAmount;
  balance: string;
}

@Component({
  selector: 'app-zama-private-swap',
  templateUrl: './zama-private-swap.component.html',
  styleUrls: ['./zama-private-swap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZamaPrivateSwapComponent {
  private readonly shortenPipe = new ShortenAmountPipe();

  private readonly _tokens = TOKENS;

  public visibleTokens = this._tokens.map(token => token.name);

  public readonly selectedToken = new FormControl<string | null>(null);

  public readonly wrapAmount = new FormControl<string | null>(null);

  public readonly transferAmount = new FormControl<string | null>(null);

  public readonly unwrapAmount = new FormControl<string | null>(null);

  public readonly transferReceiver = new FormControl<string | null>(null);

  private sdk: FhevmInstance;

  public readonly state$ = this.selectedToken.valueChanges.pipe(
    filter(Boolean),
    distinctUntilChanged(),
    switchMap(token => this.updateState(token))
  );

  private readonly _decryptedBalance$ = new BehaviorSubject<string | null>(null);

  public readonly decryptedBalance$ = this._decryptedBalance$.asObservable();

  private readonly _isLoading$ = new BehaviorSubject<boolean>(false);

  public readonly isLoading$ = this._isLoading$.asObservable();

  private setLoading(value: boolean): void {
    this._isLoading$.next(value);
  }

  constructor(
    private readonly adapterFactory: BlockchainAdapterFactoryService,
    private readonly authService: AuthService,
    private readonly errorService: ErrorsService,
    private readonly walletConnectorService: WalletConnectorService
  ) {
    this.initZAMA();
  }

  private async initZAMA(): Promise<void> {
    try {
      this.setLoading(true);
      await initSDK();
      const instance = await createInstance({
        // ACL_CONTRACT_ADDRESS (FHEVM Host chain)
        aclContractAddress: '0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D',
        // KMS_VERIFIER_CONTRACT_ADDRESS (FHEVM Host chain)
        kmsContractAddress: '0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A',
        // INPUT_VERIFIER_CONTRACT_ADDRESS (FHEVM Host chain)
        inputVerifierContractAddress: '0xBBC1fFCdc7C316aAAd72E807D9b0272BE8F84DA0',
        // DECRYPTION_ADDRESS (Gateway chain)
        verifyingContractAddressDecryption: '0x5D8BD78e2ea6bbE41f26dFe9fdaEAa349e077478',
        // INPUT_VERIFICATION_ADDRESS (Gateway chain)
        verifyingContractAddressInputVerification: '0x483b9dE06E4E4C7D35CCf5837A1668487406D955',
        // FHEVM Host chain id
        chainId: 11155111,
        // Gateway chain id
        gatewayChainId: 10901,
        // Optional RPC provider to host chain
        network: 'https://ethereum-sepolia-rpc.publicnode.com',
        // Relayer URL
        relayerUrl: 'https://relayer.testnet.zama.org'
      });
      this.sdk = instance;
      this.setLoading(false);
      await this.walletConnectorService.switchChain(BLOCKCHAIN_NAME.SEPOLIA);
    } catch (err) {
      this.errorService.catch(err);
      console.log('FAILED TO INIT SDK', err);
    }
  }

  public async mintToken(): Promise<void> {
    try {
      const tx = EvmAdapter.encodeMethodCall(SEPOLIA_TEST2_TOKEN.address, ERC20_MOCK_ABI, 'mint', [
        this.authService.userAddress,
        '10000000000000000000000000000'
      ]);

      await this.evmAdapter.signer.sendTransaction({ txOptions: tx });
    } catch (err) {
      this.errorService.catch(err);
    }
  }

  private async updateState(tokenName: string): Promise<StateInfo> {
    const token = this._tokens.find(v => compareAddresses(tokenName, v.name));
    const isConfidential = token.symbol.startsWith('c');

    const balance = await (isConfidential
      ? this.fetchConfidentialBalance(token.address)
      : this.evmAdapter.getBalance(this.authService.userAddress, token.address));

    return {
      isConfidential,
      balance: (isConfidential
        ? balance
        : this.shortenPipe.transform(Token.fromWei(balance).toString(), 12, 6, true)
      ).toString(),
      token
    };
  }

  public get evmAdapter(): EvmAdapter {
    return this.adapterFactory.getAdapter(BLOCKCHAIN_NAME.SEPOLIA);
  }

  private async fetchConfidentialBalance(tokenAddress: string): Promise<string> {
    try {
      const resp = await this.evmAdapter.callContractMethod(
        tokenAddress,
        ERC7984_TOKEN_ABI,
        'confidentialBalanceOf',
        [this.authService.userAddress]
      );

      return resp;
    } catch (err) {
      console.log('FAILED TO FETCH CONFIDENTIAL BALANCE', err);
      return '0';
    }
  }

  private async approveBeforeWrap(token: TokenAmount): Promise<boolean> {
    try {
      const needApprove = await this.evmAdapter.needApprove(
        SEPOLIA_TEST2_TOKEN,
        '0x9942aBbEAb7f5BcefbA3d9865B148aA79B2E82eB',
        this.authService.userAddress,
        '1'
      );

      if (!needApprove) return true;

      const resp = await this.evmAdapter.approveTokens(
        token.address, // TEST2 token
        '0x9942aBbEAb7f5BcefbA3d9865B148aA79B2E82eB' // cTest2
      );
      return !!resp;
    } catch (err) {
      this.errorService.catch(err);
      return false;
    }
  }

  public async wrap(token: TokenAmount): Promise<void> {
    try {
      this.setLoading(true);
      const isApproved = await this.approveBeforeWrap(token);
      const wrapAmount = this.wrapAmount.value;

      if (!isApproved || !wrapAmount) return;

      const tx = EvmAdapter.encodeMethodCall(
        '0x9942aBbEAb7f5BcefbA3d9865B148aA79B2E82eB',
        ERC7984_TOKEN_ABI,
        'wrap',
        [this.authService.userAddress, Token.toWei(wrapAmount, token.decimals)]
      );

      await this.evmAdapter.signer.sendTransaction({
        txOptions: tx
      });
    } catch (err) {
      this.errorService.catch(err);
    } finally {
      this.setLoading(false);
    }
  }

  public async decryptBalance(token: TokenAmount, encryptedBalance: string): Promise<void> {
    this.setLoading(true);
    const keyPair = this.sdk.generateKeypair();

    const contractAddress = token.address;
    const userAddress = getAddress(this.authService.userAddress);

    const handlePairs = [
      {
        handle: encryptedBalance,
        contractAddress
      }
    ];

    const startTimeStamp = Math.floor(Date.now() / 1000);
    const durationDays = 10;

    const eip712 = this.sdk.createEIP712(
      keyPair.publicKey,
      [contractAddress],
      startTimeStamp,
      durationDays
    );

    try {
      const signature = await this.evmAdapter.signer.wallet.signTypedData({
        domain: eip712.domain,
        message: {
          ...eip712.message,
          startTimestamp: BigInt(eip712.message.startTimestamp),
          durationDays: BigInt(eip712.message.durationDays)
        },
        types: eip712.types,
        primaryType: 'UserDecryptRequestVerification',
        account: userAddress as `0x${string}`
      });

      const res = await this.sdk.userDecrypt(
        handlePairs,
        keyPair.privateKey,
        keyPair.publicKey,
        signature.replace('0x', ''),
        [contractAddress],
        userAddress,
        startTimeStamp,
        durationDays
      );

      const decryptedWeiBalance = res[encryptedBalance as `0x${string}`].toString();
      this._decryptedBalance$.next(Token.fromWei(decryptedWeiBalance, 6).toFixed());
    } catch (err) {
      this.errorService.catch(err);
    } finally {
      this.setLoading(false);
    }
  }

  public async confidentialTransfer(token: TokenAmount): Promise<void> {
    try {
      this.setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 50));

      const transferTokenAmount = this.transferAmount.value;
      const receiver = this.transferReceiver.value;

      if (!transferTokenAmount || !this.transferReceiver) return;

      const userAddress = getAddress(this.authService.userAddress);

      const buffer = this.sdk.createEncryptedInput(token.address, userAddress);

      buffer.add64(BigInt(Token.toWei(transferTokenAmount, 6)));

      const ciphertexts = await buffer.encrypt();

      const encryptedAmount = '0x' + Buffer.from(ciphertexts.handles[0]).toString('hex');
      const inputProof = '0x' + Buffer.from(ciphertexts.inputProof).toString('hex');

      const tx = EvmAdapter.encodeMethodCall(
        token.address,
        ERC7984_TOKEN_ABI,
        'confidentialTransfer',
        [receiver, encryptedAmount, inputProof]
      );

      await this.evmAdapter.signer.trySendTransaction({
        txOptions: tx
      });
    } catch (err) {
      this.errorService.catch(err);
    } finally {
      this.setLoading(false);
    }
  }

  public async unwrap(token: TokenAmount): Promise<void> {
    try {
      this.setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 50));

      const unwrapAmount = this.unwrapAmount.value;

      if (!unwrapAmount) return;

      const userAddress = getAddress(this.authService.userAddress);

      const buffer = this.sdk.createEncryptedInput(token.address, userAddress);
      buffer.add64(BigInt(Token.toWei(unwrapAmount, 6)));

      const ciphertexts = await buffer.encrypt();

      const encryptedAmount = '0x' + Buffer.from(ciphertexts.handles[0]).toString('hex');
      const inputProof = '0x' + Buffer.from(ciphertexts.inputProof).toString('hex');

      const tx = EvmAdapter.encodeMethodCall(token.address, ERC7984_TOKEN_ABI, 'unwrap', [
        userAddress,
        userAddress,
        encryptedAmount,
        inputProof
      ]);

      const receipt = await this.evmAdapter.signer.trySendTransaction({
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

      const decryptedBurnAmount = await this.sdk.publicDecrypt([burntAmount.amount]);

      const finilizeWrapTx = EvmAdapter.encodeMethodCall(
        token.address,
        ERC7984_TOKEN_ABI,
        'finalizeUnwrap',
        [
          burntAmount.amount,
          decryptedBurnAmount.clearValues[burntAmount.amount],
          decryptedBurnAmount.decryptionProof
        ]
      );

      await this.evmAdapter.signer.trySendTransaction({ txOptions: finilizeWrapTx });
    } catch (err) {
      this.errorService.catch(err);
    } finally {
      this.setLoading(false);
    }
  }
}
