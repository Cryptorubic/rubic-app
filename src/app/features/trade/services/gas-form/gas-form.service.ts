import { Injectable } from '@angular/core';
import { SwapsStateService } from '../swaps-state/swaps-state.service';
import { BehaviorSubject, map, of, share, startWith, tap } from 'rxjs';
import { BlockchainName, BlockchainsInfo } from 'rubic-sdk';
import { CROSS_CHAIN_SUPPORTED_CHAINS_CONFIG } from '../../constants/cross-chain-supported-chains';
import { switchIif } from '@app/shared/utils/utils';
import { AvailableBlockchain } from '../../components/assets-selector/services/blockchains-list-service/models/available-blockchain';
import { GoogleTagManagerService } from '@app/core/services/google-tag-manager/google-tag-manager.service';
import { GAS_FORM_DISABLED_CHAINS } from './constants/gas-from-disabled-chains';

@Injectable()
export class GasFormService {
  private _gasFormSourceAvailableBlockchains$ = new BehaviorSubject<AvailableBlockchain[]>([]);

  public readonly gasFormSourceAvailableBlockchains$ =
    this._gasFormSourceAvailableBlockchains$.asObservable();

  private _gasFormTargetAvailableBlockchains$ = new BehaviorSubject<AvailableBlockchain[]>([]);

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

  public get gasFormSourceAvailableBlockchains(): AvailableBlockchain[] {
    return this._gasFormSourceAvailableBlockchains$.getValue();
  }

  public get gasFormTargetAvailableBlockchains(): AvailableBlockchain[] {
    return this._gasFormTargetAvailableBlockchains$.getValue();
  }

  public get gasFormBlockchainsAmount(): number {
    return this.gasFormSourceAvailableBlockchains.length;
  }

  constructor(
    private readonly swapsStateService: SwapsStateService,
    private readonly gtmService: GoogleTagManagerService
  ) {}

  public setGasFormSourceAvailableBlockchains(
    toBlockchain: BlockchainName,
    allAvailableBlockchains: AvailableBlockchain[]
  ): void {
    const gasFormSourceChains = allAvailableBlockchains.filter(chain =>
      this.isGasFormSupportedSourceChain(chain.name, toBlockchain)
    );
    this._gasFormSourceAvailableBlockchains$.next(gasFormSourceChains);
  }

  public setGasFormTargetAvailableBlockchains(
    allAvailableBlockchains: AvailableBlockchain[]
  ): void {
    const gasFormTargetChains = allAvailableBlockchains.filter(
      chain =>
        BlockchainsInfo.isEvmBlockchainName(chain.name) &&
        !GAS_FORM_DISABLED_CHAINS.includes(chain.name)
    );
    this._gasFormTargetAvailableBlockchains$.next(gasFormTargetChains);
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

  private fireGtmServiceOnNullableTrade(): void {
    this.gtmService.fireGasFormGtm({ isSuccessfullCalculation: false });
  }
}
