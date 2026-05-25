"use client";
import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

const CYBER_CHARS = "!@#$%^&*()_+{}|:<>?0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

interface TextScrambleProps {
  children: string;
  className?: string;
  duration?: number;
}

export function TextScramble({
  children,
  className = "",
  duration = 1.5,
}: TextScrambleProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (!isInView) return;

    const chars = CYBER_CHARS.split("");
    const targetText = children;
    const length = targetText.length;
    let frame = 0;

    const intervalId = setInterval(() => {
      let output = "";
      const progress = frame / (duration * 30);

      for (let i = 0; i < length; i++) {
        const resolveThreshold = Math.floor(progress * length);

        if (i < resolveThreshold) {
          output += targetText[i];
        } else {
          output +=
            Math.random() < 0.1
              ? " "
              : chars[Math.floor(Math.random() * chars.length)];
        }
      }

      setDisplayText(output);
      frame++;

      if (frame > duration * 30 + 12) {
        setDisplayText(targetText);
        clearInterval(intervalId);
      }
    }, 40);

    return () => clearInterval(intervalId);
  }, [isInView, children, duration]);

  return (
    <span ref={ref} className={className}>
      {displayText.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}
