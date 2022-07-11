module.exports = class Denomination {

    constructor(value, type, initInventory) {
        this.value = value;
        this.type = type;
        this.inventory = initInventory;
    }
    getType() {
        return this.type;
    }
    getName() {
        return `${this.value}`;
    }
    getValue() {
        return this.value;
    }
    getInventory() {
        return this.inventory;
    }
    add( numberOfCoinsOrBillsToAdd ) {
        this.inventory += parseInt(numberOfCoinsOrBillsToAdd);
    }
    dispense(numberOfCoinsOrBillsToDispense) {
        this.inventory -= parseInt(numberOfCoinsOrBillsToDispense);
    }

}