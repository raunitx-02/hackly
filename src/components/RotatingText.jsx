import { useState, useEffect } from 'react';

/**
 * RotatingText Component
 * 
 * Animates through an array of strings with a fade + slide transition.
 * Adjusts width dynamically based on the current word's size.
 */
export default function RotatingText({ words = [], interval = 2000, className = '', style = {} }) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (words.length <= 1) return;

        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length);
        }, interval);

        return () => clearInterval(timer);
    }, [words.length, interval]);

    return (
        <span
            className={`${className} gradient-text animate-rolling-text`}
            key={index}
            style={{
                display: 'inline-block',
                verticalAlign: 'middle',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                ...style
            }}
        >
            {words[index]}
        </span>
    );
}
