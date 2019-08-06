import {Component, OnInit, ViewChild} from '@angular/core';
import {ContractsService} from '../../services/contracts/contracts.service';
import {TokenInfoInterface, Web3Service} from '../../services/web3/web3.service';

import BigNumber from 'bignumber.js';
import {SWAPS_V2} from '../../contract-form-two/contract-v2-details';
import {HttpClient} from '@angular/common/http';
import {IContract} from '../../contract-form/contract-form.component';

const PAGE_SIZE = 5;

@Component({
  selector: 'app-public-contracts',
  templateUrl: './public-contracts.component.html',
  styleUrls: ['./public-contracts.component.scss']
})

export class PublicContractsComponent implements OnInit {


  public contractsCount: number;
  private serverDateTimeRange: number;

  public contractsList;
  public displayingContractsList;

  public allLoaded: boolean;
  public refreshProgress: boolean;

  private showedPages: number;

  public allFilteredOrdersCount: any;

  public selectedCoins: {
    base?: any;
    quote?: any;
  };

  public selectedFilter: { name: string; asc: boolean };

  constructor(
    private contractsService: ContractsService,
    private web3Service: Web3Service,
    private http: HttpClient
  ) {

    this.contractsCount = 0;
    this.showedPages = 1;

    this.http.get('/assets/images/1x1.png?_t=' + (new Date()).getTime(), {
      responseType: 'text', observe: 'response'
    }).toPromise()
      .then(res => {
        this.serverDateTimeRange = new Date().getTime() - new Date(res.headers.get('Date')).getTime();
      });

    this.selectedFilter = {
      name: '',
      asc: false
    };
    this.contractsService.getPublicContractsList().then((result) => {
      this.contractsList =
        this.displayingContractsList = result;

      this.loadcoinsInfo(this.contractsList);
    });
  }

  private loadcoinsInfo(coinsList) {
    coinsList.forEach((contract) => {
      if (contract.contract_type !== 20) {
        contract.contract_details = {...contract};
        contract.contract_type = 21;
        contract.contract_details.swap3 = true;
      }

      this.web3Service.getSWAPSCoinInfo(contract.contract_details).then((trade: any) => {
        const baseToken = contract.contract_details.tokens_info.base.token;
        const quoteToken = contract.contract_details.tokens_info.quote.token;
        contract.contract_details.base_token_info = baseToken;
        contract.contract_details.quote_token_info = quoteToken;
        contract.contract_details.base_token_info.amount =
          new BigNumber(contract.contract_details.base_limit).div(Math.pow(10, baseToken.decimals)).dp(8);
        contract.contract_details.quote_token_info.amount =
          new BigNumber(contract.contract_details.quote_limit).div(Math.pow(10, quoteToken.decimals)).dp(8);
        this.getRates(contract);
      });
    });
  }


  public refreshList() {
    const startRefreshTime = new Date().getTime();
    this.refreshProgress = true;
    this.contractsService.getPublicContractsList().then((result: IContract[]) => {
      this.contractsCount = 0;
      this.contractsList = result;
      this.loadcoinsInfo(result);

      setTimeout(() => {
        this.refreshProgress = false;
      }, 1000 - (new Date().getTime() - startRefreshTime) % 1000);

    });
  }


  private getRates(contract) {
    const contractDetails = contract.contract_details;
    const baseAmount = contractDetails.base_token_info.amount;
    const quoteAmount = contractDetails.quote_token_info.amount;

    contractDetails.base_token_info.amount = contractDetails.base_token_info.amount.toString();
    contractDetails.quote_token_info.amount = contractDetails.quote_token_info.amount.toString();

    contractDetails.base_token_info.rate = baseAmount.div(quoteAmount).dp(5).toString();
    contractDetails.quote_token_info.rate = quoteAmount.div(baseAmount).dp(5).toString();

    if (contract.state === 'ACTIVE' || contract.state === 'DONE' || contract.state === 'CANCEL') {
      this.loadContractInfo(contractDetails, contract);
    } else {
      this.finishContractLoad(contractDetails);
    }
  }

  private loadSwapsContractInfo(contractDetails) {
    this.finishContractLoad(contractDetails);
  }


