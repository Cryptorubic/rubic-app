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
      if (contract.contract_type === 20) {
        this.loadTokensInfo(contract);
      } else {
        contract.contract_details = {...contract};
        contract.contract_type = 21;
        contract.contract_details.swap3 = true;

        this.web3Service.getSWAPSCoinInfo(contract.contract_details).then((trade: any) => {
          const baseToken = contract.contract_details.tokens_info.base.token;
          const quoteToken = contract.contract_details.tokens_info.quote.token;
          contract.contract_details.base_token_info = baseToken;
          contract.contract_details.quote_token_info = quoteToken;
          contract.contract_details.base_token_info.amount =
            new BigNumber(contract.contract_details.base_limit).div(Math.pow(10, baseToken.decimals)).dp(3);
          contract.contract_details.quote_token_info.amount =
            new BigNumber(contract.contract_details.quote_limit).div(Math.pow(10, quoteToken.decimals)).dp(3);
          this.getRates(contract);
        });
      }
    });
  }


  public refreshList() {
    this.contractsService.getPublicContractsList().then((result: IContract[]) => {
      this.contractsCount = 0;
      this.contractsList = result;
      this.loadcoinsInfo(result);
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


  private loadTokensInfo(contract) {
    const contractDetails = contract.contract_details;

    this.web3Service.getFullTokenInfo(contractDetails.base_address).then((tokenInfo: TokenInfoInterface) => {
      contractDetails.base_token_info = tokenInfo;
      contractDetails.base_token_info.amount = new BigNumber(contractDetails.base_limit).div(Math.pow(10, tokenInfo.decimals)).dp(3);
      if (contractDetails.quote_token_info) {
        this.getRates(contract);
      }
    });


    this.web3Service.getFullTokenInfo(contractDetails.quote_address).then((tokenInfo: TokenInfoInterface) => {
      contractDetails.quote_token_info = tokenInfo;
      contractDetails.quote_token_info.amount = new BigNumber(contractDetails.quote_limit).div(Math.pow(10, tokenInfo.decimals)).dp(3);
      if (contractDetails.base_token_info) {
        this.getRates(contract);
      }
    });
  }


  private loadPrivateContractInfo(contractDetails) {

    const contractData = contractDetails.eth_contract;
    const web3Contract = this.web3Service.getContract(contractData.abi, contractData.address);

    web3Contract.methods.baseRaised().call().then((result) => {
      contractDetails.baseProgress =
        new BigNumber(result).div(contractDetails.base_limit).times(100).toNumber();

      if (!isNaN(contractDetails.quoteProgress)) {
        this.finishContractLoad(contractDetails);
      }
    }, err => {
      console.log(err);
    });

    web3Contract.methods.quoteRaised().call().then((result) => {
      contractDetails.quoteProgress =
        new BigNumber(result).div(contractDetails.quote_limit).times(100).toNumber();

      if (!isNaN(contractDetails.baseProgress)) {
        this.finishContractLoad(contractDetails);
      }
    }, err => {
      console.log(err);
    });

  }


  private loadSwapsContractInfo(contractDetails) {
    const web3Contract = this.web3Service.getContract(SWAPS_V2.ABI, SWAPS_V2.ADDRESS);

    web3Contract.methods.baseRaised(contractDetails.memo_contract).call().then((result) => {
      contractDetails.baseProgress =
        new BigNumber(result).div(contractDetails.base_limit).times(100).toNumber();

      if (!isNaN(contractDetails.quoteProgress)) {
        this.finishContractLoad(contractDetails);
      }
    }, err => {
      console.log(err);
    });

    web3Contract.methods.quoteRaised(contractDetails.memo_contract).call().then((result) => {
      contractDetails.quoteProgress =
        new BigNumber(result).div(contractDetails.quote_limit).times(100).toNumber();

      if (!isNaN(contractDetails.baseProgress)) {
        this.finishContractLoad(contractDetails);
      }
    }, err => {
      console.log(err);
    });

  }


  private loadContractInfo(contractDetails, contract) {
    switch (contract.contract_type) {
      case 20:
        contractDetails.isDecentralized = true;
        this.loadPrivateContractInfo(contractDetails);
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

        this.contractsList = this.contractsList.sort((contract1, contract2) => {
          if (this.selectedFilter.asc) {
            return (new BigNumber(contract1.contract_details.base_token_info.amount).minus
              (new BigNumber(contract2.contract_details.base_token_info.amount))).isPositive() ? 1 : -1;
          } else {
            return (new BigNumber(contract2.contract_details.base_token_info.amount).minus
              (new BigNumber(contract1.contract_details.base_token_info.amount))).isPositive() ? 1 : -1;
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
          return contract2.id < contract1.id ? -1 : 1;
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
