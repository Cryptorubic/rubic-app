import {
  compareERC20Info,
  isApprovedForSpender,
  RecipeERC20AmountRecipient,
  RecipeERC20Info,
  Step,
  StepConfig,
  StepInput,
  StepOutputERC20Amount,
  SwapQuoteData,
  UnvalidatedStepOutput
} from '@railgun-community/cookbook';

export class ZeroXSwapStep extends Step {
  readonly config: StepConfig = {
    name: '0x Exchange Swap',
    description: 'Swaps two ERC20 tokens using 0x Exchange DEX Aggregator.',
    hasNonDeterministicOutput: true
  };

  private readonly quote: SwapQuoteData;

  private readonly sellERC20Info: RecipeERC20Info;

  constructor(quote: SwapQuoteData, sellERC20Info: RecipeERC20Info) {
    super();
    this.quote = quote;
    this.sellERC20Info = sellERC20Info;
  }

  protected async getStepOutput(input: StepInput): Promise<UnvalidatedStepOutput> {
    const { buyERC20Amount, minimumBuyAmount, crossContractCall, sellTokenValue, spender } =
      this.quote;
    const { erc20Amounts } = input;

    const sellERC20Amount = BigInt(sellTokenValue);
    const { erc20AmountForStep, unusedERC20Amounts } = this.getValidInputERC20Amount(
      erc20Amounts,
      erc20Amount =>
        compareERC20Info(erc20Amount, this.sellERC20Info) &&
        isApprovedForSpender(erc20Amount, spender),
      sellERC20Amount
    );

    const sellERC20AmountRecipient: RecipeERC20AmountRecipient = {
      ...this.sellERC20Info,
      amount: erc20AmountForStep.expectedBalance,
      recipient: '0x Exchange'
    };
    const outputBuyERC20Amount: StepOutputERC20Amount = {
      tokenAddress: buyERC20Amount.tokenAddress,
      decimals: buyERC20Amount.decimals,
      isBaseToken: buyERC20Amount.isBaseToken,
      expectedBalance: buyERC20Amount.amount,
      minBalance: minimumBuyAmount,
      approvedSpender: undefined
    };

    return {
      crossContractCalls: [crossContractCall],
      spentERC20Amounts: [sellERC20AmountRecipient],
      outputERC20Amounts: [outputBuyERC20Amount, ...unusedERC20Amounts],
      outputNFTs: input.nfts
    };
  }
}
