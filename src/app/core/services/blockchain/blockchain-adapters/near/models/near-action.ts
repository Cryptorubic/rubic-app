import { Enum } from 'near-api-js/lib/utils/enums';
import {
  AddKey,
  CreateAccount,
  DeleteAccount,
  DeleteKey,
  DeployContract,
  FunctionCall,
  Stake,
  Transfer
} from 'near-api-js/lib/transaction';

export class Action extends Enum {
  createAccount: CreateAccount;

  deployContract: DeployContract;

  functionCall: FunctionCall;

  transfer: Transfer;

  stake: Stake;

  addKey: AddKey;

  deleteKey: DeleteKey;

  deleteAccount: DeleteAccount;
}
