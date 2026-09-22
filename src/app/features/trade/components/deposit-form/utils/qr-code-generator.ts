import {
  blockchainId,
  BlockchainName,
  BlockchainsInfo,
  CHAIN_TYPE,
  TokenAmount
} from '@cryptorubic/core';
import QRCode from 'qrcode';
import { ChainSupportingAmountQR, chainTypeSupportsQrWithAmount } from './qr-supports';

interface OptionalParams {
  token: TokenAmount;
  size: number;
  qrContent: 'receiver' | 'receiver+amount';
}

export class QrCodeGenerator {
  private static readonly transferQrCodeGenerators: Record<
    ChainSupportingAmountQR,
    (targetWalletAddr: string, params: OptionalParams) => Promise<HTMLCanvasElement>
  > = {
    [CHAIN_TYPE.BITCOIN]: this.generateBitcoinTransferQrCode,
    [CHAIN_TYPE.SOLANA]: this.generateSolanaTransferQrCode,
    [CHAIN_TYPE.EVM]: this.generateEvmTransferQrCode,
    [CHAIN_TYPE.TON]: this.generateTonTransferQrCode
  };

  public static async generateTransferQrCode(
    srcChain: BlockchainName,
    targetWalletAddr: string,
    params: OptionalParams
  ): Promise<HTMLCanvasElement> {
    const chainType = BlockchainsInfo.getChainType(srcChain);
    const qrGenerator = chainTypeSupportsQrWithAmount(chainType)
      ? this.transferQrCodeGenerators[chainType]
      : this.generateUnknownChainTransferQrCode;
    const canvas = await qrGenerator.apply(this, [targetWalletAddr, params]);
    return canvas;
  }

  private static async generateBitcoinTransferQrCode(
    targetWalletAddr: string,
    params: OptionalParams
  ): Promise<HTMLCanvasElement> {
    let qrLink = '';
    switch (params.qrContent) {
      case 'receiver+amount':
        const amountParam = params.token.tokenAmount.toFixed();
        qrLink = `bitcoin:${targetWalletAddr}?amount=${amountParam}`;
        break;
      case 'receiver':
        qrLink = targetWalletAddr;
        break;
    }

    return new Promise((res, rej) => {
      QRCode.toCanvas(qrLink, { errorCorrectionLevel: 'M', width: params.size }, (err, canvas) => {
        if (err) {
          rej(err);
        } else {
          res(canvas);
        }
      });
    });
  }

  private static async generateSolanaTransferQrCode(
    targetWalletAddr: string,
    params: OptionalParams
  ): Promise<HTMLCanvasElement> {
    let qrLink = '';
    switch (params.qrContent) {
      case 'receiver+amount':
        const amountParam = params.token.tokenAmount.toFixed();
        if (params.token.isNative) {
          qrLink = `solana:${targetWalletAddr}?amount=${amountParam}`;
        } else {
          qrLink = `solana:${targetWalletAddr}?amount=${amountParam}&spl-token=${params.token.address}`;
        }
        break;
      case 'receiver':
        qrLink = targetWalletAddr;
        break;
    }

    return new Promise((res, rej) => {
      QRCode.toCanvas(qrLink, { errorCorrectionLevel: 'M', width: params.size }, (err, canvas) => {
        if (err) {
          rej(err);
        } else {
          res(canvas);
        }
      });
    });
  }

  private static async generateEvmTransferQrCode(
    targetWalletAddr: string,
    params: OptionalParams
  ): Promise<HTMLCanvasElement> {
    let qrLink = '';
    switch (params.qrContent) {
      case 'receiver+amount':
        const amountParam = params.token.tokenAmount.toFixed();
        const chainId = blockchainId[params.token.blockchain];
        if (params.token.isNative) {
          qrLink = `ethereum:${targetWalletAddr}@${chainId}?amount=${amountParam}`;
        } else {
          qrLink = `ethereum:${params.token.address}@${chainId}?address=${targetWalletAddr}&amount=${amountParam}`;
        }
        break;
      case 'receiver':
        qrLink = targetWalletAddr;
        break;
    }

    return new Promise((res, rej) => {
      QRCode.toCanvas(qrLink, { errorCorrectionLevel: 'M', width: params.size }, (err, canvas) => {
        if (err) {
          rej(err);
        } else {
          res(canvas);
        }
      });
    });
  }

  private static async generateTonTransferQrCode(
    targetWalletAddr: string,
    params: OptionalParams
  ): Promise<HTMLCanvasElement> {
    let qrLink = '';
    switch (params.qrContent) {
      case 'receiver+amount':
        const amountParam = params.token.stringWeiAmount;
        if (params.token.isNative) {
          qrLink = `ton://transfer/${targetWalletAddr}?&amount=${amountParam}`;
        } else {
          qrLink = `ton://transfer/${targetWalletAddr}?jetton=${params.token.address}&amount=${amountParam}`;
        }
        break;
      case 'receiver':
        if (params.token.isNative) {
          qrLink = `ton://transfer/${targetWalletAddr}`;
        } else {
          qrLink = `ton://transfer/${targetWalletAddr}?jetton=${params.token.address}`;
        }
        break;
    }

    return new Promise((res, rej) => {
      QRCode.toCanvas(qrLink, { errorCorrectionLevel: 'M', width: params.size }, (err, canvas) => {
        if (err) {
          rej(err);
        } else {
          res(canvas);
        }
      });
    });
  }

  private static async generateUnknownChainTransferQrCode(
    targetWalletAddr: string,
    params: OptionalParams
  ): Promise<HTMLCanvasElement> {
    if (params.qrContent !== 'receiver') {
      throw new Error(
        '[QrCodeGenerator_generateUnknownChainTransferQrCode] Unsupported qrContent.'
      );
    }
    return new Promise((res, rej) => {
      QRCode.toCanvas(
        targetWalletAddr,
        { errorCorrectionLevel: 'M', width: params.size },
        (err, canvas) => {
          if (err) {
            rej(err);
          } else {
            res(canvas);
          }
        }
      );
    });
  }
}
