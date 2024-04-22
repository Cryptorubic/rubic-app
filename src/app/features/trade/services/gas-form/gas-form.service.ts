import { Injectable } from '@angular/core';
import { SwapsStateService } from '../swaps-state/swaps-state.service';
import { BehaviorSubject, map, of, share, startWith, tap } from 'rxjs';
import { BlockchainName, BlockchainsInfo } from 'rubic-sdk';
import { CROSS_CHAIN_SUPPORTED_CHAINS_CONFIG } from '../../constants/cross-chain-supported-chains';
import { switchIif } from '@app/shared/utils/utils';
import { AvailableBlockchain } from '../../components/assets-selector/services/blockchains-list-service/models/available-blockchain';
import { GoogleTagManagerService } from '@app/core/services/google-tag-manager/google-tag-manager.service';
import { GAS_FORM_DISABLED_CHAINS } from './constants/gas-form-disabled-chains';

@Injectable()
export class GasFormService {
  private readonly _searchQuery$ = new BehaviorSubject<string>('');

  private readonly _sourceAvailableBlockchains$ = new BehaviorSubject<AvailableBlockchain[]>([]);

  public readonly sourceAvailableBlockchains$ = this._sourceAvailableBlockchains$.asObservable();

  private readonly _targetAvailableBlockchains$ = new BehaviorSubject<AvailableBlockchain[]>([]);

  public readonly targetBlockchainsToShow$ = this._searchQuery$.pipe(
    map(query => this.targetAvailableBlockchains.filter(chain => this.showBlockchain(chain, query)))
  );

  public readonly sourceBlockchainsToShow$ = this._searchQuery$.pipe(
    map(query => this.sourceAvailableBlockchains.filter(chain => this.showBlockchain(chain, query)))
  );

  public readonly bestTrade$ = this.swapsStateService.tradesStore$.pipe(
    map(trades => trades.filter(t => t.trade && !t.error)),
    map(trades => trades?.[0]),
    switchIif(
      Boolean,
      trade => of(trade),
      () => of(null)
    ),
    tap(trade => {
      if (!trade) {
        this.fireGtmServiceOnNullableTrade();
      }
    }),
    share(),
    startWith(null)
  );

  public get sourceAvailableBlockchains(): AvailableBlockchain[] {
    return this._sourceAvailableBlockchains$.getValue();
  }

  public get targetAvailableBlockchains(): AvailableBlockchain[] {
    return this._targetAvailableBlockchains$.getValue();
  }

  public get availableBlockchainsAmount(): number {
    return this.sourceAvailableBlockchains.length;
  }

  constructor(
    private readonly swapsStateService: SwapsStateService,
    private readonly gtmService: GoogleTagManagerService
  ) {}

  public updateSearchQuery(value: string): void {
    this._searchQuery$.next(value);
  }

  public setGasFormSourceAvailableBlockchains(
    toBlockchain: BlockchainName,
    allAvailableBlockchains: AvailableBlockchain[]
  ): void {
    const gasFormSourceChains = allAvailableBlockchains.filter(chain =>
      this.isGasFormSupportedSourceChain(chain.name, toBlockchain)
    );
    this._sourceAvailableBlockchains$.next(gasFormSourceChains);
  }

  public setGasFormTargetAvailableBlockchains(
    allAvailableBlockchains: AvailableBlockchain[]
  ): void {
    const gasFormTargetChains = allAvailableBlockchains.filter(chain =>
      this.isGasFormSupportedTargetChain(chain.name)
    );
    this._targetAvailableBlockchains$.next(gasFormTargetChains);
  }

  private isGasFormSupportedTargetChain(blockchain: BlockchainName): boolean {
    return (
      BlockchainsInfo.isEvmBlockchainName(blockchain) &&
      !GAS_FORM_DISABLED_CHAINS.includes(blockchain)
    );
  }

  private isGasFormSupportedSourceChain(
    fromBlockchain: BlockchainName,
    toBlockchain: BlockchainName
  ): boolean {
    return (
      toBlockchain !== fromBlockchain &&
      BlockchainsInfo.isEvmBlockchainName(fromBlockchain) &&
      !GAS_FORM_DISABLED_CHAINS.includes(fromBlockchain) &&
      !!Object.values(CROSS_CHAIN_SUPPORTED_CHAINS_CONFIG).find(
        supportedChains =>
          supportedChains.includes(toBlockchain) && supportedChains.includes(fromBlockchain)
      )
    );
  }

  private showBlockchain(blockchain: AvailableBlockchain, query: string): boolean {
    return (
      blockchain.name.toLowerCase().includes(query.toLowerCase()) ||
      (blockchain.tags.length &&
        blockchain.tags.join(' ').toLowerCase().includes(query.toLowerCase()))
    );
  }

  private fireGtmServiceOnNullableTrade(): void {
    this.gtmService.fireGasFormGtm({ isSuccessfullCalculation: false });
  }
}
