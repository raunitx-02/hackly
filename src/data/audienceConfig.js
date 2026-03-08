import { School, Briefcase, Building2 } from 'lucide-react';

export const AUDIENCE_CARDS = [
    {
        id: 'schools',
        title: 'CBSE / ICSE / State Board Schools',
        shortLine: 'Run science fairs, innovation days, ATL hackathons, and inter-house competitions with zero paperwork.',
        icon: School,
        bullets: [
            'Replace manual registrations and Excel tracking with a single dashboard.',
            'Engage students in project-based learning and coding competitions.',
            'Share links easily on WhatsApp, school website, and notice boards.'
        ]
    },
    {
        id: 'coaching',
        title: 'Coaching Institutes & Test Prep Centers',
        shortLine: 'Add high-energy hackathons and idea challenges to your academic calendar.',
        icon: Briefcase,
        bullets: [
            'Run internal contests across batches and branches.',
            'Spot top performers and showcase their projects to parents.',
            'Use analytics to see which centres and batches are most active.'
        ]
    },
    {
        id: 'colleges',
        title: 'Colleges & Universities',
        shortLine: 'Power your tech fests, ideathons, startup challenges, and placement-focused hackathons.',
        icon: Building2,
        bullets: [
            'Give clubs and departments a common platform for events.',
            'Bring external judges, alumni, and sponsors into the same workflow.',
            'Export reports for NAAC, NBA, and placement documentation in minutes.'
        ]
    }
];
