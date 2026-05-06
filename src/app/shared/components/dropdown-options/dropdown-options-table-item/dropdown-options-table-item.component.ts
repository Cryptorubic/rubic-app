import { WA_NAVIGATOR } from '@ng-web-apis/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input
} from '@angular/core';

@Component({
  selector: 'app-dropdown-options-table-item',
  templateUrl: './dropdown-options-table-item.component.html',
  styleUrls: ['./dropdown-options-table-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class DropdownOptionsTableItemComponent {
  @Input() copyValue: string = '';

  @Input() link: string = '';

  public isDropdownOpen: boolean = false;

  public isCopyClicked: boolean = false;

  constructor(
    @Inject(WA_NAVIGATOR) private readonly navigator: Navigator,
    private readonly cdr: ChangeDetectorRef
  ) {}

  public copyToClipboard(): void {
    this.isCopyClicked = true;
    this.navigator.clipboard.writeText(this.copyValue);

    setTimeout(() => {
      this.isCopyClicked = false;
      this.cdr.markForCheck();
    }, 500);
  }

  public onLinkClick(): void {
    window.open(this.link, '_blank');
    this.isDropdownOpen = false;
  }
}
