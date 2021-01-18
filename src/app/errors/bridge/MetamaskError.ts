import {RubicError} from '../RubicError';

export class MetamaskError extends RubicError {
    public comment: string = 'To complete the operation, install and activate the Metamask extension';
}
