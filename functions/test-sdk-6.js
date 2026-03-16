const { Cashfree, CFEnvironment } = require('cashfree-pg');

const cf = new Cashfree();
cf.XClientId = "test_id";
cf.XClientSecret = "test_secret";
cf.XEnvironment = CFEnvironment.SANDBOX;

console.log('cf.PGCreateOrder type:', typeof cf.PGCreateOrder);

if (typeof cf.PGCreateOrder === 'function') {
    console.log('SUCCESS: PGCreateOrder found on instance');
} else {
    console.log('FAILURE: PGCreateOrder NOT found on instance');
}
