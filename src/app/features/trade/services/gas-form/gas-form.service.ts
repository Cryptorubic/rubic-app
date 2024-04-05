import { Injectable } from '@angular/core';
import { SwapsStateService } from '../swaps-state/swaps-state.service';
import { BehaviorSubject, map, of, startWith } from 'rxjs';
import { BlockchainName } from 'rubic-sdk';
import { CROSS_CHAIN_SUPPORTED_CHAINS_CONFIG } from '../../constants/cross-chain-supported-chains';
import { switchIif } from '@app/shared/utils/utils';
import { AvailableBlockchain } from '../../components/assets-selector/services/blockchains-list-service/models/available-blockchain';

@Injectable()
export class GasFormService {
  private _gasFormAvailableBlockchains$ = new BehaviorSubject<AvailableBlockchain[]>([]);

  public readonly gasFormAvailableBlockchains$ = this._gasFormAvailableBlockchains$.asObservable();

  public readonly bestTrade$ = this.swapsStateService.tradesStore$.pipe(
    map(trades => trades.filter(t => t.trade && !t.error)),
    map(trades => trades?.[0]),
    switchIif(
      Boolean,
      trade => of(trade),
      () => of(null)
    ),
    startWith(null)
  );

  public get gasFormAvailableBlockchains(): AvailableBlockchain[] {
    return this._gasFormAvailableBlockchains$.getValue();
  }

  public get gasFormBlockchainsAmount(): number {
    return this.gasFormAvailableBlockchains.length;
  }

  constructor(private readonly swapsStateService: SwapsStateService) {}

  public setGasFormSourceAvailableBlockchains(
    toBlockchain: BlockchainName,
    allAvailableBlockchains: AvailableBlockchain[]
  ): void {
    const gasFormBlockchains = allAvailableBlockchains.filter(chain =>
      this.isGasFormSupportedSourceChain(chain.name, toBlockchain)
    );
    this._gasFormAvailableBlockchains$.next(gasFormBlockchains);
  }

  private isGasFormSupportedSourceChain(
    fromBlockchain: BlockchainName,
    toBlockchain: BlockchainName
  ): boolean {
    return (
      toBlockchain !== fromBlockchain &&
      !!Object.values(CROSS_CHAIN_SUPPORTED_CHAINS_CONFIG).find(
        supportedChains =>
          supportedChains.includes(toBlockchain) && supportedChains.includes(fromBlockchain)
      )
    );
  }
}
