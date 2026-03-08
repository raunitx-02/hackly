export const BOOK_CALL_CONFIG = {
    modalTitle: 'Book a call with our team',
    modalSubtitle: 'Share a few details and pick a time that works for you. We’ll send a calendar invite on email.',
    infoSection: {
        heading: 'What you’ll get in this call',
        bullets: [
            'Understand how the platform fits your school / coaching / college.',
            'See a live walkthrough of running an event from start to finish.',
            'Get a pricing estimate tailored to your student strength.'
        ]
    },
    formOptions: {
        institutionTypes: [
            'CBSE School',
            'ICSE School',
            'State Board School',
            'Coaching Institute / Test Prep',
            'College / University',
            'Other'
        ],
        roles: [
            'Principal / Director',
            'Teacher / Faculty',
            'TPO / Placement',
            'Club / Fest Coordinator',
            'Other'
        ],
        studentStrengths: [
            '< 500',
            '500 – 1,500',
            '1,500 – 5,000',
            '> 5,000'
        ],
        contactChannels: [
            'Email',
            'WhatsApp'
        ],
        eventTypes: [
            'Hackathon',
            'Ideathon',
            'Tech Fest',
            'Startup Challenge',
            'Other'
        ]
    },
    timeSlots: [
        '11:00 AM – 11:30 AM',
        '3:00 PM – 3:30 PM',
        '7:00 PM – 7:30 PM'
    ],
    timeNote: 'All times shown in IST. We’ll confirm the slot over email.',
    submitText: 'Submit & request a call',
    whatsappText: 'Prefer WhatsApp? Just message us at',
    whatsappNumber: '+91 9876543210' // Replace with actual number later
};
