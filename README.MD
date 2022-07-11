# Basic ATM Simulator API

This Node project simulates an ATM's operation. Money can be withdrawn, and the machine can be refilled.

## Description

This ATM simulation is controlled through an API. A withdrawal will produce the most efficient arrangement of currency denominations, constrained by the amounts of each currency that are available in the ATM.

## Getting Started

### Installing

* npm install

### Running the program

Running "npm run start" or "node server.js" from the command line will start the program.

#### GET /status

Returns `{ message: "OK" }` when the application is running.

#### POST /atm/withdrawal

Accepts the request body: `{ amount: "1234.56"}`, where "amount" can be any number between 0.01 and 2000, with up to 2 decimal points' precision.

Returns the combination of currency denominations and their amounts to fullfil the request, formatted as `{ result: { bills: {...}, coins: {...} }}`.

An error will occur if...

* the ATM does not have the currencies to provide the exact amount requested.
* the ATM needs to dispense more than 50 coins to complete the transaction.
* the amount requested is larger than 2000, or less than 0.01.
* the request is malformed.

#### POST /atm/refill

Accepts the request body `{ money: {...} }`, where each key-value of the "money" object is the denomination and number of that denomination, respectively.

For example:

```
{
    "money":{
        "0.1": 5,
        "5": 20,
        "20": 15,
        "100": 30
    }
}
```

Returns `{ messages: [...] }` where each string in the array states that a specific denomination was successfully added to the machine.

An error will occur if...

* A denomination is specified that is not available in the ATM.
* A non-positive-integer value is specified for any of the deposited currencies (e.g. You can't put half of a coin in an ATM).
* The request is malformed.

Note that validation is performed before the ATM is refilled. If any validation check fails, nothing is added to the ATM's inventory.