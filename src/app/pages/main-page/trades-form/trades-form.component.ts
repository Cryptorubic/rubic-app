import { Component, OnInit } from '@angular/core';

interface Blockchain {
  name: string;
  code: number;
  label: string;
  image: string;
}

@Component({
  selector: 'app-trades-form',
  templateUrl: './trades-form.component.html',
  styleUrls: ['./trades-form.component.scss']
})

export class TradesFormComponent implements OnInit {
  public BLOCKCHAINS: Array<Blockchain> = [
    {
      name: 'ETH',
      code: 22,
      label: 'Ethereum',
      image: 'assets/images/icons/coins/eth.png'
    },
    {
      name: 'BSC',
      code: 22,
      label: 'Binance Smart Chain',
      image: 'assets/images/icons/coins/bnb.svg'
    },
    {
      name: 'MAT',
      code: 22,
      label: 'Matic',
      image: 'assets/images/icons/coins/matic.svg'
    }
  ];

  public MODES
  constructor() { }

  ngOnInit() {
  }

}
