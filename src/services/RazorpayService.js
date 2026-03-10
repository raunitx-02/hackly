import toast from 'react-hot-toast';

class RazorpayService {
    constructor() {
        this.isScriptLoaded = false;
    }

    /**
     * Dynamically loads the Razorpay SDK script
     */
    loadScript() {
        return new Promise((resolve) => {
            if (this.isScriptLoaded) return resolve(true);
            
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
                this.isScriptLoaded = true;
                resolve(true);
            };
            script.onerror = () => {
                toast.error('Failed to load payment gateway. Please check your internet connection.');
                resolve(false);
            };
            document.body.appendChild(script);
        });
    }

    /**
     * Main method to handle the subscription flow
     */
    async processSubscription(user, plan) {
        try {
            console.log('[RazorpayService] Initiating subscription for:', plan.name);
            
            // 1. Load Razorpay Script
            const loaded = await this.loadScript();
            if (!loaded) return;

            // 2. Call Cloud Function to create Order
            const { getFunctions, httpsCallable } = await import('firebase/functions');
            const functions = getFunctions(undefined, 'us-central1');
            const createOrder = httpsCallable(functions, 'createRazorpayOrder');

            const loadingToast = toast.loading('Preparing secure checkout...');

            try {
                const response = await createOrder({
                    planName: plan.name,
                    amount: plan.priceValue || 500, // Fallback if priceValue not in config
                    amountInPaise: (plan.priceValue || 500) * 100
                });

                const { orderId, amount, currency, key } = response.data;
                toast.dismiss(loadingToast);

                // 3. Open Razorpay Checkout Modal
                const options = {
                    key: key, // This will be the Public Key ID from your dashboard
                    amount: amount,
                    currency: currency,
                    name: 'Hackly',
                    description: `${plan.name} Subscription`,
                    image: 'https://hackly.online/favicon.png',
                    order_id: orderId,
                    handler: async (response) => {
                        console.log('[RazorpayService] Payment Successful:', response.razorpay_payment_id);
                        toast.success('Payment successful! Verifying...', { duration: 5000 });
                        
                        // Optional: You can poll Firestore or just wait for the webhook
                        // We'll redirect to a success page or refresh the user data
                        setTimeout(() => {
                            window.location.href = '/dashboard?payment=success';
                        }, 2000);
                    },
                    prefill: {
                        name: user.displayName || 'Organizer',
                        email: user.email,
                        contact: user.phoneNumber || ''
                    },
                    theme: {
                        color: '#3B82F6'
                    },
                    modal: {
                        ondismiss: () => {
                            console.log('[RazorpayService] Modal Closed');
                            toast.error('Payment cancelled');
                        }
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.open();

            } catch (error) {
                toast.dismiss(loadingToast);
                console.error('[RazorpayService] Order Creation Failed:', error);
                toast.error(error.message || 'Failed to initiate payment. Please try again.');
            }

        } catch (error) {
            console.error('[RazorpayService] Unexpected Error:', error);
            toast.error('Something went wrong. Please refresh the page.');
        }
    }
}

export default new RazorpayService();
