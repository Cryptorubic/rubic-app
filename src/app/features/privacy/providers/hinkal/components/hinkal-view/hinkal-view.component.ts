import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HinkalFacadeService } from '../../services/hinkal-sdk/hinkal-facade.service';
import { HINKAL_PAGES } from '../../constants/hinkal-pages';
import { BehaviorSubject } from 'rxjs';
import { PageType } from '../../../shared-privacy-providers/components/page-navigation/models/page-type';
import { BlockchainName } from '@cryptorubic/core';
import { HINKAL_SUPPORTED_CHAINS } from '../../constants/hinkal-supported-chains';

@Component({
  selector: 'app-hinkal-view',
  templateUrl: './hinkal-view.component.html',
  styleUrls: ['./hinkal-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HinkalViewComponent {
  private readonly _activePage$ = new BehaviorSubject<PageType>(HINKAL_PAGES[0]);

  public readonly activePage$ = this._activePage$.asObservable();

  public readonly activeChain$ = this.hinkalFacadeService.activeChain$;

  public readonly supportedChains = HINKAL_SUPPORTED_CHAINS;

  public readonly pages = HINKAL_PAGES;

  constructor(private readonly hinkalFacadeService: HinkalFacadeService) {}

  public onPageSelect(page: PageType): void {
    this._activePage$.next(page);
  }

  public onSwitchNetwork(chain: BlockchainName): void {
    this.hinkalFacadeService.switchChain(chain);
  }

  ngOnDestroy() {
    this.hinkalFacadeService.removeSubs();
  }
}
