export class RubicError extends Error {
    public comment: string = 'The service is temporarily down. Try later.';

    constructor(message?) {
        super(message);
        Object.setPrototypeOf(this, RubicError.prototype);
    }
}
