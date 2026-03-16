const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const { Cashfree, CFEnvironment } = require('cashfree-pg');
const crypto = require('crypto');
const axios = require('axios');
const { GoogleGenAI } = require('@google/genai');

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
            }

        } catch (error) {
            console.error('Error in moderateEventContent:', error);
        }

        return null;
    });

/**
 * Cloud Function: Activate Free Tier (No payment required)
 */
exports.activateFreeTier = functions.region('us-central1').https.onCall(async (data, context) => {
    console.log('[Free Tier] activateFreeTier Invoked');
    
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Login required.');
    }

    const { planName } = data;

    try {
        // Log the activation
        await db.collection('payments').add({
            uid: context.auth.uid,
            planName: planName,
            status: 'free_activated',
            amount: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Update user role to organizer for free tier
        // (Assuming Free plan grants 'organizer' role to allow creating at least 1 event)
        await db.collection('users').doc(context.auth.uid).update({
            role: 'organizer',
            subscriptionStatus: 'active',
            currentPlan: planName,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`[Free Tier] Activated for ${context.auth.uid}`);
        return { success: true };

    } catch (error) {
        console.error('[Free Tier] Activation Error:', error);
        throw new functions.https.HttpsError('internal', 'Activation failed.');
    }
});

/**
 * Cloud Function: Create a Cashfree Order
 */
exports.createCashfreeOrder = functions.region('us-central1').https.onCall(async (data, context) => {
    console.log('[Cashfree] createCashfreeOrder Invoked');
    
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Login required.');
    }

    const { planName, amount } = data;
    const APP_ID = process.env.CASHFREE_APP_ID;
    const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;

    if (!APP_ID || !SECRET_KEY) {
        throw new functions.https.HttpsError('failed-precondition', 'Payment gateway not configured.');
    }

    const cf = new Cashfree();
    cf.XClientId = APP_ID;
    cf.XClientSecret = SECRET_KEY;
    cf.XEnvironment = CFEnvironment.PRODUCTION; // Switched to CFEnvironment.PRODUCTION for live

    try {
        const request = {
            order_amount: amount,
            order_currency: "INR",
            customer_details: {
                customer_id: context.auth.uid,
                customer_email: context.auth.token.email || "customer@example.com",
                customer_phone: "9999999999" // Fallback if phone not available
            },
            order_meta: {
                return_url: "https://hackly.online/dashboard?order_id={order_id}"
            },
            order_note: planName
        };

        const response = await cf.PGCreateOrder(request);
        const order = response.data;

        console.log('[Cashfree] Order Created:', order.order_id);

        // Track in Firestore
        await db.collection('payments').doc(order.order_id).set({
            uid: context.auth.uid,
            orderId: order.order_id,
            amount: amount,
            planName: planName,
            status: 'created',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return {
            payment_session_id: order.payment_session_id,
            order_id: order.order_id
        };

    } catch (error) {
        console.error('[Cashfree] Order Creation Error:', error.response?.data || error.message);
        throw new functions.https.HttpsError('internal', 'Payment service currently unavailable.');
    }
});

/**
 * Cloud Function: Cashfree Webhook
 */
exports.cashfreeWebhook = functions.region('us-central1').https.onRequest(async (req, res) => {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;

    if (!signature || !timestamp || !SECRET_KEY) {
        return res.status(400).send('Missing signature or secret');
    }

    // Verify Cashfree Webhook Signature
    const rawBody = req.rawBody.toString();
    const expectedSignature = crypto
        .createHmac('sha256', SECRET_KEY)
        .update(timestamp + rawBody)
        .digest('base64');

    if (expectedSignature !== signature) {
        console.error('[Cashfree Webhook] Invalid Signature');
        return res.status(400).send('Invalid signature');
    }

    const payload = req.body;
    console.log('[Cashfree Webhook] Received:', payload.type);

    if (payload.type === 'PAYMENT_SUCCESS_WEBHOOK') {
        const data = payload.data;
        const orderId = data.order.order_id;
        const payment = data.payment;

        const paymentDoc = await db.collection('payments').doc(orderId).get();
        if (!paymentDoc.exists) {
            console.error('[Cashfree Webhook] Payment record not found:', orderId);
            return res.status(404).send('Payment not found');
        }

        const paymentData = paymentDoc.data();
        const uid = paymentData.uid;

        await db.collection('payments').doc(orderId).update({
            status: 'success',
            cfPaymentId: payment.cf_payment_id,
            verifiedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        if (uid) {
            const role = paymentData.planName?.toLowerCase().includes('pro') ? 'admin' : 'organizer';
            await db.collection('users').doc(uid).update({
                role: role,
                subscriptionStatus: 'active',
                currentPlan: paymentData.planName,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`[Cashfree Webhook] Subscription Activated for ${uid}`);
        }
    }

    return res.status(200).send('OK');
});




/**
 * ─── TELEGRAM NOTIFICATIONS INTEGRATION ───
 */

/**
 * Helper to safely push messages to the Telegram Bot API
 */
async function sendTelegramNotification(messageText) {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
        console.log('Telegram credentials missing, skipping notification.');
        return;
    }

    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        await axios.post(url, {
            chat_id: CHAT_ID,
            text: messageText,
            parse_mode: 'HTML'  // Allow basic bold/italics
        });
        console.log('Telegram notification sent successfully');
    } catch (error) {
        console.error('Failed to send Telegram notification:', error.message);
    }
}

/**
 * Trigger: On New Demo Request (Including DFY)
 */
exports.notifyOnNewDemoRequest = functions.firestore
    .document('demoRequests/{docId}')
    .onCreate(async (snap, context) => {
        const data = snap.data();

        let interestTag = 'Normal Platform Demo';
        if (data.interestType === 'DoneForYou') {
            interestTag = '🤯 ✨ Done-For-You Services Lead ✨ 🤯';
        }

        const msg = `
🚨 <b>New Lead form submitted!</b>

<b>Name:</b> ${data.name || 'N/A'}
<b>Company/Institute:</b> ${data.companyName || 'N/A'}
<b>Role:</b> ${data.role || 'N/A'}
<b>Email:</b> ${data.email || 'N/A'}
<b>Phone / WhatsApp:</b> ${data.phone || 'N/A'}

<b>Requested Type:</b> ${interestTag}
<b>Requested Events:</b> ${Array.isArray(data.eventTypes) ? data.eventTypes.join(', ') : 'None specified'}
<b>Preferred Call Time:</b> ${data.selectedDate || 'Any'} @ ${data.selectedTimeSlot || 'Any'}
`;
        await sendTelegramNotification(msg);
    });

/**
 * Trigger: On New Campus Partner Application
 */
exports.notifyOnNewCampusPartner = functions.firestore
    .document('campusPartners/{docId}')
    .onCreate(async (snap, context) => {
        const data = snap.data();

        const msg = `
🎓 <b>New Campus Partner Application!</b>

<b>Name:</b> ${data.name || 'N/A'}
<b>College:</b> ${data.college || 'N/A'} (${data.cityState || 'N/A'})
<b>Year/Course:</b> ${data.yearCourse || 'N/A'}
<b>Campus Role:</b> ${data.role || 'N/A'}

<b>Phone/WhatsApp:</b> ${data.phone || 'N/A'}
<b>Email:</b> ${data.email || 'N/A'}

<b>Clubs:</b> ${data.clubAffiliation || 'None'}
<b>Their Plan:</b> 
<i>"${data.promotionPlan || 'No plan given.'}"</i>
`;
        await sendTelegramNotification(msg);
    });

/**
 * ─── GEMINI AI INTEGRATION ───
 */

/**
 * Trigger: Callable function to generate syllabus-aware problem statements via Gemini
 */
exports.generateProblemStatements = functions.https.onCall(async (data, context) => {
    // Only allow logged in organizers to generate problems
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication.');
    }

    const { board = 'Unknown', classLevel = 'Unknown', streams = [], theme = '', difficulty = 'Intermediate' } = data;
    const apiKey = process.env.GEMINI_API_KEY;

    // Gracefully handle missing key
    if (!apiKey) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            'Gemini API Key is missing. Please ask the administrator to configure GEMINI_API_KEY in the Firebase Functions environments.'
        );
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are an expert educational curriculum designer in India. Generate 5 highly relevant problem statements for a hackathon/event based on the following criteria:
Board: ${board}
Class/Year: ${classLevel}
Stream(s): ${streams.join(', ')}
Theme: ${theme}
Difficulty: ${difficulty}

Return ONLY a valid JSON array of 5 objects matching this exact schema:
[
  {
     "title": "String, max 60 chars",
     "description": "String, 2-4 lines explaining the exact problem to solve",
     "learningOutcomes": ["Skill 1", "Skill 2"],
     "suggestedCriteria": ["Innovation", "Technical Execution"]
  }
]`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        let problems = [];
        try {
            problems = JSON.parse(response.text);
        } catch (parseError) {
            console.error('Failed to parse AI response', response.text);
            throw new functions.https.HttpsError('internal', 'AI returned an unparseable response.');
        }

        return { problems };
    } catch (error) {
        console.error('AI Generator Error:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Unknown AI generation error');
    }
});

/**
 * ─── PARTICIPANT ENGAGEMENT (ANTI-GHOSTING) ───
 */

/**
 * Trigger: On Registration Create/Update
 * Computes `eventsRegistered` and `eventsCheckedIn`
 */
exports.updateEngagementOnRegistration = functions.firestore
    .document('registrations/{regId}')
    .onWrite(async (change, context) => {
        const before = change.before.exists ? change.before.data() : null;
        const after = change.after.exists ? change.after.data() : null;

        if (!after && before) {
            // Deletion: Decrement registered, and checkedIn if applicable
            const userId = before.userId;
            if (!userId) return null;

            const decrementReg = admin.firestore.FieldValue.increment(-1);
            const decrementCheck = before.isCheckedIn ? admin.firestore.FieldValue.increment(-1) : admin.firestore.FieldValue.increment(0);

            return db.collection('users').doc(userId).set({
                stats: { eventsRegistered: decrementReg, eventsCheckedIn: decrementCheck }
            }, { merge: true });
        }

        const userId = after.userId;
        if (!userId) return null;

        let incReg = 0;
        let incCheck = 0;

        // New Registration
        if (!before && after) {
            incReg = 1;
            if (after.isCheckedIn) incCheck = 1;
        }
        // Updated Registration
        else if (before && after) {
            if (!before.isCheckedIn && after.isCheckedIn) incCheck = 1;
            if (before.isCheckedIn && !after.isCheckedIn) incCheck = -1;
        }

        if (incReg === 0 && incCheck === 0) return null;

        return db.collection('users').doc(userId).set({
            stats: {
                eventsRegistered: admin.firestore.FieldValue.increment(incReg),
                eventsCheckedIn: admin.firestore.FieldValue.increment(incCheck)
            }
        }, { merge: true });
    });

/**
 * Trigger: On Submission Create
 * Computes `projectsSubmitted` for all team members
 */
exports.updateEngagementOnSubmission = functions.firestore
    .document('submissions/{subId}')
    .onCreate(async (snap, context) => {
        const data = snap.data();
        let userIds = [];

        // If it's a team submission, fetch team members
        if (data.teamId) {
            const teamDoc = await db.collection('teams').doc(data.teamId).get();
            if (teamDoc.exists) {
                const teamData = teamDoc.data();
                userIds = [...new Set([teamData.leaderId, ...(teamData.members || [])])].filter(Boolean);
            }
        }
        // Individual submission
        else if (data.userId) {
            userIds = [data.userId];
        }

        if (userIds.length === 0) return null;

        const batch = db.batch();
        userIds.forEach(uid => {
            const userRef = db.collection('users').doc(uid);
            batch.set(userRef, {
                stats: { projectsSubmitted: admin.firestore.FieldValue.increment(1) }
            }, { merge: true });
        });

        return batch.commit();
    });
/**
 * Cloud Function: Validate Phone Uniqueness
 * Allows unauthenticated users to check if a phone number is already registered.
 */
exports.validatePhoneUniqueness = functions.region('us-central1').https.onCall(async (data, context) => {
    const { phone } = data;
    if (!phone) {
        throw new functions.https.HttpsError('invalid-argument', 'Phone number is required.');
    }

    try {
        const snap = await db.collection('users').where('phone', '==', phone).limit(1).get();
        return { isUnique: snap.empty };
    } catch (error) {
        console.error('Error checking phone uniqueness:', error);
        throw new functions.https.HttpsError('internal', 'Search failed.');
    }
});
