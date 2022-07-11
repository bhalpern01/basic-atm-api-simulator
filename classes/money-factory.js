/**
 * Still deciding whether currency are objects or just numbers with labels.
 * If currency are objects, this class creates them.
 * 
 * For example, for intializing an ATM object, we can do:
 *      atm.inventory.200 = new Array(7).fill(MoneyFactory.printMoney(200)) 
 */

class MoneyFactory {

    static printMoney(denomination) {
        switch (denomination) {
            case 200:
            case 100:
            case 20:
                return {
                    type: "BILL",
                    value: denomination
                };
            case 10:
            case 5:
            case 1:
            case 0.1:
            case 0.01:
                return {
                    type: "COIN",
                    value: denomination
                };
                default:
                    // TODO - think of an appropriate error here, or just return "undefined"?
                    return undefined;
        }
    }
}