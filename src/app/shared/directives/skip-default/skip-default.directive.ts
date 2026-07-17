import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  standalone: false,
  selector: '[skipDefault]',
  exportAs: 'skipDefault'
})
export class SkipDefaultDirective {
  @Input() skipDefault: boolean = true;

  @HostListener('click', ['$event'])
  private onClick(event: Event): void {
    if (!this.skipDefault) return;
    event.preventDefault();
    event.stopPropagation();
  }
}
