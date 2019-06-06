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
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {
  constructor() {}
  public questions: Array<IQuestion>;

  public ngOnInit(): void {
    this.questions = [
      {
        title: 'What is SWAPS.NETWORK?',
        text: `SWAPS.NETWORK is a fully decentralized OTC. We provide marketplace superior pricing and liquidity for large orders in digital assets.`,
        isActive: false
      },
      {
        title: 'Who can use our service/create a deal?',
        text: `Anyone who has a cryptocurrency and would like to exchange it. KYC is not needed.`,
        isActive: false
      },
      {
        title: 'What are the minimum and maximum trade size?',
        text: `There are no limits.`,
        isActive: false
      },
      {
        title: 'How does it work?',
        text: `We created a smart contract which allows our customers to exchange their cryptocurrency assets without a third party.`,
        isActive: false
      },
      {
        title: 'What cryptocurrencies are supported?',
        text: `SWAPS.NETWORK works with Ethereum based tokens. NEO, EOS, TRON and BTC Blockchains will be released soon. You can trade any pair of cryptocurrency with another individual. Our goal is a safe and simple environment to swap.`,
        isActive: false
      },
      {
        title: 'Should I list my token before using your service?',
        text: `No, you can swap any tokens.`,
        isActive: false
      },
      {
        title: 'Do you plan to deal with fiat?',
        text: `Not at the moment, however, we are open to partnership with companies who work with fiat. If you have any suggestions please write to us info@swaps.network.`,
        isActive: false
      },
      {
        title: 'How to start?',
        text: `It’s easy, fast and free. Firstly, log in. Fill out in the fields of the desired terms and click Create SWAP.`,
        isActive: false
      },
      {
        title: 'How to create a swap?',
        text: `Step 1: Fill out the form, enter amount what you have, enter amount what you want to get
        Step 2: Add extra options, closing date and time, contract management address, privacy
        Step 3: Add advanced options: set up the size of minimum contribution
        Step 4: check details of the deal
        Step 5: initialization`,
        isActive: false
      },
      {
        title: 'How much does it cost?',
        text: `We do not charge for each completed transaction. However, if you want to create a private deal, you pay $10`,
        isActive: false
      },
      {
        title: 'Do you have any extra fee?',
        text: `There are no transaction or withdrawal fees.`,
        isActive: false
      },
      {
        title: 'How long does it take to complete a deal?',
        text: `The deal will be completed as soon as the other side completes its part.`,
        isActive: false
      },
      {
        title: 'How the privacy and security of the transaction are ensured?',
        text: `The deal is secured by smart contracts verified by experienced developers and external audit.`,
        isActive: false
      },
      {
        title: 'How many people can participate in one deal?',
        text: `Up to 10 people can participate on each side`,
        isActive: false
      },
      {
        title: 'What will happen if the second part doesn’t complete a deal?',
        text: `The deal will expire and you will receive all your tokens back.`,
        isActive: false
      },
      {
        title: 'If I created a deal, however, I have changed my mind, can I cancel a deal?',
        text: `Yes, you can cancel your deal any time before the second part will complete the deal. If you cancel a deal you can get your tokens back.`,
        isActive: false
      }
    ];
  }

}
