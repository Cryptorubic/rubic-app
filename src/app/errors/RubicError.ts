export class RubicError extends Error {
    public comment: string = 'Please try again later or try using another device. If you’re still having problems, please reach out to our Customer Support.';

    constructor(message?) {
        super(message);
        Object.setPrototypeOf(this, RubicError.prototype);
    }
}
