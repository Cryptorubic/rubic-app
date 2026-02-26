import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { PageType } from './models/page-type';

@Component({
  selector: 'app-page-navigation',
  templateUrl: './page-navigation.component.html',
  styleUrls: ['./page-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageNavigationComponent {
  @Input({ required: true }) public readonly pages: PageType[];

  @Input({ required: true }) public readonly activePage: PageType;

  @Output() onSelect = new EventEmitter<PageType['type']>();

  get activePageIndex(): number {
    return this.pages.findIndex(p => p.type === this.activePage.type);
  }

  public onPageSelect(selectedPage: PageType): void {
    if (this.activePage.type === selectedPage.type) return;

    this.onSelect.emit(selectedPage.type);
  }
}
