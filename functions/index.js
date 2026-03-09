const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Razorpay = require('razorpay');
const crypto = require('crypto');

admin.initializeApp();
const db = admin.firestore();

// A fallback list of blocked words if settings doc doesn't exist
const DEFAULT_BLOCKED_KEYWORDS = [
    'scam', 'crypto-doubler', 'buy-followers', 'fake-event',
    'offensive1', 'offensive2' // placeholders
];

/**
 * Checks if text contains any of the blocked keywords
 */
function containsBlockedWords(text, blockedWords) {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return blockedWords.some(word => lowerText.includes(word.toLowerCase()));
}

/**
 * Extracts all searchable text from an event document
 */
function extractSearchableText(eventData) {
    const parts = [
        eventData.title || '',
        eventData.tagline || '',
        eventData.description || '',
    ];

    if (Array.isArray(eventData.problemStatements)) {
        eventData.problemStatements.forEach(ps => {
            parts.push(ps.title || '');
            parts.push(ps.description || '');
        });
    }

    return parts.join(' ');
}

/**
 * Firestore Trigger: Runs when a new event is created or updated
 */
exports.moderateEventContent = functions.firestore
    .document('events/{eventId}')
    .onWrite(async (change, context) => {
        // If document is deleted, do nothing
        if (!change.after.exists) return null;

        const eventData = change.after.data();
        const eventId = context.params.eventId;

        // Don't re-run if this update is just the system forcing 'removed' status
        if (eventData.status === 'removed' && change.before.exists && change.before.data().status !== 'removed') {
            return null;
        }

        try {
            // 1. Fetch blocked keywords from adminSettings
            let blockedKeywords = DEFAULT_BLOCKED_KEYWORDS;
            const settingsDoc = await db.collection('adminSettings').doc('general').get();
            if (settingsDoc.exists && Array.isArray(settingsDoc.data().blockedKeywords)) {
                blockedKeywords = settingsDoc.data().blockedKeywords;
            }

            // 2. Check content for vulgarity/spam
            const fullText = extractSearchableText(eventData);
            const isBlocked = containsBlockedWords(fullText, blockedKeywords);

            if (isBlocked) {
                console.log(`Event ${eventId} flagged for violating content policies.`);

                // 3. Mark Event as 'removed'
                await change.after.ref.update({
                    status: 'removed',
                    moderatedAt: admin.firestore.FieldValue.serverTimestamp()
                });

                // 4. Log the moderation action
                const organizerId = eventData.organizerId;
                await db.collection('moderationLog').add({
                    type: 'event',
                    entityId: eventId,
                    entityName: eventData.title || 'Untitled Event',
                    action: 'auto_blocked',
                    reason: 'Blocked keyword detected in content',
                    userId: organizerId,
                    performedBy: 'system',
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });

                // 5. Check if user needs to be blacklisted (Strike System)
                // Count how many auto_blocked logs this user has in the last 24 hours
                if (organizerId) {
                    const twentyFourHoursAgo = new Date();
                    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

                    const logsSnapshot = await db.collection('moderationLog')
                        .where('userId', '==', organizerId)
                        .where('action', '==', 'auto_blocked')
                        .where('createdAt', '>=', twentyFourHoursAgo)
                        .get();

                    const strikeCount = logsSnapshot.size;

                    if (strikeCount >= 3) {
                        console.log(`User ${organizerId} reached 3 strikes. Blacklisting.`);
                        // Blacklist the user
                        await db.collection('users').doc(organizerId).update({
                            isBlacklisted: true,
                            blacklistedAt: admin.firestore.FieldValue.serverTimestamp()
                        });

                        // Log user blacklist
                        await db.collection('moderationLog').add({
                            type: 'user',
                            entityId: organizerId,
                            entityName: organizerId, // Ideally fetch their name, but ID suffices for system log
                            action: 'auto_blacklisted',
                            reason: 'Repeated attempts (3+) to create vulgar events in 24h',
                            performedBy: 'system',
                            createdAt: admin.firestore.FieldValue.serverTimestamp()
                        });
                    }
                }
            } else {
                // If it passes check and was newly created, set state to pending_review
                // Admin has to approve it before it goes live.
                if (!change.before.exists && eventData.status !== 'pending_review' && eventData.status !== 'draft') {
                    await change.after.ref.update({
                        status: 'pending_review'
                    });
                }
            }

        } catch (error) {
            console.error('Error in moderateEventContent:', error);
        }

        return null;
    });

/**
 * ─── CASHFREE PAYMENT INTEGRATION ───
 */
const axios = require('axios');

