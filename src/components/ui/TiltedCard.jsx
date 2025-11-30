import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

const TiltedCard = ({ 
  children, 
  className = '', 
  containerHeight = '300px',
  containerWidth = '100%',
  imageSrc,
  altText = 'Tilted card image',
  captionText = '',
  scaleOnHover = 1.1,
  rotateAmplitude = 14,
  showMobileWarning = true,
  showTooltip = true,
  overlayContent = null,
  displayOverlayContent = false
}) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 30, damping: 10 });
  const mouseY = useSpring(y, { stiffness: 30, damping: 10 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [rotateAmplitude, -rotateAmplitude]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-rotateAmplitude, rotateAmplitude]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXVal = e.clientX - rect.left;
    const mouseYVal = e.clientY - rect.top;
    const xPct = mouseXVal / width - 0.5;
    const yPct = mouseYVal / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`tilted-card-container ${className}`}
      style={{
        height: containerHeight,
        width: containerWidth,
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="tilted-card-inner"
        style={{
          width: '100%',
          height: '100%',
          rotateX,
          rotateY,
          scale: 1,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale: scaleOnHover }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {imageSrc && (
            <img 
                src={imageSrc} 
                alt={altText} 
                className="tilted-card-image"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '15px',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                }}
            />
        )}
        
        {displayOverlayContent && overlayContent && (
          <div className="tilted-card-overlay">
            {overlayContent}
          </div>
        )}

        {children}
      </motion.div>

      {showTooltip && captionText && (
        <motion.div 
            className="tilted-card-caption"
            style={{
                x: rotateY,
                y: rotateX,
            }}
        >
            {captionText}
        </motion.div>
      )}

      <style>{`
        .tilted-card-container {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .tilted-card-inner {
            position: relative;
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 50px rgba(0,0,0,0.2);
        }
        .tilted-card-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 2rem;
            z-index: 2;
            transform: translateZ(30px); /* Pop out effect */
        }
        .tilted-card-caption {
            position: absolute;
            bottom: -40px;
            left: 0;
            right: 0;
            text-align: center;
            color: white;
            font-size: 0.9rem;
            opacity: 0.8;
            pointer-events: none;
        }
      `}</style>
    </motion.div>
  );
};

export default TiltedCard;
