import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

const SlotMachineText = ({
    text,
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*',
    speed = 50, // Speed of character cycling
    lockInDelay = 200, // Delay between locking in each character
    className = '',
    animateOn = 'view', // 'view' or 'hover'
}) => {
    const [displayText, setDisplayText] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (animateOn === 'view') {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting && !isInView) {
                        setIsInView(true);
                        startAnimation();
                    }
                },
                { threshold: 0.1 }
            );

            if (ref.current) {
                observer.observe(ref.current);
            }

            return () => {
                if (ref.current) {
                    observer.unobserve(ref.current);
                }
            };
        }
    }, [animateOn, isInView]);

    const getRandomChar = () => {
        return characters[Math.floor(Math.random() * characters.length)];
    };

    const startAnimation = () => {
        if (isAnimating) return;
        setIsAnimating(true);

        const fullTextLength = text.length;
        let currentTextArray = Array(fullTextLength).fill('').map(() => getRandomChar());
        let lockedIndices = Array(fullTextLength).fill(false);

        // Interval to cycle random characters for unlocked positions
        const cycleInterval = setInterval(() => {
            currentTextArray = currentTextArray.map((char, index) => {
                if (lockedIndices[index]) {
                    return text[index];
                }
                return getRandomChar();
            });
            setDisplayText(currentTextArray.join(''));
        }, speed);

        // Timeout to lock in characters one by one
        text.split('').forEach((char, index) => {
            setTimeout(() => {
                lockedIndices[index] = true;
                // If it's the last character, clear the cycle interval
                if (index === fullTextLength - 1) {
                    clearInterval(cycleInterval);
                    setDisplayText(text); // Ensure final text is correct
                    setIsAnimating(false);
                }
            }, lockInDelay * (index + 1)); // Sequential delay
        });
    };

    const handleMouseEnter = () => {
        if (animateOn === 'hover' && !isAnimating) {
            startAnimation();
        }
    };

    return (
        <span
            ref={ref}
            className={className}
            onMouseEnter={handleMouseEnter}
            style={{ display: 'inline-block' }} // Removed monospace to match logo font
        >
            {displayText || text} {/* Show full text initially if not animating to prevent layout shift, or empty? Better to show random? Let's show text initially or space */}
        </span>
    );
};

export default SlotMachineText;
