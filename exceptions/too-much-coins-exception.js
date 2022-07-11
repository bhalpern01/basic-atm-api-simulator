module.exports = class TooMuchCoinsException extends Error {
    constructor(message) {
        super(message);
    }
}