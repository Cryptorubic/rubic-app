import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';
import { Facet } from '@features/facets/models/facet';
import { TokensService } from '@core/services/tokens/tokens.service';
import { Observable, of } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-facets-page',
  templateUrl: './facets-page.component.html',
  styleUrls: ['./facets-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FacetsPageComponent {
  public selectedBlockchain: BlockchainName = BLOCKCHAIN_NAME.GOERLI;

  public readonly facetsData$ = this.getData();

  constructor(private readonly tokensService: TokensService) {}

  private fetchData(): Observable<Partial<Record<BlockchainName, Facet[]>>> {
    // @TODO
    return of({});
  }

  private getData(): Observable<Partial<Record<BlockchainName, Facet[]>>> {
    return of(null).pipe(
      delay(3_000),
      switchMap(() => this.getDefaultValues())
    );
  }

  private async getDefaultValues(): Promise<Partial<Record<BlockchainName, Facet[]>>> {
    const GETH = await this.tokensService.findToken({
      address: '0x0000000000000000000000000000000000000000',
      blockchain: BLOCKCHAIN_NAME.GOERLI
    });
    const CELER = await this.tokensService.findToken({
      address: '0x5d3c0f4ca5ee99f8e8f59ff9a5fab04f6a7e007f',
      blockchain: BLOCKCHAIN_NAME.GOERLI
    });
    const GOERLI = new Array(5).fill({
      token: GETH,
      url: 'https://faucetlink.to',
      name: 'faucetlink.to'
    });
    const SCROLL = new Array(4).fill({
      token: CELER,
      url: 'https://faucetlink.to',
      name: 'faucetlink.to'
    });

    return {
      [BLOCKCHAIN_NAME.GOERLI]: GOERLI,
      [BLOCKCHAIN_NAME.SCROLL_TESTNET]: SCROLL
    };
  }
}
