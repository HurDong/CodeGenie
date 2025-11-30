import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const GridMotion = ({ items = [], gradientColor = 'black' }) => {
  const gridRef = useRef(null);
  const rowRefs = useRef([]);
  const mouseXRef = useRef(window.innerWidth / 2);

  const totalItems = 28;
  const defaultItems = Array.from({ length: totalItems }, (_, index) => `Item ${index + 1}`);
  const combinedItems = items.length > 0 ? items.slice(0, totalItems) : defaultItems;

  useEffect(() => {
    gsap.ticker.lagSmoothing(0);

    const handleMouseMove = (e) => {
      mouseXRef.current = e.clientX;
    };

    const updateMotion = () => {
      const maxMoveAmount = 300;
      const baseDuration = 0.8;
      const inertiaFactors = [0.6, 0.4, 0.3, 0.2];

      rowRefs.current.forEach((row, index) => {
        if (row) {
          const direction = index % 2 === 0 ? 1 : -1;
          const moveAmount = ((mouseXRef.current / window.innerWidth) * maxMoveAmount - maxMoveAmount / 2) * direction;

          gsap.to(row, {
            x: moveAmount,
            duration: baseDuration + inertiaFactors[index % inertiaFactors.length],
            ease: 'power3.out',
            overwrite: 'auto'
          });
        }
      });
    };

    const removeAnimationLoop = gsap.ticker.add(updateMotion);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      removeAnimationLoop();
    };
  }, []);

  return (
    <div className="grid-motion-container" ref={gridRef}>
      <div className="grid-motion-overlay"></div>
      <div className="grid-motion-content">
        {Array.from({ length: 4 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid-motion-row"
            ref={(el) => (rowRefs.current[rowIndex] = el)}
          >
            {[...combinedItems, ...combinedItems].map((item, itemIndex) => (
              <div key={`${rowIndex}-${itemIndex}`} className="grid-motion-item">
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>
      <style>{`
        .grid-motion-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background-color: #0f172a; /* Fallback */
          z-index: 0;
        }
        
        .grid-motion-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at center, transparent 0%, #0f172a 90%);
            z-index: 2;
            pointer-events: none;
        }

        .grid-motion-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-15deg) scale(1.2);
            width: 150%;
            height: 150%;
            display: flex;
            flex-direction: column;
            gap: 2rem;
            z-index: 1;
            opacity: 0.15; /* Subtle background */
        }

        .grid-motion-row {
          display: flex;
          gap: 2rem;
          white-space: nowrap;
          will-change: transform;
        }

        .grid-motion-item {
          width: 200px;
          height: 120px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.3);
          font-family: monospace;
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
};

export default GridMotion;
