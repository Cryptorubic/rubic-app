import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input
} from '@angular/core';
import { NAVIGATOR } from '@ng-web-apis/common';

@Component({
  selector: 'app-dropdown-options-table-item',
  templateUrl: './dropdown-options-table-item.component.html',
  styleUrls: ['./dropdown-options-table-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownOptionsTableItemComponent {
  @Input() copyValue: string = '';

  public isDropdownOpen: boolean = false;

  public isCopyClicked: boolean = false;

  constructor(
    @Inject(NAVIGATOR) private readonly navigator: Navigator,
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
}
