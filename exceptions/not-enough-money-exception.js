module.exports = class NotEnoughMoneyException extends Error {
    constructor(message) {
        super(message);
    }
}

