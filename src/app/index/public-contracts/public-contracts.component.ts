export interface IContractDetails {
  network?: number;
  base_address?: string;
  quote_address?: string;
  base_limit?: string;
  quote_limit?: string;
  stop_date?: number;
  owner_address?: string;
  public?: boolean | undefined;
  unique_link?: string;
  unique_link_url?: string;
  eth_contract?: any;

  broker_fee: boolean;
  broker_fee_address: string;
  broker_fee_base: number;
  broker_fee_quote: number;

  tokens_info?: {
    base: {
      token: any;
      amount: string;
    };
    quote: {
      token: any;
      amount: string;
    };
  };

  whitelist?: any;
  whitelist_address?: any;
  min_base_wei?: any;
  memo_contract?: any;
  min_quote_wei?: any;
}

export interface IContract {
  isSwapped?: boolean;
  contract_details?: IContractDetails;
  id?: number | undefined;
  contract_type?: number;
  network?: 1;
  state?: string;
  cost?: any;
  name?: string;
  isAuthor?: boolean;
  user?: number;
}

import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ContractsService, InterfacePastSwaps } from '../../services/contracts/contracts.service';
import { Web3Service } from '../../services/web3/web3.service';

import BigNumber from 'bignumber.js';
import { HttpClient } from '@angular/common/http';
import { UserInterface } from '../../services/user/user.interface';
import { UserService } from '../../services/user/user.service';
import { MatDialog, MatDialogRef } from '@angular/material';
import {
  CHAINS_OF_NETWORKS,
  FIX_TIME
} from '../../contracts-preview-v3/contracts-preview-v3.component';

const PAGE_SIZE = 5;

export interface InterfacePastSwapsRequest {
  p?: number;
  base_coin_id?: number;
  quote_coin_id?: number;
  size?: number;
}

@Component({
  selector: 'app-public-contracts',
  templateUrl: './public-contracts.component.html',
  styleUrls: ['./public-contracts.component.scss']
})
export class PublicContractsComponent implements OnInit, OnDestroy {
  private _blockChain: string;
  private allOrdersList: any[];
  @Input() set blockchain(value: string) {
    this._blockChain = value;
    this.setTradesList();
  }
  get() {
    return this._blockChain;
  }

  public displayingBlockchains = CHAINS_OF_NETWORKS;
  constructor(
    private contractsService: ContractsService,
    private web3Service: Web3Service,
    private http: HttpClient,
    private userService: UserService,
    private dialog: MatDialog
  ) {
    this.selectedCoins = {
      base: {},
      quote: {}
    };

    this.currentUser = this.userService.getUserModel();
    this.userService.getCurrentUser().subscribe((userProfile: UserInterface) => {
      this.currentUser = userProfile;
    });

    this.selectedFilter = {
      name: '',
      asc: false
    };

    // Список активных контрактов
    this.serverDateTimeRange = 0;
    this.http
      .get('/assets/images/1x1.png?_t=' + new Date().getTime(), {
        responseType: 'text',
        observe: 'response'
      })
      .toPromise()
      .then(res => {
        this.serverDateTimeRange =
          new Date().getTime() - new Date(res.headers.get('Date')).getTime();
      });

    this.contractsService.getPublicContractsList().then((result: any[]) => {
      this.allOrdersList = result;
      this.setTradesList();
    });

    this.openedTradesTab = 'ACTIVE';
  }

  private filterOrdersByNetwork() {}

  @ViewChild('deleteTradeConfirmation') deleteTradeConfirmation: TemplateRef<any>;
  private deleteTradeConfirmationModal: MatDialogRef<any>;

  private tradeForDeleting: any;

  public contractsCount: number;
  private serverDateTimeRange: number;

  public contractsList;
  public displayingContractsList;

  public allLoaded: boolean;
  public refreshProgress: boolean;

  private showedPages: number;

  public allFilteredOrdersCount: any;

  public currentUser: UserInterface;

  public openedTradesTab: string;

  public selectedCoins: {
    base?: any;
    quote?: any;
  };

  public selectedFilter: { name: string; asc: boolean };

  private activeTradesList: any;

  public pastTradesInfo: InterfacePastSwaps;

  private checkExpireInterval;
  ngOnDestroy(): void {
    clearInterval(this.checkExpireInterval);
  }

  private setTradesList() {
    if (!this.allOrdersList) return;
    this.contractsCount = 0;
    this.showedPages = 1;
    this.allLoaded = false;
    const filteredOrders = this.allOrdersList.filter(order => {
      return order.network === this._blockChain;
    });
    this.contractsList = filteredOrders;
    this.activeTradesList = filteredOrders;
    this.loadCoinsInfo(filteredOrders);
  }

