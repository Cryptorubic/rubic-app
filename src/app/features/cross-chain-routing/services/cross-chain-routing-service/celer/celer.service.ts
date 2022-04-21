import { Injectable } from '@angular/core';
import { PrivateBlockchainAdapterService } from '@app/core/services/blockchain/blockchain-adapters/private-blockchain-adapter.service';
import { PublicBlockchainAdapterService } from '@app/core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { TokensService } from '@app/core/services/tokens/tokens.service';
import { SettingsService } from '@app/features/swaps/services/settings-service/settings.service';
import networks from '@app/shared/constants/blockchain/networks';
import {
  BlockchainName,
  EthLikeBlockchainName
} from '@app/shared/models/blockchain/blockchain-name';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import BigNumber from 'bignumber.js';
import { pluck } from 'rxjs/operators';
import { ContractsDataService } from '../contracts-data/contracts-data.service';
import { SmartRouting } from '../models/smart-routing.interface';
import { CelerApiService } from './celer-api.service';
import { CELER_CONTRACT } from './constants/CELER_CONTRACT';
import { CELER_CONTRACT_ABI } from './constants/CELER_CONTRACT_ABI';
import { CELER_SUPPORTED_BLOCKCHAINS } from './constants/CELER_SUPPORTED_BLOCKCHAINS';
import { EstimateAmtResponse } from './models/estimate-amt-response.interface';
import { ProviderType } from './models/provider-type.enum';
import { SwapInfoDest } from './models/swap-info-dest.interface';

const INTEGRATOR_ADDRESS = '0x0000000000000000000000000000000000000000';

const EMPTY_DATA = '0x';

const CELER_SLIPPAGE_ADDITIONAL_VALUE = 1.01;

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

  private getDstSwapObject(providerType: ProviderType): SwapInfoDest {
    const version = this.getProviderIndex(providerType);
    const dstSwap: SwapInfoDest = {
      dex: '',
      integrator: INTEGRATOR_ADDRESS,
      version,
      path: [''],
      dataInchOrPathV3: EMPTY_DATA,
      deadline: 999999999999999,
      amountOutMinimum: 123
    };
    return dstSwap;
  }

  public async calculateTrade(
    srcChainId: number,
    dstChainId: number,
    tokenSymbol: string,
    slippageTolerance: number,
    amt: string
  ): Promise<EstimateAmtResponse> {
    const estimatedData = await this.celerApiService
      .getEstimateAmt(srcChainId, dstChainId, tokenSymbol, slippageTolerance, amt)
      .toPromise();

    const toTokenPrice = await this.tokensService.getAndUpdateTokenPrice({
      address: '',
      blockchain: 'ARBITRUM'
    });
    console.log(toTokenPrice);

    return estimatedData;
  }

  public async getCelerSlippage(
    srcChainId: number,
    dstChainId: number,
    tokenSymbol: string,
    amt: string
  ): Promise<number> {
    const bridgeRate = await this.celerApiService
      .getEstimateAmt(srcChainId, dstChainId, tokenSymbol, 0, amt)
      .pipe(pluck('bridge_rate'))
      .toPromise();

    return (1 - bridgeRate) * 100 * CELER_SLIPPAGE_ADDITIONAL_VALUE;
  }

  public checkIsCelerContractPaused(
    fromBlockchain: EthLikeBlockchainName,
    toBlockchain: EthLikeBlockchainName
  ): Promise<boolean[]> {
    const checkContract = (blockchain: EthLikeBlockchainName): Promise<boolean> => {
      const contractAddress = this.getCelerContractAddress(blockchain);
      return this.publicBlockchainAdapterService[blockchain].callContractMethod<boolean>(
        contractAddress,
        CELER_CONTRACT_ABI,
        'paused'
      );
    };

    return Promise.all([checkContract(fromBlockchain), checkContract(toBlockchain)]);
  }

  public getBlockchainId(blockchain: EthLikeBlockchainName): number {
    return networks.find(network => network.name === blockchain).id;
  }

  private getCelerContractAddress(blockchain: EthLikeBlockchainName): string {
    return CELER_CONTRACT[blockchain];
  }

  public isSupportedBlockchain(blockchain: BlockchainName): boolean {
    return CELER_SUPPORTED_BLOCKCHAINS.includes(blockchain);
  }

  private isNativeToken(blockchain: EthLikeBlockchainName, token: TokenAmount): boolean {
    return this.publicBlockchainAdapterService[blockchain].isNativeAddress(token.address);
  }

  private prepareArgs(args: unknown[]): unknown[] {
    return args.map(arg => {
      return Array.isArray(arg) ? this.prepareArgs(arg) : String(arg);
    });
  }

  private getProviderIndex(providerType: ProviderType): number {
    return Object.values(ProviderType).indexOf(providerType);
  }
}
