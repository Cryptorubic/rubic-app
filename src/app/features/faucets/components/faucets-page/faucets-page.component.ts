import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';
import { Observable, of, retry } from 'rxjs';
import { catchError, first, map, startWith, tap, timeout } from 'rxjs/operators';
import { defaultFaucets } from '@features/faucets/constants/default-faucets';
import { FaucetsApiService } from '@features/faucets/services/faucets-api.service';
import { Faucet } from '@features/faucets/models/faucet';
import { sortFaucets } from '../../utils/faucets-sorter';

@Component({
  selector: 'app-faucets-page',
  templateUrl: './faucets-page.component.html',
  styleUrls: ['./faucets-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaucetsPageComponent {
  public selectedBlockchain: BlockchainName = BLOCKCHAIN_NAME.UNICHAIN_SEPOLIA_TESTNET;

  public readonly faucetsData$ = this.getData().pipe(
    first(faucets => Object.keys(faucets).length > 0),
    tap(faucets => {
      const sortedChainNames = Object.keys(faucets).sort(
        (currChain: BlockchainName, prevChain: BlockchainName) => sortFaucets(currChain, prevChain)
      );
      this.loading = false;
      this.selectedBlockchain = sortedChainNames[0] as BlockchainName;
      this.cdr.detectChanges();
    })
  );

  public readonly blockchainsList$ = this.faucetsData$.pipe(
    startWith([]),
    map(faucets => {
      return (Object.keys(faucets) as BlockchainName[]) || [];
    })
  );

  public loading: boolean = true;

  constructor(
    private readonly faucetsApiService: FaucetsApiService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  private getData(): Observable<Partial<Record<BlockchainName, Faucet[]>>> {
    return this.faucetsApiService.getFaucets().pipe(
      timeout(2_000),
      retry({ count: 1, delay: 2_000 }),
      timeout(2_000),
      catchError(() => of(defaultFaucets))
    );
  }
}
