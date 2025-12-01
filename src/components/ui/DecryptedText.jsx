import { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';

const styles = {
  wrapper: {
    display: 'inline-block',
    whiteSpace: 'pre-wrap',
  },
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0,0,0,0)',
    border: 0,
  },
};

export default function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = false,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
  className = '',
  parentClassName = '',
  encryptedClassName = '',
  animateOn = 'hover', // 'hover' or 'view'
  onAnimationComplete = () => { },
  style = {},
}) {
  const [displayText, setDisplayText] = useState(text);
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

  const getRandomChar = (originalChar) => {
    if (useOriginalCharsOnly) {
      const originalChars = text.split('');
      return originalChars[Math.floor(Math.random() * originalChars.length)];
    }
    return characters[Math.floor(Math.random() * characters.length)];
  };

  const startAnimation = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    let currentText = text.split('');
    let revealedText = Array(text.length).fill(false);

    const animate = (index) => {
      if (index >= text.length) {
        setIsAnimating(false);
        onAnimationComplete();
        return;
      }

      let iterations = 0;
      const interval = setInterval(() => {
        if (iterations >= maxIterations) {
          clearInterval(interval);
          revealedText[index] = true;
          currentText[index] = text[index];
          setDisplayText(currentText.join(''));
          if (sequential) {
            animate(index + 1);
          } else {
            setTimeout(() => animate(index + 1), speed / 2);
          }
          return;
        }

        currentText[index] = getRandomChar(text[index]);
        setDisplayText(currentText.join(''));
        iterations++;
      }, speed);
    };

    const animateAll = () => {
      const intervals = text.split('').map((char, index) => {
        let iterations = 0;
        return setInterval(() => {
          if (iterations >= maxIterations) {
            clearInterval(intervals[index]);
            revealedText[index] = true;
            currentText[index] = text[index];
            setDisplayText(currentText.join(''));
            if (revealedText.every(Boolean)) {
              setIsAnimating(false);
              onAnimationComplete();
            }
            return;
          }

          let indicesToAnimate = [];
          if (revealDirection === 'start') indicesToAnimate = [index];
          else if (revealDirection === 'end')
            indicesToAnimate = [text.length - 1 - index];
          else if (revealDirection === 'center') {
            const mid = Math.floor(text.length / 2);
            if (index < mid) indicesToAnimate = [mid - index - 1, mid + index];
            else if (text.length % 2 !== 0 && index === mid)
              indicesToAnimate = [mid];
          } else {
            indicesToAnimate = [index]; // Default to start
          }

          indicesToAnimate.forEach((i) => {
            if (i < text.length && !revealedText[i]) {
              currentText[i] = getRandomChar(text[i]);
            }
          });

          setDisplayText(currentText.join(''));
          iterations++;
        }, speed);
      });
    };

    if (sequential) {
      animate(0);
    } else {
      animateAll();
    }
  };

  const handleMouseEnter = () => {
    if (animateOn === 'hover' && !isAnimating) {
      startAnimation();
    }
  };

  return (
    <motion.span
      ref={ref}
      style={{ ...styles.wrapper, display: undefined }}
      className={`inline-block ${parentClassName}`}
      onMouseEnter={handleMouseEnter}
      aria-label={text}
      role="button"
      tabIndex={0}
      onFocus={handleMouseEnter}
    >
      <span style={styles.srOnly}>{text}</span>
      {displayText.split('').map((char, index) => (
        <span
          key={index}
          className={`${char === text[index] ? className : encryptedClassName
            }`}
          style={style}
          aria-hidden="true"
        >
          {char}
        </span>
      ))}
    </motion.span>
  );
}
