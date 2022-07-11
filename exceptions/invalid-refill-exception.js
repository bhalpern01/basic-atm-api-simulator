module.exports = class InvalidRefillException extends Error {
    constructor(message) {
        super(message)
    }
}