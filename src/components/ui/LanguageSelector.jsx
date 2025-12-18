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
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`lang-select-btn ${isOpen ? 'active' : ''}`}
      >
        <div className="lang-selected">
          <span className="lang-icon">{selectedLang.icon}</span>
          <span className="lang-name">{selectedLang.name}</span>
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="lang-arrow"
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
            className="lang-dropdown"
          >
            {languages.map((lang) => (
              <motion.div
                key={lang.id}
                onClick={() => {
                  onLanguageChange(lang.id);
                  setIsOpen(false);
                }}
                className={`lang-option ${currentLanguage === lang.id ? 'selected' : ''}`}
                whileHover={{ x: 2 }}
              >
                <span className="lang-icon">{lang.icon}</span>
                <span className="lang-name">{lang.name}</span>
                {currentLanguage === lang.id && (
                  <motion.div
                    layoutId="activeCheck"
                    className="lang-check"
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