  private loadContractInfo(contractDetails, contract) {
    switch (contract.contract_type) {
      case 20:
        contractDetails.isDecentralized = true;
        this.loadSwapsContractInfo(contractDetails);
        break;
      case 21:
        if (contractDetails.base_address && contractDetails.quote_address) {
          this.loadSwapsContractInfo(contractDetails);
          contractDetails.isDecentralized = true;
        } else {
          this.finishContractLoad(contractDetails);
        }
        break;
      default:
        break;

    }
  }


  private finishContractLoad(contract) {
    this.checkExpire(contract);
    this.contractsCount++;

    if (this.contractsCount === this.contractsList.length) {
      this.allLoaded = true;
      setInterval(() => {
        this.contractsList.forEach((contractFromList: any) => {
          this.checkExpire(contractFromList.contract_details);
        });
      }, 3000);

      this.applySort();

    }
  }


  private checkExpire(contractDetails) {
    const leftTime = (new Date(contractDetails.stop_date).getTime() - (new Date().getTime() - this.serverDateTimeRange)) / 1000;

    if (leftTime <= 0) {
      contractDetails.left_times = {
        ts: 0,
        times_parts: [0, 0, 0]
      };
    } else {
      const days = Math.floor(leftTime / 86400);
      const hours = Math.floor((leftTime % 86400) / 3600);
      const minutes = Math.floor((leftTime % 3600) / 60);

      contractDetails.left_times = {
        ts: leftTime,
        times_parts: [days, hours, minutes]
      };
    }

  }

  public applySort(sortName?: any) {

    if (sortName) {
      if (this.selectedFilter.name && this.selectedFilter.asc) {
        sortName = undefined;
      }
      this.selectedFilter = {
        name: sortName,
        asc: this.selectedFilter.name === sortName
      };
    }

    switch (this.selectedFilter.name) {
      case 'volume':
        let sortBy = 'base_token_info';
        if (this.selectedCoins.quote.token && !this.selectedCoins.base.token) {
          sortBy = 'quote_token_info';
        }
        this.contractsList = this.contractsList.sort((contract1, contract2) => {
          if (this.selectedFilter.asc) {
            return (new BigNumber(contract1.contract_details[sortBy].amount).minus
              (new BigNumber(contract2.contract_details[sortBy].amount))).isPositive() ? 1 : -1;
          } else {
            return (new BigNumber(contract2.contract_details[sortBy].amount).minus
              (new BigNumber(contract1.contract_details[sortBy].amount))).isPositive() ? 1 : -1;
          }
        });

        break;
      case 'expired':
        this.contractsList = this.contractsList.sort((contract1, contract2) => {
          if (this.selectedFilter.asc) {
            return (contract1.contract_details.left_times.ts >
              contract2.contract_details.left_times.ts) ? 1 : -1;
          } else {
            return (contract2.contract_details.left_times.ts >
              contract1.contract_details.left_times.ts) ? 1 : -1;
          }
        });
        break;

      default:
        this.contractsList = this.contractsList.sort((contract1, contract2) => {
          return (new Date(contract2.created_date) < new Date(contract1.created_date)) ? -1 : 1;
        });
      }

    this.selectCoin();
  }

  public selectCoin() {
    this.allFilteredOrdersCount = this.contractsList.filter((trade) => {
      const details = trade.contract_details;
      return (!this.selectedCoins.base.token || (this.selectedCoins.base.token.cmc_id === details.base_token_info.cmc_id)) &&
          (!this.selectedCoins.quote.token || (this.selectedCoins.quote.token.cmc_id === details.quote_token_info.cmc_id));
    });

    this.showSelectedPages();
  }

  public revertCoinFilters() {
    const quoteCoin = this.selectedCoins.quote;
    this.selectedCoins.quote = this.selectedCoins.base;
    this.selectedCoins.base = quoteCoin;
    this.selectCoin();
  }


  public showSelectedPages(addOne?: boolean) {
    if (addOne) {
      this.showedPages++;
    }
    this.displayingContractsList = this.allFilteredOrdersCount.slice(0, this.showedPages * PAGE_SIZE);
  }


  ngOnInit() {
    this.selectedCoins = {
      base: {},
      quote: {}
    };
  }

}
