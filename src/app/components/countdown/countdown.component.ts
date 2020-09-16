import { Component, OnInit, Input } from '@angular/core';
import { Observable, Subscription, interval } from 'rxjs';
import { map } from 'rxjs/operators';

export interface IMessage {
  days: any;
  hours: any;
  minutes: any;
  seconds: any;
}

@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss'],
})
export class CountdownComponent implements OnInit {
  @Input() timeStart: number;
  @Input() correctTimeStart: number;
  @Input() timeEndDayPlus: number;

  private counter$: Observable<number>;
  private subscription: Subscription;
  public message = {
    days: '-',
    hours: '-',
    minutes: '-',
    seconds: '-',
  } as IMessage;

  constructor() {}

  dhms(t) {
    let days = Math.floor(t / 86400);
    t -= days * 86400;
    let hours = Math.floor(t / 3600) % 24;
    t -= hours * 3600;
    let minutes = Math.floor(t / 60) % 60;
    t -= minutes * 60;
    let seconds = t % 60;

    days = days < 10 ? 0 + days : days;
    hours = hours < 10 ? 0 + hours : hours;
    minutes = minutes < 10 ? 0 + minutes : minutes;
    seconds = seconds < 10 ? 0 + seconds : seconds;

    const message = {
      days,
      hours,
      minutes,
      seconds,
    };

    return message;
  }

  ngOnInit() {
    if (this.correctTimeStart) {
      this.timeStart = this.timeStart * 1000;
    }

    const future = new Date(this.timeStart);

    if (this.timeEndDayPlus) {
      future.setDate(future.getDate() + this.timeEndDayPlus);
    }
    this.counter$ = interval(1000).pipe(
      map(() => Math.floor((future.getTime() - new Date().getTime()) / 1000))
    );
    this.subscription = this.counter$.subscribe(
      (x) => (this.message = this.dhms(x))
    );
  }

  OnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
