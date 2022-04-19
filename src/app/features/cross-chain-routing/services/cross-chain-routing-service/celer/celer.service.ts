import { Injectable } from '@angular/core';
import { PrivateBlockchainAdapterService } from '@app/core/services/blockchain/blockchain-adapters/private-blockchain-adapter.service';
import { PublicBlockchainAdapterService } from '@app/core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { TokensService } from '@app/core/services/tokens/tokens.service';
import { SettingsService } from '@app/features/swaps/services/settings-service/settings.service';
import networks from '@app/shared/constants/blockchain/networks';
import { EthLikeBlockchainName } from '@app/shared/models/blockchain/blockchain-name';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import BigNumber from 'bignumber.js';
import { ContractsDataService } from '../contracts-data/contracts-data.service';
import { SmartRouting } from '../models/smart-routing.interface';
import { CelerApiService } from './celer-api.service';
import { CELER_CONTRACT } from './constants/CELER_CONTRACT';

@Injectable()
export class CelerService {
  private _smartRouting: SmartRouting;

  set smartRouting(value: SmartRouting) {
    this._smartRouting = value;
  }

  get smartRouting(): SmartRouting {
    return this._smartRouting;
  }

  get userSlippage(): number {
    return this.settingsService.crossChainRoutingValue.slippageTolerance / 100;
  }

  constructor(
    private readonly privateBlockchainAdapterService: PrivateBlockchainAdapterService,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    private readonly contractsDataService: ContractsDataService,
    private readonly tokensService: TokensService,
    private readonly settingsService: SettingsService,
    private readonly celerApiService: CelerApiService
  ) {}

  public async makeTransferWithSwap(
    fromAmount: BigNumber,
    fromBlockchain: EthLikeBlockchainName,
    fromToken: TokenAmount,
    toBlockchain: EthLikeBlockchainName,
    toToken: TokenAmount
  ): Promise<void> {
    const nativeOut = this.isNativeToken(fromBlockchain, fromToken);
    const dstChainId = this.getBlockchainId(toBlockchain);
    const receiver = this.getCelerContractAddress(toBlockchain);
    const amountIn = fromAmount;
    console.log(nativeOut, dstChainId, receiver, amountIn, toToken);

    return undefined;
  }

  // private getSrcSwapObject(
  //   srcProviderType: ProviderType,
  //   fromBlockchain: EthLikeBlockchainName
  // ): unknown {
  //   return;
  // }

  private getBlockchainId(blockchain: EthLikeBlockchainName): number {
    return networks.find(network => network.name === blockchain).id;
  }

  private getCelerContractAddress(blockchain: EthLikeBlockchainName): string {
    return CELER_CONTRACT[blockchain];
  }

  private isNativeToken(blockchain: EthLikeBlockchainName, token: TokenAmount): boolean {
    return this.publicBlockchainAdapterService[blockchain].isNativeAddress(token.address);
  }

  private prepareArgs(args: unknown[]): unknown[] {
    return args.map(arg => {
      return Array.isArray(arg) ? this.prepareArgs(arg) : String(arg);
    });
  }

  public async calculateTrade(): Promise<void> {}
}
