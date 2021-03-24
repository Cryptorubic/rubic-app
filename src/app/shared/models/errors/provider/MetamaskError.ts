import { RubicError } from '../RubicError';

export class MetamaskError extends RubicError {
  public comment: string = `Please check that you have active Metamask plugin in your browser and Metamask wallet is connected. 

  If not please download it from www.metamask.io and connect wallet using Connect Wallet button.`;
}
