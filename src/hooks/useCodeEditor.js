import { useState, useRef, useCallback } from 'react';

// Configuration
const TAB_SIZE = 4;
const TAB_STRING = " ".repeat(TAB_SIZE);
const HISTORY_LIMIT = 200;

export const useCodeEditor = (initialCode = '', initialLanguage = 'java') => {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);

  // History for Undo/Redo
  // Each entry: { code: string, cursor: number (selectionStart) }
  const historyRef = useRef([{ code: initialCode, cursor: 0 }]);
  const historyIndexRef = useRef(0);
  const editorRef = useRef(null); // Ref to the textarea/editor element

  // Helper: Save state to history
  const pushHistory = useCallback((newCode, cursor) => {
    const currentIndex = historyIndexRef.current;
    const history = historyRef.current;
    
    // Truncate future history (Redo stack)
    const newHistory = history.slice(0, currentIndex + 1);
    
    // Push new state
    newHistory.push({ code: newCode, cursor });
    
    // Enforce limit
    if (newHistory.length > HISTORY_LIMIT) {
        newHistory.shift();
    }

    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
  }, []);

  // Helper: Restore state from history
  const restoreHistory = useCallback((index) => {
    const history = historyRef.current;
    if (index < 0 || index >= history.length) return;

    const state = history[index];
    setCode(state.code);
    historyIndexRef.current = index;
    
    // Restore Cursor
    if (editorRef.current) {
        // We need setTimeout because React state update is async 
        // regarding the re-render of value, but sometimes immediate set works better.
        // For controlled inputs, usually we need to wait for render.
        setTimeout(() => {
            if (editorRef.current) {
                editorRef.current.selectionStart = state.cursor;
                editorRef.current.selectionEnd = state.cursor;
            }
        }, 0);
    }
  }, []);

  const undo = () => {
    if (historyIndexRef.current > 0) {
      restoreHistory(historyIndexRef.current - 1);
    }
  };

  const redo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      restoreHistory(historyIndexRef.current + 1);
    }
  };

  // Called when user types normally
  const handleValueChange = (newCode) => {
    setCode(newCode);
    // Note: We blindly push history on every change for now.
    // Optimization: Debounce or check for meaningful changes could look here.
    // For "Smart" behavior, we might want to get the cursor position too, 
    // but react-simple-code-editor's onValueChange doesn't provide it.
    // We rely on handleKeyDown for programmatic edits to save proper cursor.
    // For typing, we might lose exact cursor sync in history, but that's acceptable for now.
    pushHistory(newCode, 0); // Cursor 0 is placeholder if we don't have it
  };

  const setCodeWithErrorHandling = (newCode) => {
      setCode(newCode);
      // Reset history if totally new code loaded? No, keep it.
      // But maybe we should push a new history entry?
      pushHistory(newCode, 0);
  }

  // Set code programmatically (e.g. template loading)
  const loadCode = (newCode, newLang) => {
      setCode(newCode);
      if(newLang) setLanguage(newLang);
      // Reset History
      historyRef.current = [{ code: newCode, cursor: 0 }];
      historyIndexRef.current = 0;
  };


  /* --- Shortcut Logic --- */
  const handleKeyDown = (e) => {
    const { value, selectionStart, selectionEnd } = e.target;
    // Update ref for cursor restoration
    editorRef.current = e.target;

    // 0. Undo / Redo
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        undo();
        return;
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        redo();
        return;
    }

    // 1. Tab: Indent / Shift+Tab: Outdent
    if (e.key === 'Tab') {
        e.preventDefault();
        
        if (e.shiftKey) {
            // Outdent
            const beforeCursor = value.substring(0, selectionStart);
            const lineStart = beforeCursor.lastIndexOf('\n') + 1;
            const currentLine = value.substring(lineStart, selectionEnd); // rough approximation if single line
            
            // Allow multi-line outdent? For now single line
            if (value.substring(lineStart, lineStart + TAB_SIZE) === TAB_STRING) {
                const newValue = value.substring(0, lineStart) + value.substring(lineStart + TAB_SIZE);
                setCode(newValue);
                pushHistory(newValue, selectionStart - TAB_SIZE);
                setTimeout(() => {
                    e.target.selectionStart = selectionStart - TAB_SIZE;
                    e.target.selectionEnd = selectionEnd - TAB_SIZE;
                }, 0);
            }
        } else {
            // Indent
            const newValue = value.substring(0, selectionStart) + TAB_STRING + value.substring(selectionEnd);
            setCode(newValue);
            pushHistory(newValue, selectionStart + TAB_SIZE);
            setTimeout(() => {
                e.target.selectionStart = selectionStart + TAB_SIZE;
                e.target.selectionEnd = selectionStart + TAB_SIZE;
            }, 0);
        }
        return;
    }

    // 2. Duplicate Line (Ctrl + D)
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        const beforeCursor = value.substring(0, selectionStart);
        const lastLineStart = beforeCursor.lastIndexOf('\n') + 1;
        const nextLineStart = value.indexOf('\n', selectionStart);
        const lineEnd = nextLineStart === -1 ? value.length : nextLineStart;
        
        const lineContent = value.substring(lastLineStart, lineEnd);
        const newValue = value.substring(0, lineEnd) + "\n" + lineContent + value.substring(lineEnd);
        
        setCode(newValue);
        pushHistory(newValue, selectionStart); // Keep cursor? Or move to new line? keep same relative.
        setTimeout(() => {
             // Move cursor to same column in duplicated line
             e.target.selectionStart = lineEnd + 1 + (selectionStart - lastLineStart);
             e.target.selectionEnd = lineEnd + 1 + (selectionStart - lastLineStart);
        }, 0);
        return;
    }
    
    // 3. Toggle Comment (Ctrl + /)
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        const beforeCursor = value.substring(0, selectionStart);
        const lastLineStart = beforeCursor.lastIndexOf('\n') + 1;
        
        // Determine comment syntax
        const commentPrefix = (language === 'python' || language === 'ruby') ? '# ' : '// ';
        
        // Check if already commented
        // Need to check the START of the current line
        const rangeToCheck = value.substring(lastLineStart, lastLineStart + commentPrefix.length);
        
        if (rangeToCheck === commentPrefix) {
            // Uncomment
            const newValue = value.substring(0, lastLineStart) + value.substring(lastLineStart + commentPrefix.length);
            setCode(newValue);
            pushHistory(newValue, selectionStart - commentPrefix.length);
             setTimeout(() => {
                e.target.selectionStart = selectionStart - commentPrefix.length;
                e.target.selectionEnd = selectionEnd - commentPrefix.length;
            }, 0);
        } else {
            // Comment
            const newValue = value.substring(0, lastLineStart) + commentPrefix + value.substring(lastLineStart);
            setCode(newValue);
            pushHistory(newValue, selectionStart + commentPrefix.length);
            setTimeout(() => {
                e.target.selectionStart = selectionStart + commentPrefix.length;
                e.target.selectionEnd = selectionEnd + commentPrefix.length;
            }, 0);
        }
        return;
    }

    // 4. Ctrl + X (Cut Line)
    if ((e.ctrlKey || e.metaKey) && e.key === 'x' && selectionStart === selectionEnd) {
        e.preventDefault();
        const beforeCursor = value.substring(0, selectionStart);
        const lastLineStart = beforeCursor.lastIndexOf('\n') + 1;
        let nextLineStart = value.indexOf('\n', selectionStart);
        
        let cutStart = lastLineStart;
        let cutEnd = nextLineStart === -1 ? value.length : nextLineStart + 1; 

        const lineText = value.substring(cutStart, cutEnd);
        navigator.clipboard.writeText(lineText);
        
        const newValue = value.substring(0, cutStart) + value.substring(cutEnd);
        setCode(newValue);
        pushHistory(newValue, cutStart);
        
        setTimeout(() => {
            e.target.selectionStart = cutStart;
            e.target.selectionEnd = cutStart;
        }, 0);
        return;
    }

    // 5. Alt + ArrowUp/Down (Move Line)
    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        const lines = value.split('\n');
        const beforeCursor = value.substring(0, selectionStart);
        const currentLineIndex = beforeCursor.split('\n').length - 1;
        
        if (e.key === 'ArrowUp') {
            if (currentLineIndex > 0) {
                const temp = lines[currentLineIndex];
                lines[currentLineIndex] = lines[currentLineIndex - 1];
                lines[currentLineIndex - 1] = temp;
                
                const newValue = lines.join('\n');
                setCode(newValue);
                
                // Calculate position
                const colOffset = selectionStart - value.lastIndexOf('\n', selectionStart - 1) - 1;
                let newGlobalStart = 0;
                for(let i=0; i<currentLineIndex-1; i++) newGlobalStart += lines[i].length + 1;
                let newCursorPos = newGlobalStart + Math.min(colOffset, lines[currentLineIndex-1].length);
                
                pushHistory(newValue, newCursorPos);

                setTimeout(() => {
                    e.target.selectionStart = newCursorPos;
                    e.target.selectionEnd = newCursorPos;
                }, 0);
            }
        } else { // ArrowDown
            if (currentLineIndex < lines.length - 1) {
                const temp = lines[currentLineIndex];
                lines[currentLineIndex] = lines[currentLineIndex + 1];
                lines[currentLineIndex + 1] = temp;
                
                const newValue = lines.join('\n');
                setCode(newValue);

                const colOffset = selectionStart - value.lastIndexOf('\n', selectionStart - 1) - 1;
                let newGlobalStart = 0;
                for(let i=0; i<currentLineIndex+1; i++) newGlobalStart += lines[i].length + 1;
                let newCursorPos = newGlobalStart + Math.min(colOffset, lines[currentLineIndex+1].length);

                pushHistory(newValue, newCursorPos);
                
                setTimeout(() => {
                     e.target.selectionStart = newCursorPos;
                     e.target.selectionEnd = newCursorPos;
                }, 0);
            }
        }
        return;
    }

    // 6. Enter (Smart Indent)
    if (e.key === 'Enter') {
      e.preventDefault();
      const beforeCursor = value.substring(0, selectionStart);
      const afterCursor = value.substring(selectionEnd);
      
      const lastLineStart = beforeCursor.lastIndexOf('\n') + 1;
      const currentLine = beforeCursor.substring(lastLineStart);
      
      const indentMatch = currentLine.match(/^(\s*)/);
      let indent = indentMatch ? indentMatch[1] : "";
      
      if (currentLine.trim().endsWith('{')) {
        indent += TAB_STRING;
      }
      
      const newValue = beforeCursor + "\n" + indent + afterCursor;
      setCode(newValue);
      pushHistory(newValue, selectionStart + 1 + indent.length);
      
      setTimeout(() => {
        e.target.selectionStart = selectionStart + 1 + indent.length;
        e.target.selectionEnd = selectionStart + 1 + indent.length;
      }, 0);
      return;
    }

    // 7. Dedent on '}'
    if (e.key === '}') {
        const beforeCursor = value.substring(0, selectionStart);
        const lastLineStart = beforeCursor.lastIndexOf('\n') + 1;
        const currentLine = beforeCursor.substring(lastLineStart);
        
        if (/^\s+$/.test(currentLine)) {
            if (currentLine.length >= TAB_SIZE) { 
                 e.preventDefault();
                 const newIndent = currentLine.substring(0, currentLine.length - TAB_SIZE);
                 const newValue = value.substring(0, lastLineStart) + newIndent + "}" + value.substring(selectionEnd);
                 setCode(newValue);
                 pushHistory(newValue, lastLineStart + newIndent.length + 1);
                 
                 setTimeout(() => {
                    e.target.selectionStart = lastLineStart + newIndent.length + 1;
                    e.target.selectionEnd = lastLineStart + newIndent.length + 1;
                 }, 0);
                 return;
            }
        }
    }
  };

  return {
    code,
    language,
    setLanguage,
    updateCode: handleValueChange,
    handleKeyDown,
    loadCode
  };
};
