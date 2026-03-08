export const ORGANIZER_CONFIG = {
    labels: {
        registrationMode: 'Registration Mode',
        openRegistration: 'Open Registration',
        applicationReview: 'Application Review',
        anonymousJudging: 'Anonymous Judging (Hide Team Names)',
        publicProjects: 'Make Projects Public Post-Event',
        applications: 'Applications',
        reports: 'Reports',
        judges: 'Judges',
        settings: 'Settings',
        downloadParticipationCert: 'Download Participation Certificates',
        downloadWinnerCert: 'Download Winner Certificates',
        downloadEventReport: 'Download Event Report (Excel)',
        assignJudges: 'Assign Judges',
        searchProjects: 'Search Projects...',
    },
    registrationModes: [
        { id: 'open', label: 'Open Registration', desc: 'Anyone can register and instantly form teams.' },
        { id: 'review', label: 'Application Review', desc: 'Participants must apply. Organizers manually approve teams.' }
    ],
    applicationFields: [
        { id: 'motivation', label: 'Why do you want to participate?', type: 'textarea' },
        { id: 'skills', label: 'Key Skills / Tech Stack', type: 'text' },
        { id: 'pastProjects', label: 'Links to Past Projects / GitHub (Optional)', type: 'text' },
    ],
    judgingFilters: ['All', 'To be scored', 'In progress', 'Scored'],
};
