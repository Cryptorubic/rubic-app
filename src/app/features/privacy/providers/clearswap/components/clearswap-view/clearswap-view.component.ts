import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CLEARSWAP_PAGES } from '@app/features/privacy/providers/clearswap/constants/clearswap-pages';
import { ClearswapPrivateActionButtonService } from '@app/features/privacy/providers/clearswap/services/clearswap-private-action-button.service';
import { PageType } from '@app/features/privacy/providers/shared-privacy-providers/components/page-navigation/models/page-type';
import { PrivateActionButtonService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-action-button/private-action-button.service';
import { PrivatePageTypeService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-page-type/private-page-type.service';

@Component({
  selector: 'app-clearswap-view',
  templateUrl: './clearswap-view.component.html',
  styleUrls: ['./clearswap-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: PrivateActionButtonService, useClass: ClearswapPrivateActionButtonService }
  ]
})
export class ClearswapViewComponent {
  public readonly activePage$ = this.privatePageTypeService.activePage$;

  public readonly pages = CLEARSWAP_PAGES;

  constructor(private readonly privatePageTypeService: PrivatePageTypeService) {
    this.privatePageTypeService.activePage = this.pages[0];
  }

  public onPageSelect(page: PageType): void {
    this.privatePageTypeService.activePage = page;
  }
}
