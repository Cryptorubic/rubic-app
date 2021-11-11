import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TuiDialogModule, TuiNotificationsModule, TuiRootModule } from '@taiga-ui/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { Event, Router, Scroll } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { filter, pairwise } from 'rxjs/operators';
import { CoreModule } from '@core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    CoreModule,
    SharedModule,
    TuiRootModule,
    TuiNotificationsModule,
    TuiDialogModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'csrftoken',
      headerName: 'X-CSRFToken'
    }),
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    private readonly router: Router,
    private readonly viewportScroller: ViewportScroller
  ) {
    this.setScrollStrategy();
  }

  /**
   * Defines scroll strategy, when page url is changed.
   * Doesn't scroll if only query parameters are changed.
   */
  private setScrollStrategy(): void {
    this.router.events
      .pipe(
        filter((e: Event): e is Scroll => e instanceof Scroll),
        pairwise()
      )
      .subscribe(([prevEvent, event]) => {
        if (event.position) {
          // backward navigation
          this.viewportScroller.scrollToPosition(event.position);
        } else if (event.anchor) {
          // anchor navigation
          this.viewportScroller.scrollToAnchor(event.anchor);
        } else if (
          prevEvent.routerEvent.urlAfterRedirects.split('?')[0] !==
          event.routerEvent.urlAfterRedirects.split('?')[0]
        ) {
          // forward navigation
          this.viewportScroller.scrollToPosition([0, 0]);
        }
      });
  }
}
