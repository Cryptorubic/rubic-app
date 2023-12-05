import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-airdrop-faq',
  templateUrl: './airdrop-faq.component.html',
  styleUrls: ['./airdrop-faq.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AirdropFaqComponent {
  public readonly cards = [
    {
      title: 'Make an on-chain or cross-chain swap',
      image: 'assets/images/swap-and-earn/first-card.svg',
      bottomDistance: '-25px',
      rightDistance: '-40px'
    },
    {
      title: 'Check balance',
      image: 'assets/images/swap-and-earn/second-card.svg',
      bottomDistance: '-30px',
      rightDistance: '-10px'
    },
    {
      title: 'Request withdrawal',
      image: 'assets/images/swap-and-earn/third-card.svg',
      bottomDistance: '-80px',
      rightDistance: '-30px'
    }
  ];
}
