import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-buy-crypto',
  templateUrl: './buy-crypto.component.html',
  styleUrls: ['./buy-crypto.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuyCryptoComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