  private loadCoinsInfo(coinsList) {
    coinsList.forEach(contract => {
      if (contract.contract_type !== 20) {
        contract.contract_details = { ...contract };
        contract.contract_type = 21;
        contract.contract_details.swap3 = true;
      }

      contract.contract_details.base_filled = '0';
      contract.contract_details.quote_filled = '0';
      contract.contract_details.network = contract.network;

      this.web3Service.getSWAPSCoinInfo(contract.contract_details).then((trade: any) => {
        const baseToken = contract.contract_details.tokens_info.base.token;
        const quoteToken = contract.contract_details.tokens_info.quote.token;

        if (
          contract.contract_details.swap3 &&
          new Date(contract.created_date).getTime() > FIX_TIME
        ) {
          contract.contract_details.quote_limit = new BigNumber(
            contract.contract_details.quote_limit
          ).times(Math.pow(10, quoteToken.decimals));
          contract.contract_details.base_limit = new BigNumber(
            contract.contract_details.base_limit
          ).times(Math.pow(10, baseToken.decimals));
        }

        contract.contract_details.base_filled = contract.contract_details.base_amount_contributed
          ? new BigNumber(contract.contract_details.base_amount_contributed)
              .div(contract.contract_details.base_limit)
              .times(100)
              .dp(0)
              .toString()
          : '0';

        contract.contract_details.quote_filled = contract.contract_details.quote_amount_contributed
          ? new BigNumber(contract.contract_details.quote_amount_contributed)
              .div(contract.contract_details.quote_limit)
              .times(100)
              .dp(0)
              .toString()
          : '0';

        contract.contract_details.base_token_info = baseToken;
        contract.contract_details.quote_token_info = quoteToken;

        contract.contract_details.base_token_info.amount = new BigNumber(
          contract.contract_details.base_limit
        )
          .div(Math.pow(10, baseToken.decimals))
          .dp(8);
        contract.contract_details.quote_token_info.amount = new BigNumber(
          contract.contract_details.quote_limit
        )
          .div(Math.pow(10, quoteToken.decimals))
          .dp(8);

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
      this.loadCoinsInfo(result);

      setTimeout(() => {
        this.refreshProgress = false;
      }, 1000 - ((new Date().getTime() - startRefreshTime) % 1000));
    });
  }

  private getRates(contract) {
    const contractDetails = contract.contract_details;
    const baseToken = contractDetails.base_token_info;
    const quoteToken = contractDetails.quote_token_info;

    const baseAmount = contractDetails.base_token_info.amount;
    const quoteAmount = contractDetails.quote_token_info.amount;

    baseToken.amount = baseToken.amount.toString();
    quoteToken.amount = quoteToken.amount.toString();
    baseToken.rate = baseAmount.div(quoteAmount).dp(5).toNumber();
    quoteToken.rate = quoteAmount.div(baseAmount).dp(5).toNumber();

    this.checkDecentralized(contract);
  }

  private checkDecentralized(contract) {
    switch (contract.contract_type) {
      case 20:
        contract.contract_details.isDecentralized = true;
        break;
      case 21:
        contract.contract_details.isDecentralized =
          contract.contract_details.base_address && contract.contract_details.quote_address;
        break;
      default:
        break;
    }
    this.finishContractLoad(contract.contract_details);
  }

  private finishContractLoad(contract) {
    this.checkExpire(contract);
    this.contractsCount++;

    switch (this.openedTradesTab) {
      case 'ACTIVE':
        if (this.contractsCount === this.contractsList.length) {
          if (this.openedTradesTab === 'ACTIVE') {
            this.allLoaded = true;
            this.checkExpireInterval = setInterval(() => {
              this.contractsList.forEach((contractFromList: any) => {
                this.checkExpire(contractFromList.contract_details);
              });
            }, 3000);
            this.applySort();
          }
        }
        break;

      case 'PAST':
        if (this.pastTradesInfo.page > 1) {
          if (this.contractsCount === this.pastTradesInfo.list.length) {
            this.pastTradesInfo.inProgress = false;
            this.displayingContractsList = this.allFilteredOrdersCount = this.contractsList = this.pastTradesInfo.list;
          }
        } else if (this.contractsCount === this.contractsList.length) {
          this.pastTradesInfo.inProgress = false;
          this.allLoaded = true;
        }
        break;
    }
  }

  private checkExpire(contractDetails) {
    const leftTime =
      (new Date(contractDetails.stop_date).getTime() -
        (new Date().getTime() - this.serverDateTimeRange)) /
      1000;

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
            return new BigNumber(contract1.contract_details[sortBy].amount)
              .minus(new BigNumber(contract2.contract_details[sortBy].amount))
              .isPositive()
              ? 1
              : -1;
          } else {
            return new BigNumber(contract2.contract_details[sortBy].amount)
              .minus(new BigNumber(contract1.contract_details[sortBy].amount))
              .isPositive()
              ? 1
              : -1;
          }
        });
        break;

