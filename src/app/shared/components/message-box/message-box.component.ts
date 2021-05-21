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
import { Observable } from 'rxjs';
import { QueryParamsService } from '../../../core/services/query-params/query-params.service';

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

  public readonly $theme: Observable<string>;

  close() {
    this.renderer.removeClass(this.document.body, 'noscroll');
    this.onClose.emit();
  }

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private readonly queryParamsService: QueryParamsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.$theme = this.queryParamsService.$theme;
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
