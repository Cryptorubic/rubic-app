import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';
import { Observable, of, retry } from 'rxjs';
import { catchError, first, map, startWith, tap, timeout } from 'rxjs/operators';
import { defaultFaucets } from '@features/faucets/constants/default-faucets';
import { FaucetsApiService } from '@features/faucets/services/faucets-api.service';
import { Faucet } from '@features/faucets/models/faucet';

@Component({
  selector: 'app-faucets-page',
  templateUrl: './faucets-page.component.html',
  styleUrls: ['./faucets-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaucetsPageComponent {
  public selectedBlockchain: BlockchainName = BLOCKCHAIN_NAME.GOERLI;

  public readonly faucetsData$ = this.getData().pipe(
    first(),
    tap(faucets => {
      this.loading = false;
      this.selectedBlockchain = Object.keys(faucets)[0] as BlockchainName;
    })
  );

  public readonly blockchainsList$ = this.faucetsData$.pipe(
    startWith([]),
    map(faucets => {
      return (Object.keys(faucets) as BlockchainName[]) || [];
    })
  );

  public loading: boolean = true;

  constructor(private readonly faucetsApiService: FaucetsApiService) {}

  private getData(): Observable<Partial<Record<BlockchainName, Faucet[]>>> {
    return this.faucetsApiService.fetchFaucets().pipe(
      timeout(2_000),
      retry({ count: 1, delay: 2_000 }),
      timeout(2_000),
      catchError(() => of(defaultFaucets))
    );
  }
}
