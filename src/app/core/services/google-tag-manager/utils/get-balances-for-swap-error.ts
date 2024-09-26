import {
  BlockchainName,
  Injector,
  nativeTokensList,
  PriceTokenAmount,
  Web3Public,
  Web3Pure
} from 'rubic-sdk';

export async function getBalancesForGtagSwapError(
  fromToken: PriceTokenAmount<BlockchainName>,
  walletAddress: string
): Promise<[string, string]> {
  const web3Public = Injector.web3PublicService.getWeb3Public(fromToken.blockchain) as Web3Public;
  const [nativeBalanceWei, fromTokenBalanceWei] = await Promise.all([
    web3Public.getBalance(walletAddress),
    web3Public.getBalance(walletAddress, fromToken.address)
  ]);

  const nativeToken = nativeTokensList[fromToken.blockchain];
  const nativeBalance = Web3Pure.fromWei(nativeBalanceWei, nativeToken.decimals).toFixed();
  const fromTokenBalance = Web3Pure.fromWei(fromTokenBalanceWei, fromToken.decimals).toFixed();

  return [nativeBalance, fromTokenBalance];
}
