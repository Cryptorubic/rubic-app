import {Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, Renderer2} from '@angular/core';
import {DOCUMENT} from '@angular/common';

@Component({
  selector: 'app-message-box',
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.scss']
})
export class MessageBoxComponent implements OnInit, OnDestroy {
  @Input() title: string;
  @Input() description: string;
  @Input() additionalDescription?: string;

  @Output() onClose = new EventEmitter<void>();

  close() {
    this.renderer.removeClass(this.document.body, 'noscroll');
    this.onClose.emit();
  }

  constructor(
      @Inject(DOCUMENT) private document: Document,
      private renderer: Renderer2,
  ) {
  }

  ngOnInit() {
    this.renderer.addClass(this.document.body, 'noscroll');
  }

  ngOnDestroy() {
    this.renderer.removeClass(this.document.body, 'noscroll');
  }
}
