import React from 'react';
import Header from './Header';
import TextEditor from './TextEditor';

const NotepadApp = ({ onBackToHome }) => {
  return (
    <div className="notepad-app">
      <Header onBackToHome={onBackToHome} />
      <TextEditor />
    </div>
  );
};

export default NotepadApp;