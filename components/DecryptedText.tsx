'use client';

import { useState } from 'react';
import { useTextScramble } from '@/lib/ui/hooks';

interface DecryptedTextProps {
    text: string;
    speed?: number;
    maxIterations?: number;
    className?: string;
    encryptedClassName?: string;
    animateOn?: 'view' | 'hover';
}

export default function DecryptedText({
    text,
    speed = 50,
    maxIterations = 10,
    className = '',
    encryptedClassName = '',
    animateOn = 'hover',
}: DecryptedTextProps) {
    const [isHovering, setIsHovering] = useState(false);
    const { displayText, scramble } = useTextScramble(text, {
        speed,
        maxIterations,
        animateOn,
    });

    const handleMouseEnter = () => {
        if (animateOn === 'hover') {
            setIsHovering(true);
            scramble();
        }
    };

    const handleMouseLeave = () => {
        if (animateOn === 'hover') {
            setIsHovering(false);
        }
    };

    return (
        <span
            className={`inline-block whitespace-nowrap`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <span className={className}>
                {displayText.split('').map((char, index) => {
                    const isOriginal = char === text[index];
                    return (
                        <span
                            key={index}
                            className={isOriginal ? undefined : encryptedClassName}
                        >
                            {char}
                        </span>
                    );
                })}
            </span>
        </span>
    );
}
