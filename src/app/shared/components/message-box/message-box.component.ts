/* eslint-disable @typescript-eslint/no-unused-expressions */
import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  Type
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-message-box',
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.scss']
})
export class MessageBoxComponent implements OnInit, OnDestroy {
  @Input() title: string;

  @Input() descriptionComponentClass: Type<any>;

  @Input() descriptionComponentInputs;

  @Input() descriptionText: string;

  @Input() additionalDescription?: string;

  @Output() onClose = new EventEmitter<void>();

  close() {
    this.renderer.removeClass(this.document.body, 'noscroll');
    this.onClose.emit();
  }

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    data?.title && (this.title = data.title);

    data?.descriptionText && (this.descriptionText = data.descriptionText);

    data?.descriptionComponentClass &&
      (this.descriptionComponentClass = data.descriptionComponentClass);

    data?.descriptionComponentInputs &&
      (this.descriptionComponentInputs = data.descriptionComponentInputs);

    data?.additionalDescription && (this.additionalDescription = data.additionalDescription);
  }

  ngOnInit() {
    this.renderer.addClass(this.document.body, 'noscroll');
  }

  ngOnDestroy() {
    this.renderer.removeClass(this.document.body, 'noscroll');
  }
}
