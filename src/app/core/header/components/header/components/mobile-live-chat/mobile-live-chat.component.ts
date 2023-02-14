import { Component, ElementRef, ViewChild } from '@angular/core';

// declare var LiveChatWidget: any;

@Component({
  selector: 'app-mobile-live-chat',
  templateUrl: './mobile-live-chat.component.html',
  styleUrls: ['./mobile-live-chat.component.scss']
})
export class MobileLiveChatComponent {
  @ViewChild('liveChartPlaceholder', { static: true })
  liveChartPlaceholder: ElementRef<HTMLDivElement>;

  // constructor(
  // @Inject(DOCUMENT) private document: Document,) { }

  // ngOnInit() {
  // }

  // ngAfterViewInit(): void {
  // console.log('this', this.liveChartPlaceholder)
  // const liveChat = this.document.getElementById('chat-widget-container').cloneNode(true);
  // const liveChat = this.document.getElementById('chat-widget-container');
  // LiveChatWidget.call('maximize');
  // this.liveChartPlaceholder.nativeElement.append(liveChat)
  // }
}
