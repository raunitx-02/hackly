// Configuration for the AI Syllabus-Aware Problem Statement Generator

export const AI_GENERATOR_CONFIG = {
    boards: [
        { id: 'cbse', label: 'CBSE' },
        { id: 'icse', label: 'ICSE/ISC' },
        { id: 'state', label: 'State Board' },
        { id: 'college', label: 'College / University' },
        { id: 'other', label: 'Other / Open' }
    ],
    classes: [
        { id: 'class_8', label: 'Class 8' },
        { id: 'class_9', label: 'Class 9' },
        { id: 'class_10', label: 'Class 10' },
        { id: 'class_11', label: 'Class 11' },
        { id: 'class_12', label: 'Class 12' },
        { id: 'ug_1', label: 'UG 1st Year' },
        { id: 'ug_2', label: 'UG 2nd Year' },
        { id: 'ug_3', label: 'UG 3rd Year' },
        { id: 'ug_4', label: 'UG 4th Year' },
        { id: 'pg', label: 'Post Graduate' }
    ],
    streams: [
        { id: 'science', label: 'Science' },
        { id: 'maths', label: 'Mathematics' },
        { id: 'cs', label: 'Computer Science' },
        { id: 'commerce', label: 'Commerce / Business' },
        { id: 'humanities', label: 'Humanities / Arts' },
        { id: 'engineering', label: 'Engineering' },
        { id: 'medical', label: 'Medical / Biology' },
        { id: 'general', label: 'General / Open' }
    ],
    themes: [
        'Sustainability & Climate Change',
        'Financial Literacy',
        'AI in Education',
        'Smart Cities',
        'Healthcare Tech',
        'Cybersecurity',
        'EdTech Solutions',
        'Rural Development',
        'Space Exploration',
    ],
    difficulties: [
        { id: 'beginner', label: 'Beginner' },
        { id: 'intermediate', label: 'Intermediate' },
        { id: 'advanced', label: 'Advanced' }
    ]
};
