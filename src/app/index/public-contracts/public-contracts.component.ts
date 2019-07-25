import {Component, OnInit, ViewChild} from '@angular/core';
import {ContractsService} from '../../services/contracts/contracts.service';
import {TokenInfoInterface, Web3Service} from '../../services/web3/web3.service';

import BigNumber from 'bignumber.js';
import {SWAPS_V2} from '../../contract-form-two/contract-v2-details';

@Component({
  selector: 'app-public-contracts',
  templateUrl: './public-contracts.component.html',
  styleUrls: ['./public-contracts.component.scss']
})
export class PublicContractsComponent implements OnInit {


  public contractsCount: number;

  constructor(
    private contractsService: ContractsService,
    private web3Service: Web3Service
  ) {
    this.contractsCount = 0;
    this.contractsService.getPublicContractsList().then((result) => {
      this.contractsList = result;
      this.contractsList.forEach((contract) => {
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
    });
  }


  public contractsList;


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
      this.contractsCount++;
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
        this.contractsCount++;
      }
    }, err => {
      console.log(err);
    });

    web3Contract.methods.quoteRaised().call().then((result) => {
      contractDetails.quoteProgress =
        new BigNumber(result).div(contractDetails.quote_limit).times(100).toNumber();

      if (!isNaN(contractDetails.baseProgress)) {
        this.contractsCount++;
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
        this.contractsCount++;
      }
    }, err => {
      console.log(err);
    });

    web3Contract.methods.quoteRaised(contractDetails.memo_contract).call().then((result) => {
      contractDetails.quoteProgress =
        new BigNumber(result).div(contractDetails.quote_limit).times(100).toNumber();

      if (!isNaN(contractDetails.baseProgress)) {
        this.contractsCount++;
      }
    }, err => {
      console.log(err);
    });

  }

  private loadContractInfo(contractDetails, contract) {
    switch (contract.contract_type) {
      case 20:

        this.loadPrivateContractInfo(contractDetails);
        break;
      case 21:

        if (contractDetails.base_address && contractDetails.quote_address) {
          this.loadSwapsContractInfo(contractDetails);
        } else {
          this.contractsCount++;
        }
        break;
      default:
        break;

    }
  }



  ngOnInit() {
  }

}
