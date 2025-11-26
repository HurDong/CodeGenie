import React from 'react';

const HighlightedCode = ({ code, language }) => {
    const highlight = (text, lang) => {
        if (!text) return '';

        let patterns = {};

        if (lang === 'java') {
            patterns = {
                keyword: /\b(public|private|protected|static|final|class|void|int|double|float|boolean|String|return|if|else|for|while|new|this|super|extends|implements|package|import)\b/g,
                string: /(["'])(?:(?=(\\?))\2.)*?\1/g,
                comment: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
                number: /\b\d+\b/g,
                function: /\b([a-zA-Z_]\w*)\s*(?=\()/g,
            };
        } else if (lang === 'python') {
            patterns = {
                keyword: /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|lambda|pass|break|continue|and|or|not|is|in|None|True|False)\b/g,
                string: /(["'])(?:(?=(\\?))\2.)*?\1/g,
                comment: /(#.*$)/gm,
                number: /\b\d+\b/g,
                function: /\b([a-zA-Z_]\w*)\s*(?=\()/g,
            };
        } else if (lang === 'cpp') {
            patterns = {
                keyword: /\b(int|double|float|char|bool|void|class|struct|public|private|protected|if|else|for|while|return|new|delete|this|virtual|static|const|auto|namespace|using|include)\b/g,
                string: /(["'])(?:(?=(\\?))\2.)*?\1/g,
                comment: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
                number: /\b\d+\b/g,
                function: /\b([a-zA-Z_]\w*)\s*(?=\()/g,
            };
        }

        let highlighted = text;
        const replacements = [];

        // Extract all matches with their positions
        Object.entries(patterns).forEach(([type, pattern]) => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                replacements.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    type,
                    text: match[0]
                });
            }
        });

        // Sort by start position
        replacements.sort((a, b) => a.start - b.start);

        // Remove overlapping matches (keep the first one)
        const filtered = [];
        let lastEnd = -1;
        replacements.forEach(rep => {
            if (rep.start >= lastEnd) {
                filtered.push(rep);
                lastEnd = rep.end;
            }
        });

        // Build highlighted string
        let result = '';
        let lastIndex = 0;
        filtered.forEach(rep => {
            result += text.substring(lastIndex, rep.start);
            result += `<span class="syntax-${rep.type}">${rep.text}</span>`;
            lastIndex = rep.end;
        });
        result += text.substring(lastIndex);

        return result;
    };

    const highlightedCode = highlight(code, language);

    return (
        <div
            className="highlighted-code"
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                padding: '14px 16px',
                fontFamily: "'Consolas', 'Courier New', monospace",
                fontSize: '13px',
                lineHeight: '20px',
                whiteSpace: 'pre',
                pointerEvents: 'none',
                color: 'transparent',
                caretColor: '#d4d4d4',
            }}
        />
    );
};

export default HighlightedCode;
