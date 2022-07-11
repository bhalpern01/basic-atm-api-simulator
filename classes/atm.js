const InvalidRefillException = require('../exceptions/invalid-refill-exception');
const NotEnoughMoneyException = require('../exceptions/not-enough-money-exception');
const TooMuchCoinsException = require('../exceptions/too-much-coins-exception');
const Denomination = require('./denomination');

class Atm {

    constructor() {

        this.maximumWithdrawal = 2000;
        this.maxCoinsInWithdrawal = 50;

        this.currencyTypes = {
            BILL: "bill",
            COIN: "coin"
        }

        this.initInventory();
    }

    initInventory() {
        const initDenominations = [
            new Denomination(200, this.currencyTypes.BILL, 7),
            new Denomination(100, this.currencyTypes.BILL, 4),
            new Denomination(20, this.currencyTypes.BILL, 15),
            new Denomination(10, this.currencyTypes.COIN, 10),
            new Denomination(5, this.currencyTypes.COIN, 1),
            new Denomination(1, this.currencyTypes.COIN, 10),
            new Denomination(0.1, this.currencyTypes.COIN, 12),
            new Denomination(0.01, this.currencyTypes.COIN, 21)
        ]

        // force the array to be sorted in descending order.
        this.inventory = initDenominations.sort((a, b) => {
            return a.getValue() > b.getValue();
        })
    }

    getDenominations() {
        return this.inventory.map(denomination => denomination.getValue());
    }

    getMaxmimumWithdrawal() {
        return this.maximumWithdrawal;
    }

    withdraw(amountRequested) {

        // check bills before coins
        const estimatedBills = this.calculateByDenominationType(amountRequested, this.currencyTypes.BILL);
        const estimatedCoins = this.calculateByDenominationType(estimatedBills.remaining, this.currencyTypes.COIN);

        const result = {
            bills: estimatedBills.currencyMap,
            coins: estimatedCoins.currencyMap
        }

        // say you need 188.30, but there aren't enough coins to make the "0.30" even though there's 4000 in the ATM
        // this also should work when you need 200 but there's only 180 in the ATM (not enough money)
        if (estimatedCoins.remaining > 0) {
            throw new NotEnoughMoneyException(`There is not enough money to complete this withdrawal. Requested: ${JSON.stringify(result)} Amount left over: ${estimatedCoins.remaining}`);
        }

        // validate coins (can't issue more than 50 coins)
        const numTotalCoins = Object.keys(estimatedCoins.currencyMap).reduce((sumCoins, coinType) => {
            return sumCoins += estimatedCoins.currencyMap[coinType];
        }, 0)
        if (numTotalCoins > this.maxCoinsInWithdrawal) {
            throw new TooMuchCoinsException(`This ATM cannot dispense more than ${this.maxCoinsInWithdrawal} coins in a single withdrawal. Required coins: ${numTotalCoins}`);
        }

        // only dispense money from the ATM after the above validation is complete
        this.dispenseMoney(result);
        return result;
    }

    /**
     * Generic approach to handle coins and bills in the same method
     * 
     * @param amount 
     * @param currencyType 
     */
    calculateByDenominationType(amount, type) {

        const currencyMap = this.inventory.reduce((accumulator, denomination) => {

            if (denomination.getType() !== type) {
                return accumulator;
            }
            const howManyShouldGet = Math.floor(amount / denomination.getValue());

            // not enough money in this denomination?
            if (howManyShouldGet >= denomination.getInventory()) {
                amount = amount - (denomination.getValue() * denomination.getInventory());
                return { ...accumulator, [denomination.getName()]: denomination.getInventory() }
            } else {
                amount = amount - (denomination.getValue() * howManyShouldGet);
                return { ...accumulator, [denomination.getName()]: howManyShouldGet };
            }

        }, {});

        return {
            currencyMap: currencyMap,
            remaining: Math.floor(amount * 100) / 100 // prevent rounding errors, always have two decimal places.
        };
    }

    /**
     * Accepts a "result" object as proof that the transaction completed successfully except for this step
     * @param result 
     */
    dispenseMoney(result) {
        const money = { ...result.bills, ...result.coins };
        for (let inv_idx = 0; inv_idx < this.inventory.length; inv_idx++) {
            this.inventory[inv_idx].dispense(money[this.inventory[inv_idx].getValue()])
        }
    }

    /**
     * Updates the inventory of the specified denomination.
     * 
     * 
     * @param denomination 
     * @param amount 
     * @returns 
     */
    refill(denomination, amount) {

        for (let inv_idx = 0; inv_idx < this.inventory.length; inv_idx++) {
            if (denomination == this.inventory[inv_idx].getValue()) {
                this.inventory[inv_idx].add(parseInt(amount));  // prevent problems, just in case it got posted as a string
                return this.inventory[inv_idx].getType();
            }
        };
    }

    validateRefill(money) {

        // check that all denominations are valid for this ATM
        const validDenominations = this.getDenominations();

        const validInput = Object.keys(money).every( denomination => {
            const amountToInsert = parseInt(money[denomination]);
            return validDenominations.includes(parseFloat(denomination)) &&   // this ATM has this denomination (object keys are strings, but the value is an int)
                    ! Number.isNaN(amountToInsert) &&                       // the amount being added is a number
                    amountToInsert == money[denomination] &&                // the amount being added is an integer
                    amountToInsert > 0                                      // the amount being add is positive
        })

        if( ! validInput ) {
            throw new InvalidRefillException("All inputs must be valid denominations for this ATM, and all input amounts must be positive integers.");
        }

        return true;
    }
}

module.exports = new Atm();