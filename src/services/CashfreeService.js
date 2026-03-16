import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';
import toast from 'react-hot-toast';

class CashfreeService {
    constructor() {
        this.cashfree = null;
    }

    /**
     * Dynamically loads the Cashfree SDK script
     */
    async loadScript() {
        if (window.Cashfree) return true;

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => reject(new Error('Cashfree SDK failed to load'));
            document.body.appendChild(script);
        });
    }

    /**
     * Main entry point for subscription processing
     */
    async processSubscription(currentUser, plan) {
        if (!currentUser) {
            toast.error('Please login to continue');
            return;
        }

        try {
            console.log('[CashfreeService] Initiating plan selection for:', plan.name);

            // 1. Handle Free Plans
            if (plan.priceValue === 0) {
                const activateFree = httpsCallable(functions, 'activateFreeTier');
                toast.loading('Activating free plan...', { id: 'payment' });
                
                try {
                    await activateFree({ planName: plan.name });
                    toast.success('Free tier activated! Welcome to the Growth plan. 🚀', { id: 'payment' });
                    setTimeout(() => window.location.href = '/dashboard', 1500);
                    return;
                } catch (error) {
                    console.error('[CashfreeService] Free Activation Failed:', error);
                    toast.error('Activation failed. Please try again.', { id: 'payment' });
                    return;
                }
            }

            // 2. Load Cashfree Script for Paid Plans
            await this.loadScript();
            this.cashfree = window.Cashfree({
                mode: "production" // Switched to "production" for live
            });

            // 3. Request Order from Firebase Backend
            const createOrder = httpsCallable(functions, 'createCashfreeOrder');
            toast.loading('Preparing secure checkout...', { id: 'payment' });

            const { data } = await createOrder({
                planName: plan.name,
                amount: plan.priceValue
            });

            if (!data.payment_session_id) {
                throw new Error('Failed to create payment session');
            }

            toast.dismiss('payment');

            // 4. Open Cashfree Checkout Modal
            const checkoutOptions = {
                paymentSessionId: data.payment_session_id,
                redirectTarget: "_modal", // Opens in modal
            };

            await this.cashfree.checkout(checkoutOptions);
            console.log('[CashfreeService] Checkout modal opened');

        } catch (error) {
            console.error('[CashfreeService] Payment Error:', error);
            toast.error(error.message || 'Payment service unavailable', { id: 'payment' });
        }
    }
}

export default new CashfreeService();