/**
 * Cloud Function: Create a Cashfree Order
 * securely communicates with Cashfree to generate a payment_session_id 
 */
exports.createCashfreeOrder = functions.https.onCall(async (data, context) => {
    // 1. Check Authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    }

    const { planName, amount, customerPhone = "9999999999", customerName = "Organizer" } = data; // Amount in INR

    // 2. Fetch Cashfree Keys (Environment variables)
    const APP_ID = process.env.CASHFREE_APP_ID;
    const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
    const ENVIRONMENT = process.env.CASHFREE_ENVIRONMENT || 'SANDBOX'; // PRODUCTION or SANDBOX

    const baseUrl = ENVIRONMENT === 'PRODUCTION'
        ? 'https://api.cashfree.com/pg/orders'
        : 'https://sandbox.cashfree.com/pg/orders';

    const orderId = `order_${context.auth.uid}_${Date.now()}`;

    try {
        // 3. Call Cashfree API to create an order
        const response = await axios.post(baseUrl, {
            order_id: orderId,
            order_amount: amount,
            order_currency: "INR",
            customer_details: {
                customer_id: context.auth.uid,
                customer_phone: customerPhone,
                customer_name: customerName,
                customer_email: context.auth.token.email || "no-reply@hackly.online"
            },
            order_meta: {
                return_url: `https://eventforge-d6dbe.web.app/pricing?order_id=${orderId}`,
                notify_url: `https://us-central1-${process.env.GCP_PROJECT || 'eventforge-d6dbe'}.cloudfunctions.net/cashfreeWebhook`
            },
            order_tags: {
                planName: planName,
                uid: context.auth.uid
            }
        }, {
            headers: {
                'x-client-id': APP_ID,
                'x-client-secret': SECRET_KEY,
                'x-api-version': '2023-08-01',
                'Content-Type': 'application/json'
            }
        });

        // 4. Log the initiated payment in Firestore
        await db.collection('payments').doc(orderId).set({
            uid: context.auth.uid,
            orderId: orderId,
            amount: amount,
            planName: planName,
            status: 'created',
            paymentSessionId: response.data.payment_session_id,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return {
            orderId: orderId,
            paymentSessionId: response.data.payment_session_id,
            environment: ENVIRONMENT
        };

    } catch (error) {
        console.error('Error creating Cashfree order:', error.response?.data || error.message);
        throw new functions.https.HttpsError('internal', 'Failed to create payment order with Cashfree.');
    }
});

/**
 * Cloud Function: Webhook for Cashfree
 * Server-to-server confirmation preventing frontend spoofing
 */
exports.cashfreeWebhook = functions.https.onRequest(async (req, res) => {
    try {
        const signature = req.headers['x-webhook-signature'];
        const timestamp = req.headers['x-webhook-timestamp'];
        const bodyRaw = req.rawBody.toString(); // Necessary for HMAC crypto verification

        const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;

        // 1. Verify Cashfree Webhook Signature
        const expectedSignature = crypto
            .createHmac('sha256', SECRET_KEY)
            .update(timestamp + bodyRaw)
            .digest('base64');

        if (expectedSignature !== signature) {
            console.error('Invalid Cashfree Webhook Signature');
            return res.status(400).send('Invalid Signature');
        }

        const payload = req.body;
        const eventType = payload.type;

        if (eventType === 'PAYMENT_SUCCESS_WEBHOOK') {
            const orderMeta = payload.data.order;
            const orderId = orderMeta.order_id;
            const planName = orderMeta.order_tags?.planName || 'Unknown Plan';
            const uid = orderMeta.order_tags?.uid;

            // 2. Mark payment successful in DB
            await db.collection('payments').doc(orderId).update({
                status: 'success',
                transactionId: payload.data.payment.cf_payment_id,
                verifiedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // 3. Grant the subscription to the Organizer
            if (uid) {
                const role = planName.toLowerCase().includes('pro') ? 'admin' : 'organizer';
                await db.collection('users').doc(uid).update({
                    role: role,
                    subscriptionStatus: 'active',
                    currentPlan: planName,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });

                // 4. Log the moderation/system activity
                await db.collection('moderationLog').add({
                    type: 'system',
                    action: 'plan_purchased',
                    entityId: uid,
                    entityName: planName,
                    reason: `Verified Cashfree Payment: ${payload.data.payment.cf_payment_id}`,
                    performedBy: 'system',
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        }

        return res.status(200).send('Webhook processed');

    } catch (error) {
        console.error('Error processing webhook:', error);
        return res.status(500).send('Internal Server Error');
    }
});
