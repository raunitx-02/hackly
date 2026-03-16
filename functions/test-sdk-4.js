const { Cashfree } = require('cashfree-pg');
console.log('typeof Cashfree:', typeof Cashfree);
console.log('Cashfree keys:', Object.keys(Cashfree));
console.log('Cashfree prototype keys:', Object.keys(Object.getPrototypeOf(Cashfree)));

// Let's see if it's a function we need to call to get an instance
try {
    const instance = new Cashfree();
    console.log('Instance created with new Cashfree()');
    console.log('Instance keys:', Object.keys(instance));
    console.log('Instance prototype keys:', Object.keys(Object.getPrototypeOf(instance)));
} catch (e) {
    console.log('Failed to create instance with new Cashfree():', e.message);
}
