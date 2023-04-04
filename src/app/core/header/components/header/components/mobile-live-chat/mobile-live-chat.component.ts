import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-mobile-live-chat',
  templateUrl: './mobile-live-chat.component.html',
  styleUrls: ['./mobile-live-chat.component.scss']
})
export class MobileLiveChatComponent {
  @ViewChild('liveChartPlaceholder', { static: true })
  liveChartPlaceholder: ElementRef<HTMLDivElement>;

  constructor(@Inject(DOCUMENT) private document: Document) {}
}
