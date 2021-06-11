import {
  Component,
  Input,
  OnInit,
  Output,
  ViewChild,
  EventEmitter,
  OnChanges
} from '@angular/core';
import { NgModel } from '@angular/forms';
import BigNumber from 'bignumber.js';
import {
  ORDER_BOOK_TRADE_STATUS,
  OrderBookDataToken,
  OrderBookTradeData
} from '../../../../models/trade-data';
import ADDRESS_TYPE from '../../../../../../shared/models/blockchain/ADDRESS_TYPE';
import { TX_STATUS } from '../../../../models/TX_STATUS';
import { TokenPart } from '../../../../../../shared/models/order-book/tokens';
import { BIG_NUMBER_FORMAT } from '../../../../../../shared/constants/formats/BIG_NUMBER_FORMAT';
import { RubicError } from '../../../../../../shared/models/errors/RubicError';
import { OrderBookTradeService } from '../../../../services/order-book-trade.service';
import { ErrorsOldService } from '../../../../../../core/services/errors-old/errors-old.service';

type Operation = 'approve' | 'contribute' | 'withdraw';

type Statuses = {
  [operation in Operation]: TX_STATUS;
};

@Component({
  selector: 'app-token-form',
  templateUrl: './token-form.component.html',
  styleUrls: ['./token-form.component.scss']
})
export class TokenFormComponent implements OnInit, OnChanges {
  @Input() tradeData: OrderBookTradeData;

  @Input() tokenPart: TokenPart;

  @Input() oppositeTokenToGet: string;

  @Output() amountToContributeChanges = new EventEmitter<string>();

  private readonly BILLION = 1e9;

  private readonly MILLION = 1e6;

  @ViewChild('amountToContributeModel') amountToContributeModel: NgModel;

  public TRADE_STATUS = ORDER_BOOK_TRADE_STATUS;

  public ADDRESS_TYPE = ADDRESS_TYPE;

  public TX_STATUS = TX_STATUS;

  public token: OrderBookDataToken;

  public shortedAmountTotal: string;

  public amountToContribute: string;

  public operationStatus: Statuses = {
    approve: TX_STATUS.NONE,
    contribute: TX_STATUS.NONE,
    withdraw: TX_STATUS.NONE
  };

  public lastCompletedTransactionId: string;

  public isOperationInProgress: boolean;

  public isOperationCompleted: boolean;

  get amountToContributeAsNumber(): BigNumber {
    return new BigNumber(this.amountToContribute?.split(',').join(''));
  }

  constructor(
    private orderBookTradeService: OrderBookTradeService,
    private readonly errorsService: ErrorsOldService
  ) {}

  ngOnInit(): void {
    this.token = this.tradeData.token[this.tokenPart];

    this.setShortedAmountTotal();
    this.setAmountLeft();
  }

  ngOnChanges(): void {
    this.token = this.tradeData.token[this.tokenPart];
    this.token.amountLeft = null;

    if (this.token) {
      this.setAmountLeft();
    }
  }

  private setShortedAmountTotal(): void {
    const amount = this.token.amountTotal;
    let shortedAmount: string;

    if (amount.isGreaterThanOrEqualTo(this.BILLION * 100)) {
      shortedAmount = `${amount.div(this.BILLION).toFormat(0, BIG_NUMBER_FORMAT)}B`;
    } else if (amount.isGreaterThanOrEqualTo(this.MILLION * 100)) {
      shortedAmount = `${amount.div(this.MILLION).dp(0).toFormat(0, BIG_NUMBER_FORMAT)}M`;
    } else {
      shortedAmount = amount.toFormat(BIG_NUMBER_FORMAT);
    }
    this.shortedAmountTotal = shortedAmount;
  }

  private setAmountLeft(): void {
    this.token.amountLeft = this.token.amountTotal.minus(this.token.amountContributed);
  }

  public setAmountToContribute(value: string): void {
    this.amountToContribute = value;
    this.amountToContributeChanges.emit(value);
  }

  public getMinContributionAsString(): string {
    if (
      !this.token.minContribution ||
      this.token.minContribution.isNaN() ||
      this.token.minContribution.isGreaterThan(this.token.amountLeft)
    ) {
      return '';
    }
    return this.token.minContribution.toFormat(BIG_NUMBER_FORMAT);
  }

  private updateAmountToContributeModel(): void {
    this.amountToContributeModel?.control.updateValueAndValidity();
  }

  private setOperationInProgress(operation: Operation): void {
    this.operationStatus[operation] = TX_STATUS.IN_PROGRESS;
    this.isOperationInProgress = true;
    this.isOperationCompleted = false;
  }

  private setOperationCompleted(operation: Operation, transactionId: string): void {
    this.operationStatus[operation] = TX_STATUS.COMPLETED;
    this.isOperationInProgress = false;
    this.isOperationCompleted = true;
    this.lastCompletedTransactionId = transactionId;
  }

  private setOperationError(operation: Operation, err: RubicError): void {
    this.operationStatus[operation] = TX_STATUS.ERROR;
    this.isOperationInProgress = false;
    this.showErrorMessage(err);
  }

  private showErrorMessage(err: RubicError): void {
    this.errorsService.showErrorDialog(err);
  }

  public makeApproveOrContribute(): void {
    if (!this.token.isApproved) {
      this.makeApprove();
    } else {
      this.makeContribute();
    }
  }

  private makeApprove(): void {
    this.operationStatus.approve = TX_STATUS.STARTED;

    this.orderBookTradeService
      .makeApprove(this.tradeData, this.tokenPart, () => {
        this.setOperationInProgress('approve');
      })
      .then(receipt => {
        this.orderBookTradeService.setAllowanceToToken(this.tradeData, this.tokenPart).then(() => {
          this.setOperationCompleted('approve', receipt.transactionHash);
        });
      })
      .catch(err => {
        this.setOperationError('approve', err);
      });
  }

  private makeContribute(): void {
    this.operationStatus.contribute = TX_STATUS.STARTED;

    this.orderBookTradeService
      .checkApproveAndMakeContribute(
        this.tradeData,
        this.tokenPart,
        this.amountToContribute.split(',').join(''),
        () => {
          this.setOperationInProgress('contribute');
        }
      )
      .then(receipt => {
        this.setOperationCompleted('contribute', receipt.transactionHash);
        this.updateAmountToContributeModel();
      })
      .catch(err => {
        this.setOperationError('contribute', err);
      });
  }

  public makeWithdraw(): void {
    this.operationStatus.withdraw = TX_STATUS.STARTED;

    this.orderBookTradeService
      .makeWithdraw(this.tradeData, this.tokenPart, () => {
        this.setOperationInProgress('withdraw');
      })
      .then(receipt => {
        this.setOperationCompleted('withdraw', receipt.transactionHash);
        this.updateAmountToContributeModel();
      })
      .catch(err => {
        this.setOperationError('withdraw', err);
      });
  }
}
