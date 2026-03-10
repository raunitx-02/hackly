require('dotenv').config();
const axios = require('axios');

async function test() {
    const APP_ID = process.env.CASHFREE_APP_ID;
    const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
    console.log("APP_ID:", APP_ID ? "Loaded" : "Missing");
    console.log("SECRET_KEY:", SECRET_KEY ? "Loaded" : "Missing");

    const baseUrl = 'https://api.cashfree.com/pg/orders'; // PRODUCTION url

    const orderId = `order_test_${Date.now()}`;

    try {
        const response = await axios.post(baseUrl, {
            order_id: orderId,
            order_amount: 15000,
            order_currency: "INR",
            customer_details: {
                customer_id: "test_uid_123",
                customer_phone: "9999999999",
                customer_name: "Test User",
                customer_email: "test@hackly.online"
            },
            order_meta: {
                return_url: `https://eventforge-d6dbe.web.app/pricing?order_id=${orderId}`,
                notify_url: `https://us-central1-eventforge-d6dbe.cloudfunctions.net/cashfreeWebhook`
            },
            order_tags: {
                planName: "Starter",
                uid: "test_uid_123"
            }
        }, {
            headers: {
                'x-client-id': APP_ID,
                'x-client-secret': SECRET_KEY,
                'x-api-version': '2023-08-01',
                'Content-Type': 'application/json'
            }
        });
        console.log("Success! Session ID:", response.data.payment_session_id);
    } catch (e) {
        console.error("Cashfree API Error:", JSON.stringify(e.response?.data, null, 2) || e.message);
    }
}
test();
