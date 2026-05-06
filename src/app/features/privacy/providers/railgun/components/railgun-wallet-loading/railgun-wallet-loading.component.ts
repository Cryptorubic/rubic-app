import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input
} from '@angular/core';
import { RailgunSupportedChain } from '@features/privacy/providers/railgun/constants/network-map';
import { BlockchainName } from '@cryptorubic/core';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { blockchainColor } from '@shared/constants/blockchain/blockchain-color';
import { fadeAnimation } from '@shared/utils/utils';
import { BehaviorSubject, of, scan, shareReplay, switchMap, timer } from 'rxjs';

interface UtxoChain {
  progress: number;
  icon: string;
  color: string;
  label: string;
}

@Component({
  selector: 'app-railgun-wallet-loading',
  templateUrl: './railgun-wallet-loading.component.html',
  styleUrls: ['./railgun-wallet-loading.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeAnimation],
  standalone: false
})
export class RailgunWalletLoadingComponent {
  public utxoChains: UtxoChain[] = [];

  public completedChains: { chain: RailgunSupportedChain; progress: number }[] = [];

  public scanInProgress = true;

  private readonly _poiLoading$ = new BehaviorSubject(false);

  public readonly poiLoading$ = this._poiLoading$.asObservable();

  private readonly cdr = inject(ChangeDetectorRef);

  public readonly poiProgress$ = this.poiLoading$.pipe(
    switchMap(isLoading => {
      if (isLoading) {
        return timer(0, 250).pipe(scan(acc => acc + 1, 0));
      } else {
        return of(0);
      }
    }),
    shareReplay(1)
  );

  @Input({ required: true }) set poiLoading(value: boolean) {
    console.log('set poi loading', value);
    this._poiLoading$.next(value);
    this.cdr.markForCheck();
  }

  @Input({ required: true }) set utxoScan(value: Record<RailgunSupportedChain, number>) {
    const chains = Object.entries(value).map(
      ([chain, nativeProgress]: [BlockchainName, number]) => {
        const icon = blockchainIcon[chain];
        const label = blockchainLabel[chain];
        const color = blockchainColor[chain];
        const progress = nativeProgress;

        return { icon, label, color, progress };
      }
    );
    this.utxoChains = chains;

    const sum = chains.reduce((acc, curr) => acc + curr.progress, 0);
    this.scanInProgress = sum !== 0 && sum !== chains.length * 100;
  }

  public trackByFn(_: number, item: UtxoChain): string {
    return item.label;
  }
}
