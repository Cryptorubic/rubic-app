import { ContractParams } from '../../../../../../common/models/contract-params';

export interface TronContractParams extends ContractParams {
    feeLimit: number;
}
