import { httpsCallable, functions } from '../lib/firebase';
import toast from 'react-hot-toast';
import { load } from '@cashfreepayments/cashfree-js';

/**
 * PaymentService
 * 
 * Handles the logic for triggering Cashfree checkout.
 */
const PaymentService = {
    cashfree: null,

    /**
     * Initializes the Cashfree SDK
     */
    initializeCashfree: async () => {
        if (!PaymentService.cashfree) {
            PaymentService.cashfree = await load({
                mode: "production", // Live Payments Enabled
            });
        }
        return PaymentService.cashfree;
    },

    /**
     * Triggers the full payment flow via Cashfree
     */
    processSubscription: async (user, plan) => {
        if (!user) {
            toast.error('Please login to subscribe.');
            return;
        }

        const loadingToast = toast.loading('Securely initiating Cashfree payment...');

        try {
            // 1. Initialize Cashfree Web SDK
            const cashfree = await PaymentService.initializeCashfree();

            // 2. Call Cloud Function to create Cashfree Order securely
            const createOrderFn = httpsCallable(functions, 'createCashfreeOrder');
            const amount = parseInt(plan.price.replace(/[^\d]/g, ''));

            const { data: orderData } = await createOrderFn({
                planName: plan.name,
                amount: amount,
                customerName: user.displayName || "Organizer",
                customerPhone: "9999999999" // Can be captured from user profile in the future
            });

            toast.dismiss(loadingToast);

            // 3. Open Cashfree Checkout Modal using the returned Payment Session ID
            let checkoutOptions = {
                paymentSessionId: orderData.paymentSessionId,
                redirectTarget: "_modal", // Open as a pop-up overlay rather than completely redirecting tab
            };

            cashfree.checkout(checkoutOptions).then((result) => {
                if (result.error) {
                    // This will be true whenever user clicks on close icon inside the modal or any error happens during payment
                    console.error("Cashfree Checkout Error:", result.error);
                    toast.error(result.error.message || "Payment cancelled or failed.");
                }
                if (result.redirect) {
                    // This will be true if the payment redirect page couldn't be opened in an iframe
                    console.log("Payment will be redirected");
                }
                if (result.paymentDetails) {
                    // This will be called whenever the payment is completed irrespective of transaction status
                    console.log("Payment completed details:", result.paymentDetails);
                    toast.loading("Payment complete! Waiting for secure server verification...");

                    // The backend cashfreeWebhook will verify the payment asynchronously.
                    // We can poll the backend, or simply instruct the user to refresh.
                    setTimeout(() => {
                        toast.dismiss();
                        window.location.href = `/payment-success?plan=${encodeURIComponent(plan.name)}`;
                    }, 2000);
                }
            });

        } catch (error) {
            console.error('Cashfree Payment Error:', error);
            toast.dismiss(loadingToast);
            toast.error(error.message || 'Payment initiation failed.');
        }
    }
};

export default PaymentService;
