import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ZAMA_PAGES } from '../../constants/zama-pages';
import { PageType } from '../../../shared-privacy-providers/components/page-navigation/models/page-type';
import { ZamaFacadeService } from '../../services/zama-sdk/zama-facade.service';
import { PrivatePageTypeService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-page-type/private-page-type.service';

@Component({
  selector: 'app-zama-view',
  templateUrl: './zama-view.component.html',
  styleUrls: ['./zama-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZamaViewComponent {
  public readonly activePage$ = this.privatePageTypeService.activePage$;

  public readonly pages = ZAMA_PAGES;

  constructor(
    private readonly zamaFacadeService: ZamaFacadeService,
    private readonly privatePageTypeService: PrivatePageTypeService
  ) {
    this.privatePageTypeService.activePage = this.pages[0];
    this.initZama();
  }

  private async initZama(): Promise<void> {
    await this.zamaFacadeService.initServices();
  }

  public onPageSelect(page: PageType): void {
    this.privatePageTypeService.activePage = page;
  }

  public ngOnDestroy() {
    this.zamaFacadeService.removeSubs();
  }
}
