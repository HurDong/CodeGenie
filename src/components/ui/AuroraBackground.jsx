import React, { useEffect } from "react";
import { motion, useMotionTemplate, useMotionValue, animate } from "framer-motion";

const COLORS = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];

export const AuroraBackground = ({ children, className = "", ...props }) => {
    const color = useMotionValue(COLORS[0]);
    const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #020617 50%, ${color})`;

    useEffect(() => {
        animate(color, COLORS, {
            ease: "easeInOut",
            duration: 10,
            repeat: Infinity,
            repeatType: "mirror",
        });
    }, []);

    return (
        <motion.section
            style={{ backgroundImage }}
            className={`aurora-background ${className}`}
            {...props}
        >
            <div style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
            }}>
                {/* Optional: Add a subtle noise texture overlay for more "premium" feel */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.05,
                    backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')"
                }}></div>
            </div>
            <div style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                height: '100%'
            }}>
                {children}
            </div>
        </motion.section>
    );
};

export default AuroraBackground;
