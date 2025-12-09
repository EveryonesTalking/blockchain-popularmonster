// src/components/TextEditor.jsx
import React, { useState, useImperativeHandle, forwardRef } from 'react';

const TextEditor = forwardRef((props, ref) => {
  const [content, setContent] = useState('');

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  // Expose methods to parent (like EditDropdown)
  useImperativeHandle(ref, () => ({
    replaceAll(findText, replaceText) {
      if (!findText) return;
      setContent((prev) => prev.split(findText).join(replaceText));
    },
    insertTextAtCursor(text) {
      const textarea = document.querySelector('.text-editor');
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const newValue = value.slice(0, start) + text + value.slice(end);
      setContent(newValue);

      // restore cursor
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
      }, 0);
    },
    getContent() {
      return content;
    }
  }));

  const styles = {
    textEditorContainer: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
    },
    textEditor: {
      flex: 1,
      width: '100%',
      height: '100%',
      background: '#0f1220',
      color: '#e7e9ff',
      border: 'none',
      outline: 'none',
      padding: '16px',
      fontSize: '14px',
      fontFamily: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      lineHeight: '1.5',
      resize: 'none',
      boxSizing: 'border-box',
    },
  };

  return (
    <div className="text-editor-container" style={styles.textEditorContainer}>
      <textarea
        className="text-editor"
        style={styles.textEditor}
        value={content}
        onChange={handleContentChange}
        placeholder="Start typing your notes here..."
        spellCheck="false"
      />
    </div>
  );
});

export default TextEditor;
