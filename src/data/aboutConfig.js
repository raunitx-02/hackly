import {
    Zap,
    Rocket,
    ShieldCheck,
    Users,
    Mail,
    MessageSquare,
    Award,
    LineChart,
    Cpu,
    Briefcase
} from 'lucide-react';

export const ABOUT_COPY = {
    mission: {
        title: "Why Hackly Exists",
        paragraphs: [
            "Hackly helps Indian campuses run structured, scam-free, high-quality hackathons and events without spreadsheets, forms, and chaos.",
            "It is built specifically for schools, coaching institutes, and colleges in India, not generic Western tooling."
        ],
        focus: [
            { icon: Zap, title: "Simple for teachers", desc: "No tech expertise needed to manage registrations and teams." },
            { icon: Users, title: "Exciting for students", desc: "A professional platform to showcase their innovation." },
            { icon: ShieldCheck, title: "Reliable for admins", desc: "Transparent judging and scam-free result aggregation." }
        ]
    },
    story: {
        title: "From campus chaos to one dashboard",
        paragraphs: [
            "Organising and seeing hackathons/fests where registrations, teams, judges, and results were scattered across Excel, Google Forms, WhatsApp, etc. was common.",
            "Realising there was no simple tool built for Indian education to manage all this end-to-end led to the birth of Hackly.",
            "Hackly was started to solve that pain for yourself and then for other campuses."
        ]
    },
    founder: {
        title: "Who’s building Hackly?",
        name: "Raunit Raj",
        tagline: "Student founder & full-stack builder of Hackly",
        location: "Based in India",
        image: "/founder-profile.png",
        bio: "Hackly has been designed and developed end-to-end by a single student founder. I built it using a modern web development stack including React, HTML, CSS, JavaScript, Tailwind CSS, and powered the backend with Firebase and Firestore. With experience in organising campus events and hackathons, I've turned those learnings into features that solve real problems for schools, coaching centers, and colleges.",
        techStack: ['React', 'JavaScript', 'HTML & CSS', 'Firebase & Firestore', 'Tailwind CSS', 'Vite', 'Lucide Icons'],
        email: "raunit@luckly.online", // Placeholder, user mentioned mailto link configurable via constant
        collab: {
            title: "Want to collaborate or invest early?",
            text: "I’m actively looking to partner with institutions, mentors, and early supporters who believe in building better hackathons for Indian students."
        }
    },
    roadmap: {
        title: "What’s coming next",
        items: [
            { id: 1, title: "Automated certificates", desc: "Instant certification for all participants and winners.", status: "Upcoming" },
            { id: 2, title: "Sponsor management", desc: "Custom portals and brand visibility tools.", status: "Upcoming" },
            { id: 3, title: "Deeper analytics", desc: "Advanced insights for principals and management.", status: "Upcoming" },
            { id: 4, title: "Student profiles", desc: "Persistent project portfolios for every student.", status: "Upcoming" }
        ]
    },
    cta: {
        heading: "Ready to run your next campus hackathon with Hackly?",
        subheading: "Book a quick demo call directly with the founder and see how it fits your institution.",
        buttonText: "Book a demo with Raunit"
    }
};
