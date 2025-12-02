import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CODE_SNIPPET = `class Solution {
    public int solve(int[] nums) {
        // CodeGenie helps you think
        int left = 0, right = nums.length - 1;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] > nums[right]) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        return nums[left];
    }
}`;

const CodingVisual = () => {
    const [displayedCode, setDisplayedCode] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < CODE_SNIPPET.length) {
            const timeout = setTimeout(() => {
                setDisplayedCode(prev => prev + CODE_SNIPPET[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, 30 + Math.random() * 50); // Random typing speed

            return () => clearTimeout(timeout);
        } else {
            // Reset after delay
            const resetTimeout = setTimeout(() => {
                setDisplayedCode('');
                setCurrentIndex(0);
            }, 5000);
            return () => clearTimeout(resetTimeout);
        }
    }, [currentIndex]);

    // Simple syntax highlighting helper
    const highlightCode = (code) => {
        return code.split(/(\s+)/).map((token, index) => {
            if (['class', 'public', 'int', 'return', 'if', 'else', 'while'].includes(token)) {
                return <span key={index} style={{ color: '#c678dd' }}>{token}</span>; // Purple
            }
            if (['solve', 'main'].includes(token)) {
                return <span key={index} style={{ color: '#61afef' }}>{token}</span>; // Blue
            }
            if (token.startsWith('//')) {
                return <span key={index} style={{ color: '#5c6370', fontStyle: 'italic' }}>{token}</span>; // Grey comment
            }
            if (token.match(/^\d+$/)) {
                return <span key={index} style={{ color: '#d19a66' }}>{token}</span>; // Orange number
            }
            return <span key={index} style={{ color: '#abb2bf' }}>{token}</span>; // Default
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{
                background: 'rgba(30, 41, 59, 0.7)',
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
                width: '100%',
                maxWidth: '650px',
                overflow: 'hidden',
                fontFamily: '"Fira Code", monospace',
                fontSize: '16px',
                lineHeight: '1.5',
            }}
        >
            {/* Terminal Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }}></div>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }}></div>
                </div>
                <div style={{ marginLeft: '16px', color: '#94a3b8', fontSize: '12px' }}>Solution.java</div>
            </div>

            {/* Code Content */}
            <div style={{ padding: '20px', minHeight: '400px', whiteSpace: 'pre-wrap' }}>
                {highlightCode(displayedCode)}
                <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    style={{
                        display: 'inline-block',
                        width: '8px',
                        height: '16px',
                        background: '#3b82f6',
                        marginLeft: '2px',
                        verticalAlign: 'middle'
                    }}
                />
            </div>
        </motion.div>
    );
};

export default CodingVisual;
