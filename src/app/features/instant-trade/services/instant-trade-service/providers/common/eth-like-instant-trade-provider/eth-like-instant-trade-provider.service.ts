import {
  ItOptions,
  ItProvider
} from '@features/instant-trade/services/instant-trade-service/models/it-provider';
import BigNumber from 'bignumber.js';
import { EthLikeBlockchainName } from '@shared/models/blockchain/blockchain-name';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';

import { EthLikeWeb3Public } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import { inject } from '@angular/core';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { EthLikeWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-private/eth-like-web3-private.service';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { AuthService } from '@core/services/auth/auth.service';
import {
  ItSettingsForm,
  SettingsService
} from '@features/swaps/services/settings-service/settings.service';
import { TransactionOptions } from '@shared/models/blockchain/transaction-options';
import InstantTradeToken from '@features/instant-trade/models/instant-trade-token';
import InstantTrade from '@features/instant-trade/models/instant-trade';
import { TransactionReceipt } from 'web3-eth';

export abstract class EthLikeInstantTradeProviderService implements ItProvider {
  public abstract readonly providerType: INSTANT_TRADE_PROVIDER;

  protected readonly web3Public: EthLikeWeb3Public;

  // Injected services start
  private readonly publicBlockchainAdapterService = inject(PublicBlockchainAdapterService);

  protected readonly web3PrivateService = inject(EthLikeWeb3PrivateService);

  protected readonly walletConnectorService = inject(WalletConnectorService);

  private readonly authService = inject(AuthService);

  private readonly settingsService = inject(SettingsService);
  // Injected services end

  protected get walletAddress(): string {
    return this.authService.userAddress;
  }

  protected get settings(): ItSettingsForm {
    return this.settingsService.instantTradeValue;
  }

  protected constructor(
    protected readonly blockchain: EthLikeBlockchainName,
    public readonly contractAddress: string
  ) {
    this.web3Public = this.publicBlockchainAdapterService[this.blockchain];
  }

  public getAllowance(
    tokenAddress: string,
    targetContractAddress = this.contractAddress
  ): Promise<BigNumber> {
    return this.web3Public.getAllowance({
      tokenAddress,
      ownerAddress: this.walletAddress,
      spenderAddress: targetContractAddress
    });
  }

  public async approve(
    tokenAddress: string,
    options: TransactionOptions,
    targetContractAddress = this.contractAddress
  ): Promise<void> {
    this.walletConnectorService.checkSettings(this.blockchain);
    await this.web3PrivateService.approveTokens(
      tokenAddress,
      targetContractAddress,
      'infinity',
      options
    );
  }

  public abstract calculateTrade(
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken,
    shouldCalculateGas: boolean,
    fromAddress?: string
  ): Promise<InstantTrade>;

  public abstract createTrade(
    trade: InstantTrade,
    options: ItOptions
  ): Promise<Partial<TransactionReceipt>>;
}
