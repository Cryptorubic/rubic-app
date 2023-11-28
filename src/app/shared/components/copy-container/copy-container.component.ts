import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
  Inject
} from '@angular/core';
import { NAVIGATOR } from '@ng-web-apis/common';

@Component({
  selector: 'app-copy-container',
  templateUrl: './copy-container.component.html',
  styleUrls: ['./copy-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CopyContainerComponent {
  @Input({ required: true }) text: string;

  public hintShown = false;

  constructor(
    private cdr: ChangeDetectorRef,
    @Inject(NAVIGATOR) private readonly navigator: Navigator
  ) {}

  public copyToClipboard(): void {
    this.openHint();
    this.navigator.clipboard.writeText(this.text);
  }

  public openHint(): void {
    this.hintShown = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.hintShown = false;
      this.cdr.markForCheck();
    }, 1000);
  }
}
