// tslint:disable: max-line-length

import { Component, OnInit } from '@angular/core';

export interface IQuestion {
  title: string;
  text: string;
  isActive: boolean;
}

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
})
export class FaqComponent implements OnInit {
  constructor() {}
  public questions: Array<IQuestion>;

  public ngOnInit(): void {
    this.questions = [
      {
        title: 'What is Rubic p2p trades?',
        text: `Rubic is a multichain defi platform. Rubic organizes defi services to enable a project to create, manage and trade tokens decentralized in ONE PLACE. It helps users to make trades on their terms, share and generate revenue`,
        isActive: false,
      },
      {
        title: 'Who can use our service?',
        text: `Anyone who wants to create and manage tokens and anyone who has a cryptocurrency and would like to exchange it. KYC is not needed. `,
        isActive: false,
      },
      {
        title: 'What are the minimum and maximum trade size?',
        text: `There are no limits.`,
        isActive: false,
      },
      {
        title: 'How does it work?',
        text: `There are two options for trading:
        First, you create trade on your own terms and wait till another part agrees with your terms and fills its part.
        Second, you choose the instant trade and you agree with the terms of another part. Coming soon.

        You can create your own token without any coding skills and trade it without listing.
        `,
        isActive: false,
      },
      {
        title: 'What cryptocurrencies are supported?',
        text: `Rubic works with Ethereum based tokens for trading at the moment. Tron, Binance Chain, BTC blockchains will be released soon.  However to create and manage tokens we already provide multichain service supported by Ethereum, Tron, EOS, NEO, Waves, Binance Smart Chain Blockchains. `,
        isActive: false,
      },
      {
        title: 'Should I list my token before using your service?',
        text: `No, you can trade any tokens. However you can contact us and we will add your token in our list.`,
        isActive: false,
      },
      {
        title: 'How to start?',
        text: `It is easy and fast. You only need MetaMask to start.
        Fill out in the fields of desired terms and click to Create Trade.`,
        isActive: false,
      },
      {
        title: 'How to create a trade?',
        text: `Step 1. Fill out the form, enter amount what you have and enter amount what you want to get
        Step 2. Add advanced options, such as closing date and time, minimum and maximum contribution, privacy, brokerage fee, lock liquidity until the trade completion
        Step 3. Check details of the trade
        Step 4. Click Create Trade
        Step 5. Use Metamask to confirm your trade
        Step 6. Contribute your part of the deal.`,
        isActive: false,
      },
      {
        title: 'How much does it cost?',
        text: `Service charges 0.3% from each trade that was created.`,
        isActive: false,
      },
      {
        title: 'How long does it take to complete a deal?',
        text: `The deal will be completed as soon as the other side completes its side.`,
        isActive: false,
      },
      {
        title: 'How the privacy and security of the transaction are ensured?',
        text: `The deal is secured by smart contracts verified by experienced developers and external audit.`,
        isActive: false,
      },
      {
        title: 'How many people can participate in one deal?',
        text: `Up to 10 people can participate on each side`,
        isActive: false,
      },
      {
        title: 'What will happen if the second part doesn’t complete a deal?',
        text: `The deal will expire and you will receive all your tokens back.`,
        isActive: false,
      },
      {
        title:
          'If I created a deal, however, I have changed my mind, can I cancel a deal?',
        text: `Yes, you can cancel your deal any time before the second part will complete the deal. If you cancel a deal you can get your tokens back.`,
        isActive: false,
      },
    ];
  }
}
