import {Component, OnInit} from '@angular/core';
import {UserService} from './services/user/user.service';
import {ActivationStart, NavigationStart, ResolveStart, Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'mywish-swaps';

  constructor(
    private userService: UserService,
    private router: Router
  ) {
    const body = document.getElementsByTagName('body')[0];
    this.router.events.subscribe((event) => {
      if (event instanceof ActivationStart) {
        if (event.snapshot.data.support) {
          body.className = 'with-support';
        } else {
          body.className = '';
        }
      }

      if (event instanceof NavigationStart) {
        if (event.id === 2) {

        }
      }
    });
  }

  private checkLiveChat() {

    const liveChatButtonFrame = document.getElementById('livechat-compact-view');

    if (!liveChatButtonFrame) {
      setTimeout(() => {
        this.checkLiveChat();
      }, 2000);
      return;
    }

    const frameContent = liveChatButtonFrame['contentWindow'] || liveChatButtonFrame['contentDocument'];
    const frameContentContainer = frameContent.document.getElementById('content-container');

    frameContentContainer.style.margin = '-10px';
    liveChatButtonFrame.style.opacity = '0';
    liveChatButtonFrame.style.top = '0';
    liveChatButtonFrame.style.marginTop = '-62px';

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
      console.log('This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.');
    } else {
      document.addEventListener(visibilityEvent, () => {
        if (!document[visibilityAttr]) {
          this.userService.updateUser();
        }
      }, false);
    }

    this.checkLiveChat();

  }
}
