/**
 * Computes a deterministic "Engagement Score" (Reliability) from 0 to 100 
 * for an event participant, penalizing "ghosting" (registering but not showing up).
 * 
 * @param {Object} stats - The user's accumulated event stats.
 * @param {number} stats.eventsRegistered - Total events they signed up for
 * @param {number} stats.eventsCheckedIn - Total events they proved attendance
 * @param {number} stats.projectsSubmitted - Total projects they actually submitted
 * @param {number} stats.winsOrTopPositions - (Optional) extra merits 
 * @returns {number} The calculated score clamped between 0 and 100
 */
export function calculateEngagementScore(stats) {
    if (!stats || stats.eventsRegistered === 0) {
        return 0; // No history yet
    }

    const {
        eventsRegistered = 0,
        eventsCheckedIn = 0,
        projectsSubmitted = 0,
        winsOrTopPositions = 0
    } = stats;

    // Start with a neutral baseline of 50 for registered users
    let score = 50;

    // Positive Actions
    score += (eventsCheckedIn * 10);
    score += (projectsSubmitted * 20);
    score += (winsOrTopPositions * 15);

    // Negative Actions (Ghosting)
    // If you register but don't check-in, you lose reputation.
    const ghostedEvents = Math.max(0, eventsRegistered - eventsCheckedIn);
    score -= (ghostedEvents * 15);

    // Keep bounded between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Returns UI badge properties (color and tier label) based on the score.
 */
export function getReliabilityTier(score, registeredCount) {
    if (registeredCount === 0) return { label: 'New User', color: '#64748B', bg: 'rgba(100, 116, 139, 0.1)' };

    if (score >= 70) return { label: 'High Reliability', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' };
    if (score >= 40) return { label: 'Medium', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' };
    return { label: 'Low Reliability', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' };
}
