import BigNumber from 'bignumber.js';
import {
  ON_CHAIN_PROXY_DISABLED_CHAINS,
  ProxySupportedBlockchain,
  proxySupportedBlockchains
} from '../../../../common/constants/proxy-supported-blockchain';
import { rubicProxyContractAddress } from '../../../../cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from '../../../../cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { OnChainPlatformFee, OnChainProxyFeeInfo } from '../../models/on-chain-proxy-fee-info';
import {
  BlockchainName,
  Cache,
  EvmBlockchainName,
  nativeTokensList,
  PriceTokenAmount,
  Token
} from '@cryptorubic/core';
import { EvmAdapter, Web3Pure } from '@cryptorubic/web3';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';

export class OnChainProxyService {
  constructor(private readonly sdkLegacyService: SdkLegacyService) {}

  public static isSupportedBlockchain(
    blockchain: BlockchainName
  ): blockchain is ProxySupportedBlockchain {
    const isProxySupported = proxySupportedBlockchains.some(
      supportedBlockchain =>
        supportedBlockchain === blockchain &&
        !ON_CHAIN_PROXY_DISABLED_CHAINS.some(chain => chain === blockchain)
    );

    return isProxySupported;
  }

  @Cache({
    maxAge: 15_000
  })
  public async getFeeInfo(
    from: PriceTokenAmount<BlockchainName>,
    providerAddress: string
  ): Promise<OnChainProxyFeeInfo> {
    const fromBlockchain = from.blockchain;
    const evmAdapter = this.sdkLegacyService.adaptersFactoryService.getAdapter(
      from.blockchain as EvmBlockchainName
    );
    const contractAddress = rubicProxyContractAddress[fromBlockchain].router;

    let fixedCryptoFeeWei: string | undefined;
    let platformFeePercent: number;
    let isIntegrator = true;

    if (providerAddress !== Web3Pure.getEmptyTokenAddress(from.blockchain)) {
      const fee = await this.handleIntegratorFee(evmAdapter, contractAddress, providerAddress);
      isIntegrator = fee.isIntegrator;
      fixedCryptoFeeWei = fee.fixedCryptoFeeWei;
      platformFeePercent = fee.platformFeePercent;
    }

    if (fixedCryptoFeeWei === undefined || !isIntegrator) {
      const fee = await this.handleRubicFee(evmAdapter, contractAddress);
      fixedCryptoFeeWei = fee.fixedCryptoFeeWei;
      platformFeePercent = fee.platformFeePercent;
    }

    const fixedFeeToken = await this.sdkLegacyService.tokenService.createPriceTokenAmount(
      {
        ...nativeTokensList[fromBlockchain]
      },
      Token.fromWei(fixedCryptoFeeWei, nativeTokensList[fromBlockchain].decimals)
    );

    const platformFee: OnChainPlatformFee = {
      percent: platformFeePercent!,
      token: await this.sdkLegacyService.tokenService.createPriceTokenAmount(
        {
          ...from
        },
        from.tokenAmount.multipliedBy(platformFeePercent! / 100)
      )
    };

    return {
      fixedFeeToken,
      platformFee
    };
  }

  private async handleIntegratorFee(
    evmAdapter: EvmAdapter,
    contractAddress: string,
    providerAddress: string
  ): Promise<{
    fixedCryptoFeeWei: string | undefined;
    platformFeePercent: number;
    isIntegrator: boolean;
  }> {
    const integratorToFeeInfo = await evmAdapter.callContractMethod<{
      isIntegrator: boolean;
      fixedFeeAmount: string;
      tokenFee: string;
    }>(contractAddress, evmCommonCrossChainAbi, 'integratorToFeeInfo', [providerAddress]);

    return {
      fixedCryptoFeeWei: integratorToFeeInfo.fixedFeeAmount,
      platformFeePercent: parseInt(integratorToFeeInfo.tokenFee) / 10_000,
      isIntegrator: integratorToFeeInfo.isIntegrator
    };
  }

  private async handleRubicFee(
    evmAdapter: EvmAdapter,
    contractAddress: string
  ): Promise<{ fixedCryptoFeeWei: string; platformFeePercent: number }> {
    const feeInfo = await Promise.all([
      evmAdapter.callContractMethod<string>(
        contractAddress,
        evmCommonCrossChainAbi,
        'fixedNativeFee',
        []
      ),
      evmAdapter.callContractMethod<string>(
        contractAddress,
        evmCommonCrossChainAbi,
        'RubicPlatformFee',
        []
      )
    ]);
    return {
      fixedCryptoFeeWei: feeInfo[0],
      platformFeePercent: parseInt(feeInfo[1]) / 10_000
    };
  }
}
