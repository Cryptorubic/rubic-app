import {Component, OnInit} from '@angular/core';
import {UserService} from './services/user/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'mywish-swaps';

  constructor(
    private userService: UserService
  ) {

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
  }
}
