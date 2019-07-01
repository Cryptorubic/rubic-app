import { Component, OnInit } from '@angular/core';

export interface IPerson {
  name: string;
  position: string;
  biography?: string;
  avatarPath: string;
  linkedInUrl?: string;
  gitHubUrl?: string;
}

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {
  public team: Array<IPerson>;
  public advisers: Array<IPerson>;

  constructor() {}

  public ngOnInit(): void {
    this.team = [
      {
        name: 'Vladimir Tikhomirov',
        position: 'CEO, founder',
        biography: `Crypto enthusiast and serial entrepreneur, Vladimir has over
        11 years of experience leading IT businesses. Former Product
        Manager in Motorola Solutions (for 7 years). Vladimir is a founder of DDG -
        software development center with 50 employees. Ph.D in Computer Science,
        founder - MyWish Platform - the leading Platform for Smart Contract
        generation supported by TRON, EOS Community, NEO, Waves and Binance.`,
        avatarPath: '../../assets/images/team/person-1.png',
        linkedInUrl: 'https://www.linkedin.com/in/vtikhomirov/'
      },
      {
        name: 'Alexandra Korneva',
        biography: `Co-founder at Hapax.tech, co-founder at Pencil Group. More than 6 years
        of experience in PR, marketing and media. Worked with Cointelegraph,
        Blockchain Life, BlockShow, CryptoFriends and etc.`,
        position: 'Partner / PR and Marketing',
        avatarPath: '../../assets/images/team/person-4.png',
        linkedInUrl: 'https://ru.linkedin.com/'
      },
      {
        name: 'Veronika Trunina',
        position: 'Business Development',
        biography: `Crypto junkies, having passion to connect people
        and businesses with more than 10 years leading in IT.
        Former Software Development Director in EPAM (3 years)`,
        avatarPath: '../../assets/images/team/person-17.png',
        linkedInUrl: 'https://www.linkedin.com/in/veronika-trunina-6b567027/'
      },
      {
        name: 'Dmitriy Kovalev',
        position: 'Senior Frontend Developer',
        biography: `Programming experience for more than 6 years.
        Frontend Developer for Blockchain for 1.5 years.
        Languages: JS, TS (CSS, HTML)`,
        avatarPath: '../../assets/images/team/person-13.png',
        linkedInUrl: 'https://www.linkedin.com/in/dmitriy-kovalev-b1743086/',
        gitHubUrl: 'https://github.com/dimanok87'
      },
      {
        name: 'Max Strenk',
        position: 'Backend Developer',
        biography: `Languages - Python, Solidity, JavaScript. Programming experience over
        five years Experience with blockchains 2 years Prior to the
        blockchain, was engaged in infrastructure and administration of Linux`,
        avatarPath: '../../assets/images/team/person-3.png',
        linkedInUrl: 'https://www.linkedin.com/in/maksim-strenk-a93877177',
        gitHubUrl: 'https://github.com/ephdtrg '
      },
      {
        name: 'Mikhail Rozdin',
        position: 'Java Backend Developer',
        biography: `Programming experiance more than 2 years.
        Languages: Java, PostgreSQL, maven, JUnit, git, TravicCi, JaCoCo`,
        avatarPath: '../../assets/images/team/person-5.jpg',
        gitHubUrl: 'https://github.com/mishan74'
      },
      {
        name: 'Evgeny Gazetdinov',
        position: 'Python Backend Developer',
        biography: `Programming experience  more than 3 years.
        Languages: Python, C, Django/Flask, OOP practices.`,
        avatarPath: '../../assets/images/team/person-19.jpg',
        gitHubUrl: 'https://github.com/evgeshakrasava'
      },
      {
        name: 'Nikolay Toporkov',
        position: 'Solidity developer',
        biography: `A young and perspective developer with 2 years of experience.
        He participates actively in the development of the MyWish Crowdsale contracts and the Joule system.
        Languages: Solidity, JavaScript, Java. C++`,
        avatarPath: '../../assets/images/team/person-14.png',
        linkedInUrl: 'https://www.linkedin.com/in/nikolay-toporkov-a1119415a/',
        gitHubUrl: 'https://github.com/kolya-t'
      },
      {
        name: 'Daniil Dubrava',
        position: 'Frontend Developer',
        biography: `JS, TS, Angular, Vue.js. Programming experience over 2 years.
        Frontend for MyWish, Rock’n’Block, Swaps.Network`,
        avatarPath: '../../assets/images/team/person-18.jpg',
        gitHubUrl: 'https://github.com/ddubrava '
      },
      {
        name: 'Alexander Boyarshenchok',
        position: 'Designer',
        biography: `Web, UI/UX and Identity designer with over 10 years
        of work experience. I specialize on User Interface web and Mobile Applications (IOS | Android).`,
        avatarPath: '../../assets/images/team/person-6.jpg',
      },
      {
        name: 'Olga Kulakova',
        biography: `Social networks adept and content creator for IT and crypto projects.
        4 years eхperience in the organization of SMM-procedures and community management`,
        position: 'SMM',
        avatarPath: '../../assets/images/team/person-7.png',
        linkedInUrl: 'https://www.linkedin.com/in/kulakovaolga/'
      },
      {
        name: 'Alexander Volkov',
        biography: `Graduate of the Saratov State University, more than 4 years in testing
        mobile, client-server and  blockchain-based projects`,
        position: 'QA lead',
        avatarPath: '../../assets/images/team/person-12.png'
      }
    ];

    this.advisers = [
      {
        name: 'Eric Benz',
        position: 'CEO of Changelly',
        biography: `Eric has over 10 years of experience working in and around
        Financial Technology. He has delivered innovative
        SaaS systems for some of today's biggest institutions
        around payments, identity, and banking infrastructure. Eric has been
        in the Blockchain space since 2012 and is involved in a number
        of blockchain and fintech businesses both as an investor,
        board director, and founder.`,
        avatarPath: '../../assets/images/team/person-10.png',
        linkedInUrl: 'https://www.linkedin.com/in/ericbenz84/'
      },
      {
        name: 'Peter Lin',
        position: 'Former Director of R&D NEO',
        biography: `Former Director of R&D, NEO Global Development (NGD),
        one of the early NEO developers.
        He has 8 years of experience in internet technology development and 6
        years of experience in blockchain industry,
        engaged in the development of consortium chain and public chain.`,
        avatarPath: '../../assets/images/team/person-16.jpg',
        linkedInUrl: 'https://www.linkedin.com/in/pengtao-lin-453653b4/'
      },
      {
        name: 'Pavel Shterlyaev',
        position: 'Founder BestRate.org',
        biography: `M.Sc. Lappeenranta University of Technology, IT Worked
        in a number of IT companies in different roles: Huawei,
        Veeam Software, eKassir, Cloudberry Lab, SemRush
        for 12 years. Started the path as developer and engineer
        to product owner. Made technical sales on EMEA and other markets.
        Has been company representative in many conferences as a speaker
        in English and Spanish. Participated in Yandex.
        Start and remote IIDF fund accelerator.`,
        avatarPath: '../../assets/images/team/person-8.png',
        linkedInUrl: 'https://www.linkedin.com/in/pavelshter/'
      },
      {
        name: 'Hugo Hellebuyck',
        position: 'Partner VP sales at Tangem',
        biography: `Graduate of the Webster University 2008 Chief Investment Officer for a Singaporean VC.
        The founder of the investment company LILY S.E.A.
        Consultant for renewable energy projects in
        emerging countries, Agri-tech and Blockchain Startups.`,
        avatarPath: '../../assets/images/team/person-9.png',
        linkedInUrl: 'https://www.linkedin.com/in/hugo-hellebuyck'
      },
      {
        name: 'Dmitry Machikhin',
        position: 'Head GMTLegal',
        biography: `Crowdfunding Lawyer. Lawyer of Cointelegraph. Experience in business and law 10 years.`,
        avatarPath: '../../assets/images/team/person-11.png',
        linkedInUrl: 'https://www.linkedin.com/in/dmitry-machikhin-56282a77/'
      },
      {
        name: 'Marco Poliquin',
        position: 'Blockchain Futurist',
        biography: `15 years of Web Development UI/UX, Machine Learning.
        First became interested in cryptocurrency in ​2013​. True believer
        in decentralization and trustless protocols to empower individual
        freedoms and future society structures. 2017 - ​Advisor and Marketing
        Director for International Blockchain projects. 2018 - Co-organized
        Blockchain conferences, network events and infamous
        After-Parties for global influencers. ​2019 ​- Healthtech, DEX OTC,
        Education and Protocols adoption.`,
        avatarPath: '../../assets/images/team/person-15.png',
        linkedInUrl: 'https://www.linkedin.com/in/marco-pharaoh'
      }
    ];
  }

}
