import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HinkalFacadeService } from '../../services/hinkal-sdk/hinkal-facade.service';
import { HINKAL_PAGES } from '../../constants/hinkal-pages';
import { PageType } from '../../../shared-privacy-providers/components/page-navigation/models/page-type';
import { BlockchainName } from '@cryptorubic/core';
import { HINKAL_SUPPORTED_CHAINS } from '../../constants/hinkal-supported-chains';
import { PrivatePageTypeService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-page-type/private-page-type.service';

@Component({
  selector: 'app-hinkal-view',
  templateUrl: './hinkal-view.component.html',
  styleUrls: ['./hinkal-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HinkalViewComponent {
  public readonly activePage$ = this.privatePageTypeService.activePage$;

  public readonly activeChain$ = this.hinkalFacadeService.activeChain$;

  public readonly supportedChains = HINKAL_SUPPORTED_CHAINS;

  public readonly pages = HINKAL_PAGES;

  constructor(
    private readonly hinkalFacadeService: HinkalFacadeService,
    private readonly privatePageTypeService: PrivatePageTypeService
  ) {
    this.privatePageTypeService.activePage = this.pages[0];
  }

  public onPageSelect(page: PageType): void {
    this.privatePageTypeService.activePage = page;
  }

  public onSwitchNetwork(chain: BlockchainName): void {
    this.hinkalFacadeService.switchChain(chain);
  }

  ngOnDestroy() {
    this.hinkalFacadeService.removeSubs();
  }
}
