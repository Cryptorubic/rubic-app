import {
  BlockchainName,
  BlockchainsInfo,
  CHAIN_TYPE,
  ChainType,
  TokenAmount
} from '@cryptorubic/core';

export class QrCodeGenerator {
  private static readonly transferQrCodeGenerators: Partial<
    Record<ChainType, (receiverAddr: string, token?: TokenAmount) => Promise<HTMLCanvasElement>>
  > = {
    [CHAIN_TYPE.BITCOIN]: this.generateBitcoinTransferQrCode,
    [CHAIN_TYPE.SOLANA]: this.generateSolanaTransferQrCode,
    [CHAIN_TYPE.EVM]: this.generateEvmTransferQrCode,
    [CHAIN_TYPE.TON]: this.generateTonTransferQrCode
  };

  public static async generateTransferQrCode(
    srcChain: BlockchainName,
    receiverAddr: string,
    token?: TokenAmount
  ): Promise<HTMLCanvasElement> {
    const chainType = BlockchainsInfo.getChainType(srcChain);
    const qrGenerator = this.transferQrCodeGenerators[chainType]
      ? this.transferQrCodeGenerators[chainType]
      : this.generateUnknownChainTransferQrCode;
    const canvas = await qrGenerator.apply(this, [receiverAddr, token]);
    return canvas;
  }

  private static async generateBitcoinTransferQrCode(
    _receiverAddr: string,
    _token?: TokenAmount
  ): Promise<HTMLCanvasElement> {
    return document.createElement('canvas');
  }

  private static async generateSolanaTransferQrCode(
    _receiverAddr: string,
    _token?: TokenAmount
  ): Promise<HTMLCanvasElement> {
    return document.createElement('canvas');
  }

  private static async generateEvmTransferQrCode(
    _receiverAddr: string,
    _token?: TokenAmount
  ): Promise<HTMLCanvasElement> {
    return document.createElement('canvas');
  }

  private static async generateTonTransferQrCode(
    _receiverAddr: string,
    _token?: TokenAmount
  ): Promise<HTMLCanvasElement> {
    return document.createElement('canvas');
  }

  private static async generateUnknownChainTransferQrCode(
    _receiverAddr: string,
    _token?: TokenAmount
  ): Promise<HTMLCanvasElement> {
    return document.createElement('canvas');
  }
}
