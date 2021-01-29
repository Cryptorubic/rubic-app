import {RubicError} from '../RubicError';

export class NetworkError extends RubicError {
    constructor(private networkToChoose: string, message?: string) {
        super(message);
    }
    public comment: string = `
        Please select from MetaMask the Network from which you plan to make the transfer. 
        For this swap, you need to select a ${this.networkToChoose} Mainnet network.`;
}
