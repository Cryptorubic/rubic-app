//
// Note that each Step/Recipe must assume a clean slate: Since it will
//   get executed in a public setting (the RAILGUN Relay Adapt Contract),
//   developers should assume that the contract does NOT have
//   approval to spend tokens with any token contract.
//
// Each Recipe should approve their tokens fresh for each user.
//

import {
  compareERC20Info,
  createNoActionStepOutput,
  ERC20Contract,
  RecipeERC20Info,
  Step,
  StepInput,
  StepOutputERC20Amount,
  UnvalidatedStepOutput
} from '@railgun-community/cookbook';
import { ContractTransaction } from 'ethers';
import {
  maxBigNumberForTransaction,
  minBigNumber
} from '@railgun-community/cookbook/dist/utils/big-number';

export class ApproveERC20SpenderStep extends Step {
  // Name and description, which appear in the recipe's stepOutputs for clarity.
  // `hasNonDeterministicOutput` is used to validate this step - if it has
  // deterministic outputs, this means that the outputs are guaranteed, no matter
  // if the underlying assets change in price. Examples of non-deterministic
  // Steps include Swaps (with slippage) and Adding/Removing LP
  // (where liquidity rates are based on moving asset prices).
  readonly config = {
    name: 'Approve ERC20 Spender',
    description: 'Approves ERC20 for spender contract.',
    hasNonDeterministicOutput: false
  };

  // Private variables passed into the constructor.
  private readonly spender: string;

  private readonly tokenInfo: RecipeERC20Info;

  private readonly amount: bigint;

  // Note that amount is an optional parameter here. If unset,
  // the Step will assume the maximum for approval. This is because
  // some steps don't have deterministic input amounts
  // (such as after a swap with slippage).
  // For non-deterministic amounts, we'll auto-approve the maximum,
  // so we don't mistakenly underestimate the actual amount.
  constructor(spender: string, tokenInfo: RecipeERC20Info, amount?: bigint) {
    super();
    this.spender = spender;
    this.tokenInfo = tokenInfo;
    this.amount = amount;
  }

  protected async getStepOutput(input: StepInput): Promise<UnvalidatedStepOutput> {
    // If we can't find the spender contract, create a null output with no
    // populatedTransactions.
    if (!this.spender || this.tokenInfo.isBaseToken) {
      return createNoActionStepOutput(input);
    }

    // These are the input parameters, passed into the step.
    const { erc20Amounts } = input;

    // This helper function filters the input erc20 amounts for a token whose address
    // matches tokenInfo (non-case-sensitive), which is not yet approved for spending.
    // It also validates the expected balance of this token from prior Steps,
    // if `this.amount` is provided.
    const { erc20AmountForStep, unusedERC20Amounts } = this.getValidInputERC20Amount(
      erc20Amounts,
      erc20Amount =>
        compareERC20Info(erc20Amount, this.tokenInfo) &&
        erc20Amount.approvedSpender !== this.spender,
      this.amount
    );

    const contract = new ERC20Contract(erc20AmountForStep.tokenAddress);

    // If there's no amount provided, we'll approve the maximum.
    const approveAmount = this.amount ?? maxBigNumberForTransaction();

    // This is the final populated contract call, generated with the ERC20 ABI.
    const crossContractCalls: ContractTransaction[] = [];
    crossContractCalls.push(await contract.createSpenderApproval(this.spender, approveAmount));

    // Convert the selected input erc20 amount into the final spender-approved
    // amount, which will be an output of this Step.
    // In a later Step in a full Recipe, we can call `getValidInputERC20Amount`
    // (like above) to check that this input token is approved.
    const approvedERC20Amount: StepOutputERC20Amount = {
      tokenAddress: erc20AmountForStep.tokenAddress,
      decimals: erc20AmountForStep.decimals,
      isBaseToken: erc20AmountForStep.isBaseToken,
      expectedBalance: minBigNumber(approveAmount, erc20AmountForStep.expectedBalance),
      minBalance: minBigNumber(approveAmount, erc20AmountForStep.minBalance),
      approvedSpender: this.spender
    };

    // Return the approved amount, as well as any unused erc20 amounts.
    // These outputs will get validated against the input amounts for this Step,
    // ensuring that no input tokens are missing in the outputs.
    // If any tokens are "spent" during the Step, you should add them
    // to the spentERC20Amounts array.
    // Any token fees paid during the call should go in feeERC20AmountRecipients,
    // including a string identifier for the recipient.
    return {
      crossContractCalls,
      spentERC20Amounts: [],
      outputERC20Amounts: [approvedERC20Amount, ...unusedERC20Amounts],
      spentNFTs: [],
      outputNFTs: input.nfts,
      feeERC20AmountRecipients: []
    };
  }
}
