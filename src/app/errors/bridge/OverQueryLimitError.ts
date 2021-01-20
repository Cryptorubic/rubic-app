import {RubicError} from '../RubicError';

export class OverQueryLimitError extends RubicError {
    public comment: string = 'The exchange limit has been exceeded. Please try again later.';
}
