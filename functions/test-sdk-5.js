const CashfreeSDK = require('cashfree-pg');
const { Cashfree } = CashfreeSDK;

console.log('--- CashfreeSDK Keys ---');
console.log(Object.keys(CashfreeSDK));

console.log('--- Cashfree instance ---');
const cf = new Cashfree();
let obj = cf;
while (obj) {
    console.log(`Methods on ${obj.constructor.name}:`, 
        Object.getOwnPropertyNames(obj).filter(i => typeof obj[i] === 'function')
    );
    obj = Object.getPrototypeOf(obj);
}

// Check if Cashfree has static methods
console.log('--- Cashfree static methods ---');
console.log(Object.getOwnPropertyNames(Cashfree).filter(i => typeof Cashfree[i] === 'function'));
