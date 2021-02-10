import {RubicError} from '../RubicError';

export class OverQueryLimitError extends RubicError {
    public comment: string = 'You have attempted to execute too many trades in a short period of time. Please wait and try again later, if you still have problems please reach out to our Customer Support.';
}