      case 'expired':
        this.contractsList = this.contractsList.sort((contract1, contract2) => {
          if (this.selectedFilter.asc) {
            return contract1.contract_details.left_times.ts >
              contract2.contract_details.left_times.ts
              ? 1
              : -1;
          } else {
            return contract2.contract_details.left_times.ts >
              contract1.contract_details.left_times.ts
              ? 1
              : -1;
          }
        });
        break;

      default:
        this.contractsList = this.contractsList.sort((contract1, contract2) => {
          return new Date(contract2.created_date) < new Date(contract1.created_date) ? -1 : 1;
        });
    }
    this.selectCoin();
  }

  public scrollTop() {
    const scrollStep = -window.scrollY / (500 / 15);

    const scrollInterval = setInterval(() => {
      if (window.scrollY !== 0) {
        window.scrollBy(0, scrollStep);
      } else {
        clearInterval(scrollInterval);
      }
    }, 15);
  }

  public selectCoin() {
    switch (this.openedTradesTab) {
      case 'ACTIVE':
        this.allFilteredOrdersCount = this.contractsList.filter(trade => {
          const details = trade.contract_details;
          return (
            (!this.selectedCoins.base.token ||
              (this.selectedCoins.base.token.platform === details.base_token_info.platform &&
                this.selectedCoins.base.token.address === details.base_token_info.address)) &&
            (!this.selectedCoins.quote.token ||
              (this.selectedCoins.quote.token.platform === details.quote_token_info.platform &&
                this.selectedCoins.quote.token.address === details.quote_token_info.address))
          );
        });
        this.showSelectedPages();
        break;
      case 'PAST':
        // this.loadPastTrades();
        break;
    }
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
    this.displayingContractsList = this.allFilteredOrdersCount.slice(
      0,
      this.showedPages * PAGE_SIZE
    );
  }

  ngOnInit() {}

  public showPostSelectedPages() {
    // this.loadPastTrades(true);
  }

  // private loadPastTrades(nextPage?) {
  //   if (this.pastTradesInfo) {
  //     this.pastTradesInfo.page = !nextPage ? 1 : (this.pastTradesInfo.page + 1);
  //   }
  //
  //   if (!nextPage) {
  //     this.allLoaded = false;
  //     this.contractsCount = 0;
  //   } else {
  //     this.pastTradesInfo.inProgress = true;
  //   }
  //
  //   const requestData = {
  //     p: this.pastTradesInfo ? this.pastTradesInfo.page : 1
  //   } as InterfacePastSwapsRequest;
  //
  //   if (this.selectedCoins.base.token) {
  //     requestData.base_coin_id = this.selectedCoins.base.token.mywish_id;
  //   }
  //   if (this.selectedCoins.quote.token) {
  //     requestData.quote_coin_id = this.selectedCoins.quote.token.mywish_id;
  //   }
  //
  //   this.contractsService.getPastTrades(requestData).then((result) => {
  //     if (nextPage) {
  //       this.pastTradesInfo.page++;
  //       this.loadCoinsInfo(result.list);
  //       this.pastTradesInfo.list = this.pastTradesInfo.list.concat(result.list);
  //     } else {
  //       this.pastTradesInfo = result;
  //       this.pastTradesInfo.page = 1;
  //       this.setTradesList(this.pastTradesInfo.list);
  //       this.displayingContractsList = this.pastTradesInfo.list;
  //     }
  //   });
  // }
  //
  //
  // public openPastTrades() {
  //   this.contractsList = [];
  //   this.allLoaded = false;
  //   if (this.openedTradesTab === 'PAST') {
  //     return;
  //   }
  //   this.openedTradesTab = 'PAST';
  //   this.loadPastTrades();
  // }

  // Deleting
  public deleteTrade(trade) {
    this.tradeForDeleting = trade;
    this.deleteTradeConfirmationModal = this.dialog.open(this.deleteTradeConfirmation, {
      width: '480px',
      panelClass: 'custom-dialog-container'
    });
  }
  public confirmDeleteTrade() {
    this.contractsService.deleteTradeFromManager(this.tradeForDeleting).then(() => {
      this.refreshList();
      this.deleteTradeConfirmationModal.close();
    });
  }
}
