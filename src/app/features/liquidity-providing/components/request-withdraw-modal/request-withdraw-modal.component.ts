import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-request-withdraw-modal',
  templateUrl: './request-withdraw-modal.component.html',
  styleUrls: ['./request-withdraw-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequestWithdrawModalComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    return undefined;
  }
}
