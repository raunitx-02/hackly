const { Cashfree } = require('cashfree-pg');
console.log('Cashfree keys:', Object.keys(Cashfree));
if (Cashfree.Environment) {
    console.log('Cashfree.Environment keys:', Object.keys(Cashfree.Environment));
} else {
    console.log('Cashfree.Environment is UNDEFINED');
}
