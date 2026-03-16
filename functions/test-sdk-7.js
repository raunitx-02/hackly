const { Cashfree } = require('cashfree-pg');
const cf = new Cashfree();
console.log('PGCreateOrder signature:', cf.PGCreateOrder.toString());
