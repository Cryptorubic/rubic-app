import { Injectable } from '@angular/core';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import { Token } from '@app/shared/models/tokens/token';
import {
  BLOCKCHAIN_NAME,
  BlockchainName,
  ErrorInterface,
  EvmBlockchainName,
  TokenAmount
} from '@cryptorubic/core';
import {
  EvmAdapter,
  EvmBasicTransactionOptions,
  EvmTransactionConfig,
  InsufficientFundsError,
  WalletNotConnectedError
} from '@cryptorubic/web3';
import BigNumber from 'bignumber.js';
import { lastValueFrom, timer, switchMap, takeWhile, BehaviorSubject } from 'rxjs';
import { HOUDINI_STATUS } from '../models/status';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { GasService } from '@app/core/services/gas-service/gas.service';

@Injectable()
export class HoudiniSwapService {
  private readonly _useProxy$ = new BehaviorSubject<boolean | null>(null);

  private readonly _contractSpender$ = new BehaviorSubject<string | null>(null);

  private readonly _fromToken$ = new BehaviorSubject<TokenAmount<BlockchainName> | null>(null);

  private readonly _toToken$ = new BehaviorSubject<Token | null>(null);

  public get useProxy(): boolean {
    return this._useProxy$.value;
  }

  public get contractSpender(): string {
    return this._contractSpender$.value;
  }

  public get fromToken(): TokenAmount<BlockchainName> {
    return this._fromToken$.value;
  }

  public get toToken(): Token {
    return this._toToken$.value;
  }

  public get chainAdapter(): EvmAdapter {
    return this.sdkLegacyService.adaptersFactoryService.getAdapter(
      this.fromToken.blockchain as EvmBlockchainName
    );
  }

  private get gasLimitRatio(): number {
    if (
      this.toToken.blockchain === BLOCKCHAIN_NAME.ZETACHAIN ||
      this.fromToken.blockchain === BLOCKCHAIN_NAME.ZETACHAIN
    ) {
      return 1.5;
    }
    return 1.05;
  }

  constructor(
    private readonly rubicApiService: RubicApiService,
    private readonly sdkLegacyService: SdkLegacyService,
    private readonly notificationsService: NotificationsService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly gasService: GasService
  ) {}

  public async quote(
    fromToken: TokenAmount<BlockchainName>,
    toToken: Token,
    receiver: string
  ): Promise<
    | {
        tradeId: string;
        tokenAmount: string;
        tokenAmountWei: BigNumber;
      }
    | { tradeError: ErrorInterface }
  > {
    const quoteResponse = await this.rubicApiService.quoteAllRoutes({
      srcTokenBlockchain: fromToken.blockchain,
      srcTokenAddress: fromToken.address,
      srcTokenAmount: fromToken.tokenAmount.toString(),
      dstTokenBlockchain: toToken.blockchain,
      dstTokenAddress: toToken.address,
      preferredProvider: 'houdini',
      fromAddress: this.walletConnectorService.address,
      receiver,
      showDangerousRoutes: true
    });
    const route = quoteResponse.routes[0];
    if (route) {
      this._contractSpender$.next(route.transaction.approvalAddress!);
      this._useProxy$.next(route.useRubicContract);

      return {
        tradeId: route.id,
        tokenAmount: route.estimate.destinationTokenAmount,
        tokenAmountWei: new BigNumber(route.estimate.destinationWeiAmount)
      };
    }

    const failed = quoteResponse.failed[0];
    return {
      tradeError: failed.data
    };
  }

  public async transfer(
    id: string,
    fromToken: TokenAmount<BlockchainName>,
    toToken: Token,
    receiver: string
  ): Promise<void> {
    try {
      this._fromToken$.next(fromToken);
      this._toToken$.next(toToken);

      const { shouldCalculateGasPrice, gasPriceOptions } = await this.gasService.getGasInfo(
        fromToken.blockchain
      );

      if (fromToken.blockchain !== this.walletConnectorService.network) {
        await this.walletConnectorService.switchChain(fromToken.blockchain as EvmBlockchainName);
      }

      const optionsToApprove: EvmBasicTransactionOptions = {
        ...(shouldCalculateGasPrice && { gasPriceOptions })
      };

      await this.approveSwap(optionsToApprove);

      const swapResponse = await this.rubicApiService.fetchSwapData<EvmTransactionConfig>({
        id,
        srcTokenBlockchain: fromToken.blockchain,
        srcTokenAddress: fromToken.address,
        srcTokenAmount: fromToken.tokenAmount.toString(),
        dstTokenBlockchain: toToken.blockchain,
        dstTokenAddress: toToken.address,
        preferredProvider: 'houdini',
        fromAddress: this.walletConnectorService.address,
        receiver
      });

      const { data, to, value, gas } = swapResponse.transaction;

      await this.chainAdapter.signer.trySendTransaction({
        txOptions: {
          data,
          to,
          value,
          gas,
          onTransactionHash: () => {
            this.notificationsService.showInfo(
              'Transaction has started. Please wait 3–5 minutes until the operation is complete.'
            );
          },
          gasLimitRatio: this.gasLimitRatio,
          gasPriceOptions
          // ...(options?.useEip155 && {
          //   chainId: `0x${blockchainId[this.from.blockchain].toString(16)}`
          // })
        }
      });

      const { status } = await lastValueFrom(
        timer(30_000, 30_000).pipe(
          switchMap(() => this.rubicApiService.fetchCrossChainTxStatusExtended(id)),
          takeWhile(
            res => res.status !== HOUDINI_STATUS.SUCCESS && res.status !== HOUDINI_STATUS.FAIL,
            true
          )
        )
      );
      if (status === HOUDINI_STATUS.SUCCESS) {
        this.notificationsService.showSuccess('The operation was successful.');
      } else {
        this.notificationsService.showError('The operation has failed.');
      }
    } catch (err) {
      if (err instanceof InsufficientFundsError) {
        this.notificationsService.showError('Insufficient funds.');
      }
      console.error(err);
    }
  }

  private async needApprove(): Promise<boolean> {
    this.checkWalletConnected();

    if (this.fromToken.isNative && this.fromToken.blockchain !== BLOCKCHAIN_NAME.METIS) {
      return false;
    }

    if (!this.useProxy || !this.contractSpender) return false;

    const fromTokenAddress =
      this.fromToken.isNative && this.fromToken.blockchain === BLOCKCHAIN_NAME.METIS
        ? '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000'
        : this.fromToken.address;

    const allowance = await this.chainAdapter.getAllowance(
      fromTokenAddress,
      this.walletConnectorService.address,
      this.contractSpender
    );
    return this.fromToken.weiAmount.gt(allowance.allowanceWei);
  }

  private async approveSwap(options: EvmBasicTransactionOptions): Promise<string | void> {
    const needApprove = await this.needApprove();
    if (!needApprove) {
      return;
    }

    this.checkWalletConnected();
    await this.chainAdapter.signer.checkBlockchainCorrect(this.fromToken.blockchain);

    const fromTokenAddress =
      this.fromToken.isNative && this.fromToken.blockchain === BLOCKCHAIN_NAME.METIS
        ? '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000'
        : this.fromToken.address;

    return this.chainAdapter.approveTokens(
      fromTokenAddress,
      this.contractSpender,
      this.fromToken.weiAmount,
      options
    );
  }

  private checkWalletConnected(): never | void {
    if (!this.walletConnectorService.address) {
      throw new WalletNotConnectedError();
    }
  }
}
