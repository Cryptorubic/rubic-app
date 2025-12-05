import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaqComponent {
  public readonly questions = [
    // with gnosis
    // {
    //   title: 'Which networks are supported?',
    //   answer:
    //     'Ethereum<br/>Arbitrum<br/>BNB Chain<br/>Polygon<br/>Base<br/>Berachain<br/>zkSync Era<br/>Optimism<br/>Avalanche<br/>Scroll<br/>Fraxtal<br/>Soneium<br/>Linea<br/>Mode<br/>Mantle<br/>Metis<br/>Manta Pacific<br/>Fantom<br/>Polygon zkEVM<br/>Pulsechain<br/>Taiko<br/>X Layer<br/>Gnosis<br/>Flare<br/><br/>Testnet networks:<br/>Monad<br/>MegaETH'
    // },
    {
      title: 'Which networks are supported?',
      answer:
        'Ethereum<br/>Arbitrum<br/>BNB Chain<br/>Polygon<br/>Base<br/>Berachain<br/>zkSync Era<br/>Optimism<br/>Avalanche<br/>Scroll<br/>Fraxtal<br/>Soneium<br/>Linea<br/>Mode<br/>Mantle<br/>Metis<br/>Manta Pacific<br/>Fantom<br/>Polygon zkEVM<br/>Pulsechain<br/>Taiko<br/>X Layer<br/>Flare<br/><br/>Testnet networks:<br/>Monad<br/>MegaETH'
    },
    {
      title: 'How can I check how many swaps I’ve made?',
      answer:
        'To view the number of swaps you’ve completed, please connect your wallet and complete the Discord verification. The total will be displayed on the Red and Blue Pills.'
    },
    {
      title: 'How do I connect my wallet?',
      answer:
        'Using Rubic is quick and simple. You’ll need either a MetaMask wallet or any wallet compatible with WalletConnect. <br/> Connect your wallet by clicking the button at the top of the page. </br> Need help? <a href="https://www.youtube.com/c/RubicExchange/featured"> Check out our tutorials</a>'
    },
    {
      title: 'How and when can I claim?',
      answer:
        'Rubic takes a snapshot every week. You’ll be able to claim your RBC tokens by the end of each week directly on this page.<br/>Claiming will be available once you connect your wallet.'
    },
    {
      title: 'Do I need to keep my Discord account connected?',
      answer:
        'Yes — before preparing the claim contract, we will reverify that your wallet has a connected Discord account. Any wallet without a valid Discord connection at that time will be excluded from the claim list.'
    },
    {
      title: 'How much time I’ve to claim my reward?',
      answer:
        'The Rubic team will make a separate announcement specifying the timeframe for claiming your reward and add this information here.'
    },
    {
      title: 'For how long can I join the event?',
      answer:
        'You can join the event until all 300,000 RBC are distributed. You can track the current week’s progress and your rewards in the snapshot window on the left side of the page.'
    },
    {
      title: 'Can I use multiple wallets to participate?',
      answer:
        'No, using multiple wallets to farm this event is strictly prohibited. The Rubic team will detect and exclude additional wallets from the claim list, allowing only the original wallet to remain eligible.<br/><br/>If you have any questions or need clarification, feel free to reach out to Rubic Support'
    }
  ];
}
