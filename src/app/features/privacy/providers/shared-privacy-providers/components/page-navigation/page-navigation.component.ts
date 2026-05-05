import { WA_WINDOW } from '@ng-web-apis/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  inject
} from '@angular/core';
import { PageType } from './models/page-type';
import { HeaderStore } from '@core/header/services/header.store';
import { PAGE_TYPE_IMAGE } from '@features/privacy/providers/shared-privacy-providers/components/page-navigation/models/page-type-image';

@Component({
  selector: 'app-page-navigation',
  templateUrl: './page-navigation.component.html',
  styleUrls: ['./page-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageNavigationComponent {
  @Input({ required: true }) public readonly pages: PageType[];

  public readonly PAGE_TYPE_IMAGE = PAGE_TYPE_IMAGE;

  @Input() public readonly disabledPages: PageType[] = [];

  @Input({ required: true }) public readonly activePage: PageType;

  @Output() onSelect = new EventEmitter<PageType>();

  private readonly headerStore = inject(HeaderStore);

  private readonly window = inject(WA_WINDOW);

  public readonly isMobile = this.window.innerWidth <= 768;

  get activePageIndex(): number {
    return this.pages.findIndex(p => p.type === this.activePage.type);
  }

  public onPageSelect(selectedPage: PageType): void {
    if (this.activePage.type === selectedPage.type) return;

    this.onSelect.emit(selectedPage);
  }

  public isPageDisabled(page: PageType): boolean {
    return (this.disabledPages || []).some(disabledPage => disabledPage?.type === page?.type);
  }
}
