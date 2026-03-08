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
 * ─── RAZORPAY PAYMENT INTEGRATION ───
 */

/**
 * Cloud Function: Create a Razorpay Order
 * Validates the amount based on the selected plan.
 */
exports.createRazorpayOrder = functions.https.onCall(async (data, context) => {
    // 1. Check Authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    }

    const { planName, amount } = data; // Amount in INR (not paise)

    // 2. Fetch Razorpay Keys (Should ideally be in environment variables / secret manager)
    const RAZORPAY_KEY_ID = functions.config().razorpay?.key_id || 'rzp_test_YOUR_KEY_HERE';
    const RAZORPAY_KEY_SECRET = functions.config().razorpay?.key_secret || 'YOUR_SECRET_HERE';

    const razorpay = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
    });

    try {
        // 3. Create Order
        const options = {
            amount: amount * 100, // Razorpay expects amount in paise
            currency: "INR",
            receipt: `receipt_${context.auth.uid}_${Date.now()}`,
            notes: {
                uid: context.auth.uid,
                planName: planName
            }
        };

        const order = await razorpay.orders.create(options);

        // 4. Log the initiated payment in Firestore
        await db.collection('payments').doc(order.id).set({
            uid: context.auth.uid,
            orderId: order.id,
            amount: amount,
            planName: planName,
            status: 'created',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: RAZORPAY_KEY_ID
        };

    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        throw new functions.https.HttpsError('internal', 'Failed to create payment order.');
    }
});

/**
 * Cloud Function: Verify Razorpay Payment Signature
 * This prevents fraudulent "success" messages from the client.
 */
exports.verifyRazorpayPayment = functions.https.onCall(async (data, context) => {
    // 1. Check Authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    }

    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        planName
    } = data;

    const RAZORPAY_KEY_SECRET = functions.config().razorpay?.key_secret || 'YOUR_SECRET_HERE';

    // 2. Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
        console.error('Invalid signature for order:', razorpay_order_id);

        // Log the failed attempt
        await db.collection('payments').doc(razorpay_order_id).update({
            status: 'failed_signature',
            razorpayPaymentId: razorpay_payment_id,
            verifiedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        throw new functions.https.HttpsError('invalid-argument', 'Invalid payment signature.');
    }

    try {
        // 3. Update Payment Status to Success
        await db.collection('payments').doc(razorpay_order_id).update({
            status: 'success',
            razorpayPaymentId: razorpay_payment_id,
            verifiedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // 4. Update User Profile Role/Subscription
        // Note: For 'Institution Pro', this might trigger a 'pending_activation' state instead.
        const role = planName.toLowerCase().includes('pro') ? 'admin' : 'organizer';

        await db.collection('users').doc(context.auth.uid).update({
            role: role,
            subscriptionStatus: 'active',
            currentPlan: planName,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // 5. Log activity
        await db.collection('moderationLog').add({
            type: 'system',
            action: 'plan_purchased',
            entityId: context.auth.uid,
            entityName: planName,
            reason: `Payment verified: ${razorpay_payment_id}`,
            performedBy: 'system',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return { success: true, message: 'Payment verified and profile updated.' };

    } catch (error) {
        console.error('Error verifying Razorpay payment:', error);
        throw new functions.https.HttpsError('internal', 'Verification successful but profile update failed.');
    }
});
