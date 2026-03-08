import { School, Rocket, Trophy } from 'lucide-react';

export const HOW_IT_WORKS_STEPS = [
    {
        id: 'step-1',
        stepLabel: 'Step 1',
        title: 'Onboard & Set Up',
        icon: School,
        bullets: [
            'Book a quick 20-30 min demo with our team.',
            'We create your school / college account with your logo and colours.',
            'You approve the first event template or share your own format.',
        ]
    },
    {
        id: 'step-2',
        stepLabel: 'Step 2',
        title: 'Launch Your Event',
        icon: Rocket,
        bullets: [
            'Create a hackathon, ideathon, or competition in a few clicks.',
            'Share one link with students on WhatsApp, email, and notice boards.',
            'Students register, form teams, and submit projects online.',
        ]
    },
    {
        id: 'step-3',
        stepLabel: 'Step 3',
        title: 'Judge & Announce Winners',
        icon: Trophy,
        bullets: [
            'Invite judges and faculty to score entries on a simple dashboard.',
            'Scores are calculated automatically with your own rubric.',
            'Publish the live leaderboard and download reports in seconds.',
        ]
    }
];
