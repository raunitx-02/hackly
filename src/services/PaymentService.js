import { httpsCallable, functions } from '../lib/firebase';
import toast from 'react-hot-toast';

/**
 * PaymentService
 * 
 * Handles the logic for triggering Razorpay checkout.
 */
const PaymentService = {
    /**
     * Loads the Razorpay Checkout script dynamically
     */
    loadRazorpayScript: () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    },

    /**
     * Triggers the full payment flow
     */
    processSubscription: async (user, plan) => {
        if (!user) {
            toast.error('Please login to subscribe.');
            return;
        }

        const isLoaded = await PaymentService.loadRazorpayScript();
        if (!isLoaded) {
            toast.error('Failed to load payment gateway. Please check your internet.');
            return;
        }

        const loadingToast = toast.loading('Initiating secure payment...');

        try {
            // 1. Call Cloud Function to create Razorpay Order
            const createOrderFn = httpsCallable(functions, 'createRazorpayOrder');
            const amount = parseInt(plan.price.replace(/[^\d]/g, ''));

            const { data: orderData } = await createOrderFn({
                planName: plan.name,
                amount: amount
            });

            toast.dismiss(loadingToast);

            // 2. Open Razorpay Modal
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Hackly Platform",
                description: `Subscription: ${plan.name}`,
                order_id: orderData.orderId,
                handler: async (response) => {
                    // This is called when payment is successful on Razorpay's end
                    await PaymentService.verifyPayment(response, plan.name);
                },
                prefill: {
                    name: user.displayName || '',
                    email: user.email || '',
                },
                theme: {
                    color: "#3B82F6",
                }
            };

            const rzp = new window.Razorpay(options);

            rzp.on('payment.failed', function (response) {
                toast.error(`Payment Failed: ${response.error.description}`);
            });

            rzp.open();

        } catch (error) {
            console.error('Payment Error:', error);
            toast.dismiss(loadingToast);
            toast.error(error.message || 'Payment initiation failed.');
        }
    },

    /**
     * Calls the verification Cloud Function
     */
    verifyPayment: async (razorpayResponse, planName) => {
        const verifyingToast = toast.loading('Verifying payment signature...');

        try {
            const verifyFn = httpsCallable(functions, 'verifyRazorpayPayment');
            const { data: result } = await verifyFn({
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
                planName: planName
            });

            toast.dismiss(verifyingToast);

            if (result.success) {
                toast.success('Subscription active! Welcome to Hackly Premium.');
                // Profile refresh is handled by AuthContext as it listens to changes
            }
        } catch (error) {
            console.error('Verification Error:', error);
            toast.dismiss(verifyingToast);
            toast.error('Payment verified by bank but failed verification on our server. Contact support.');
        }
    }
};

export default PaymentService;
