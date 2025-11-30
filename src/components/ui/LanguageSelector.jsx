import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const languages = [
  { id: 'java', name: 'Java', icon: '☕', color: '#b07219' },
  { id: 'python', name: 'Python', icon: '🐍', color: '#3572A5' },
  { id: 'cpp', name: 'C++', icon: '🚀', color: '#f34b7d' },
  { id: 'c', name: 'C', icon: 'Ⓒ', color: '#555555' },
];

const LanguageSelector = ({ currentLanguage, onLanguageChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedLang = languages.find(l => l.id === currentLanguage) || languages[0];

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="language-selector-container" ref={containerRef} style={{ position: 'relative', width: '140px', zIndex: 50 }}>
      <motion.button
        whileHover={{ scale: 1.02, borderColor: '#4b5563' }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          backgroundColor: '#1e1e1e',
          border: '1px solid #333',
          borderRadius: '8px',
          color: '#e0e0e0',
          cursor: 'pointer',
          fontSize: '0.9rem',
          boxShadow: isOpen ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : '0 2px 5px rgba(0,0,0,0.2)',
          outline: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.1rem' }}>{selectedLang.icon}</span>
          <span style={{ fontWeight: 500, fontFamily: '"Fira Code", monospace' }}>{selectedLang.name}</span>
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ fontSize: '0.7rem', opacity: 0.7 }}
        >
          ▼
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '8px',
              backgroundColor: '#1e1e1e',
              border: '1px solid #333',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              zIndex: 100
            }}
          >
            {languages.map((lang) => (
              <motion.div
                key={lang.id}
                onClick={() => {
                  onLanguageChange(lang.id);
                  setIsOpen(false);
                }}
                whileHover={{ backgroundColor: '#2d2d2d', x: 2 }}
                style={{
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  backgroundColor: currentLanguage === lang.id ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0, 0, 0, 0)',
                  color: currentLanguage === lang.id ? '#60a5fa' : '#a0a0a0',
                  transition: 'color 0.2s',
                  borderLeft: currentLanguage === lang.id ? '3px solid #60a5fa' : '3px solid rgba(0, 0, 0, 0)'
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{lang.icon}</span>
                <span style={{ fontFamily: '"Fira Code", monospace', fontSize: '0.9rem' }}>{lang.name}</span>
                {currentLanguage === lang.id && (
                  <motion.div
                    layoutId="activeCheck"
                    style={{ marginLeft: 'auto', fontSize: '0.8rem' }}
                  >
                    ✓
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;
