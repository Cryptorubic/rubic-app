import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { ActivationEnd, NavigationStart, Router } from '@angular/router';

import { MODE, PROJECT_PARTS } from './app-routing.module';
import { MatDialog } from '@angular/material/dialog';

// TODO: удлить весь этот кошмар
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'mywish-swaps';

  public hideInstructionLink;

  public visibleWatchButton;

  public notCookiesAccept: boolean;

  public withHeader: boolean;

  public warning: boolean = false; // TODO: добавить индикатор поломки бэка (возиожно, проверка пары эндпоинтов)

  constructor(private router: Router, private cookieService: CookieService) {
    const body = document.getElementsByTagName('body')[0];
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (event.url === '/about') {
          body.classList.add('white-bg');
        }
        if (event.url !== '/about') {
          body.classList.remove('white-bg');
        }

        // Code do nothing.
        // if (MODE === 'PROD') {
        //   for (const url in PROJECT_PARTS[MODE]) {
        //     if (new RegExp(url).test(event.url)) {
        //       if (
        //         PROJECT_PARTS[MODE][url] !== location.hostname &&
        //         location.hostname === PROJECT_PARTS[MODE].from
        //       ) {
        //         // location.hostname = PROJECT_PARTS[MODE][url];
        //         return;
        //       }
        //     }
        //   }
        // }
      }

      if (event instanceof ActivationEnd) {
        this.withHeader = !event.snapshot.data.noheader;

        if (!event.snapshot.firstChild) {
          if (event.snapshot.data.support) {
            this.hideInstructionLink = event.snapshot.data.supportHide;
            this.visibleWatchButton = !event.snapshot.data.hideInstruction;
            body.classList.add('with-support');
            body.classList.remove('without-support');
            if (event.snapshot.data.supportHide) {
              body.classList.add(`support-hide-${event.snapshot.data.supportHide}`);
            }
          } else {
            body.classList.remove('with-support');
            body.classList.add('without-support');
            this.visibleWatchButton = false;
          }
        }
      }
      this.notCookiesAccept = !this.cookieService.get('cookies-accept');
    });
  }

  private checkLiveChat() {
    const liveChatButtonFrame = document.getElementById('livechat-compact-view');
    const liveChatContainer = document.getElementById('livechat-compact-container');

    if (!liveChatButtonFrame) {
      setTimeout(() => {
        this.checkLiveChat();
      });
      return;
    }

    const mutationObserver = new window['MutationObserver'](() => {
      liveChatContainer.removeAttribute('style');
    });
    mutationObserver.observe(liveChatContainer, {
      attributes: true,
      attributeFilter: ['style']
    });
    liveChatContainer.removeAttribute('style');

    const frameContent =
      liveChatButtonFrame['contentWindow'] || liveChatButtonFrame['contentDocument'];
    const frameContentContainer = frameContent.document.getElementById('content-container');

    frameContentContainer.setAttribute('style', 'padding: 0 !important');

    frameContent.document.getElementById('full-view-button').style.height = '100%';
  }

  ngOnInit(): void {
    let visibilityEvent;
    let visibilityAttr;

    if (typeof document.hidden !== 'undefined') {
      visibilityAttr = 'hidden';
      visibilityEvent = 'visibilitychange';
    } else if (typeof document['msHidden'] !== 'undefined') {
      visibilityAttr = 'msHidden';
      visibilityEvent = 'msvisibilitychange';
    } else if (typeof document['webkitHidden'] !== 'undefined') {
      visibilityAttr = 'webkitHidden';
      visibilityEvent = 'webkitvisibilitychange';
    }

    if (typeof document.addEventListener === 'undefined' || visibilityAttr === undefined) {
      console.log(
        'This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.'
      );
    } else {
      document.addEventListener(
        visibilityEvent,
        () => {
          if (!document[visibilityAttr]) {
            //  this.userService.updateUser();
          }
        },
        false
      );
    }

    this.checkLiveChat();

    /* if (this.web3Service.ethereum && this.web3Service.ethereum.isConnected()) {
      this.web3Service.setUserAddress();
    }*/
  }
}
