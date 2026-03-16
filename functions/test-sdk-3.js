const { Cashfree, CFEnvironment } = require('cashfree-pg');
console.log('CFEnvironment:', CFEnvironment);
console.log('CFEnvironment.PRODUCTION:', CFEnvironment.PRODUCTION);
console.log('Cashfree keys:', Object.keys(Cashfree));

// Let's try to set it up
Cashfree.XClientId = "test_id";
Cashfree.XClientSecret = "test_secret";
Cashfree.XEnvironment = CFEnvironment.PRODUCTION;

console.log('Cashfree.XEnvironment:', Cashfree.XEnvironment);
