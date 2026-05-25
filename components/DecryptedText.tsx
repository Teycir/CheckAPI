'use client';

import { useRef } from 'react';
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
    const isHoveringRef = useRef(false);
    const { displayText, scramble } = useTextScramble(text, {
        speed,
        maxIterations,
        animateOn,
    });

    const handleMouseEnter = () => {
        if (animateOn === 'hover') {
            isHoveringRef.current = true;
            scramble();
        }
    };

    const handleMouseLeave = () => {
        if (animateOn === 'hover') {
            isHoveringRef.current = false;
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
