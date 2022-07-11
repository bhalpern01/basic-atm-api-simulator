const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');

const atm = require('./classes/atm')
const NotEnoughMoneyException = require('./exceptions/not-enough-money-exception')

const app = express();
const jsonParser = bodyParser.json()
require('dotenv').config();

// permissive access to this API
app.use(cors());

/**
 * GET /status
 * Quick check that the system is running
 */
app.get('/status', (req, res) => {
    res.send({
        message: 'OK'
    });
});

/**
 * POST /atm/withdrawal
 * Withdraw the specified amount of money from the ATM
 */
app.post('/atm/withdrawal', jsonParser, async (req, res) => {
    if (!req.body.hasOwnProperty('amount')) {
        res.status(400).send({
            error: "Bad Request: Missing 'amount' parameter."
        })
    }

    if( Number.isNaN(req.body.amount) || Math.floor(req.body.amount * 100) / 100 != req.body.amount) {
        res.status(400).send({
            error: "Bad Request: 'amount' parameter is in the wrong format."
        })
    }

    if(req.body.amount > atm.getMaxmimumWithdrawal() || req.body.amount < 0.01) {
        res.status(400).send({
            error: `Bad Request: Amount is not in the range of 0.01 to ${atm.getMaxmimumWithdrawal()}.`
        })
    }

    try {
        const result = atm.withdraw(req.body.amount);
        res.send({result: result});
    } catch (e) {
        if(e instanceof NotEnoughMoneyException) {
            console.log(e)
            res.status(409).send({error: `${e}`});
        } else {
            console.log(e)
            res.status(400).send({error: `${e}`});
        }
    }
});

/**
 * POST /atm/refill
 * Refill the ATM
 * 
 * Accepts a "money" object whose attributes are denomination values, and whose values are positive integers.
 */
app.post('/atm/refill', jsonParser, async (req, res) => {

    if (!req.body.hasOwnProperty('money')) {
        res.status(400).send({
            error: "Bad Request: Missing 'money' parameter."
        })
    }

    try {
        const money = req.body.money;
        atm.validateRefill(money);     // throws error on validation failure, else returns true.
        const successMessages = [];
        Object.keys(money).forEach( denomination => {
            const billsOrCoins = atm.refill(denomination, money[denomination])
            successMessages.push(`Successfully added ${money[denomination]} ${denomination}-unit ${billsOrCoins}s`)
        })
        res.send({messages: successMessages});
    } catch(e) {
        console.log(e);
        res.status(400).send({error: `${e}`});
    }
})

app.listen(3400, () => console.log('ATM Server is running on http://localhost:3400/status'));