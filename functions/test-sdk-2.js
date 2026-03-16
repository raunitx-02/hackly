const CashfreeSDK = require('cashfree-pg');
console.log('CashfreeSDK keys:', Object.keys(CashfreeSDK));
if (CashfreeSDK.Cashfree) {
    console.log('CashfreeSDK.Cashfree keys:', Object.keys(CashfreeSDK.Cashfree));
}
