import { httpsCallable, functions } from '../lib/firebase';
import toast from 'react-hot-toast';
import { load } from '@cashfreepayments/cashfree-js';

/**
 * PaymentService (Re-implemented)
 * 
 * Handles the logic for triggering Cashfree checkout with improved error handling.
 */
const PaymentService = {
    cashfree: null,

    /**
     * Initializes the Cashfree SDK
     */
    initializeCashfree: async () => {
        if (!PaymentService.cashfree) {
            console.log('[PaymentService] Initializing Cashfree SDK in PRODUCTION mode...');
            PaymentService.cashfree = await load({
                mode: "production", 
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

        console.log(`[PaymentService] Processing subscription for plan: ${plan.name} (Amount: ${plan.price})`);
        const loadingToast = toast.loading('Connecting to Cashfree...');

        try {
            // 1. Initialize Cashfree Web SDK
            const cashfree = await PaymentService.initializeCashfree();

            // 2. Call Cloud Function to create Cashfree Order
            // Explicitly ensuring we target the us-central1 region
            console.log('[PaymentService] Calling createCashfreeOrder Cloud Function...');
            const createOrderFn = httpsCallable(functions, 'createCashfreeOrder');
            
            // Clean the amount string (e.g., "₹15,000" -> 15000)
            const amount = parseInt(plan.price.replace(/[^\d]/g, ''));

            if (isNaN(amount) || amount <= 0) {
                throw new Error('Invalid plan amount detected.');
            }

            const payload = {
                planName: plan.name,
                amount: amount,
                customerName: user.displayName || "Organizer",
                customerPhone: user.phoneNumber || "9999999999" 
            };

            const result = await createOrderFn(payload);
            const orderData = result.data;

            console.log('[PaymentService] Order created successfully:', orderData.orderId);
            toast.dismiss(loadingToast);

            // 3. Open Cashfree Checkout Modal
            const checkoutOptions = {
                paymentSessionId: orderData.paymentSessionId,
                redirectTarget: "_modal", 
            };

            console.log('[PaymentService] Opening Checkout Modal...');
            cashfree.checkout(checkoutOptions).then((result) => {
                if (result.error) {
                    console.error("[PaymentService] Checkout interaction error:", result.error);
                    toast.error(result.error.message || "Payment cancelled or failed.");
                }
                
                if (result.paymentDetails) {
                    console.log("[PaymentService] Payment interaction completed:", result.paymentDetails);
                    toast.loading("Verifying payment status...");

                    // Verify on success page
                    setTimeout(() => {
                        toast.dismiss();
                        window.location.href = `/payment-success?plan=${encodeURIComponent(plan.name)}&order_id=${orderData.orderId}`;
                    }, 2000);
                }
            });

        } catch (error) {
            console.error('[PaymentService] Error in processSubscription:', error);
            toast.dismiss(loadingToast);
            
            // Handle Firebase specific Errors
            const errorMessage = error.details?.message || error.message || 'Payment initiation failed.';
            toast.error(errorMessage);
        }
    }
};

export default PaymentService;
