import {RubicError} from '../RubicError';

export class NetworkError extends RubicError {
    constructor(private networkToChoose: string, message?: string) {
        super(message);
    }
    public comment: string = `
        Please select the network from which you plan to make the transfer in the metamask extension. 
        For this exchange, you need to select a ${this.networkToChoose} Mainnet network.`;
}
