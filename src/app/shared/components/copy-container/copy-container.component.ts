import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-copy-container',
  templateUrl: './copy-container.component.html',
  styleUrls: ['./copy-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CopyContainerComponent {
  @Input() text: string = '';

  @Input() loading = false;

  public hintShown = false;

  constructor(private cdr: ChangeDetectorRef) {}

  public openHint(): void {
    this.hintShown = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.hintShown = false;
      this.cdr.detectChanges();
    }, 1000);
  }
}
