import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { getNotesByUser, createNote, updateNote, deleteNote } from '../api/notes';
import useWallet from '../hooks/useWallet';
import Header from '../components/Header';
import TabSystem from '../components/TabSystem';
import FindReplaceModal from '../components/FindReplaceModal';
import WalletPaymentModal from '../components/WalletPaymentModal';
import '../css/NotesPage.css';

const NotesPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [nextTabId, setNextTabId] = useState(1);
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false); // Prevent double loading
  
  // Wallet payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingSaveTab, setPendingSaveTab] = useState(null);

  // Wallet hook
  const wallet = useWallet();

  const editorRef = useRef(null);
  const titleRef = useRef(null);

  // Load notes from backend on mount
  useEffect(() => {
    if (user?.id && !hasLoaded) {
      loadNotes();
    }
  }, [user, hasLoaded]);

  const loadNotes = async () => {
    // Prevent double loading
    if (hasLoaded) return;
    setHasLoaded(true);
    
    try {
      setIsLoading(true);
      const response = await getNotesByUser(user.id);
      const notes = response.data;

      if (notes.length > 0) {
        const formattedTabs = notes.map(note => ({
          id: note.id,
          title: note.title || 'Untitled',
          content: note.content || '',
          txHash: note.txHash || null,
          hasUnsavedChanges: false,
          isSaved: true
        }));

        const maxId = Math.max(...notes.map(n => n.id));

        // Check if user wants to create a new note from Landing page
        const createNew = location.state?.createNew;
        if (createNew) {
          const newTab = {
            id: `temp-${maxId + 1}`,
            title: `Untitled-${notes.length + 1}`,
            content: '',
            txHash: null,
            hasUnsavedChanges: false,
            isSaved: false
          };
          setTabs([...formattedTabs, newTab]);
          setActiveTabId(newTab.id);
          setNextTabId(maxId + 2);
        } else {
          setTabs(formattedTabs);

          // Check if a specific note was requested from Landing page
          const requestedNoteId = location.state?.noteId;
          if (requestedNoteId) {
            setActiveTabId(requestedNoteId);
          } else {
            setActiveTabId(formattedTabs[0].id);
          }

          setNextTabId(maxId + 1);
        }
      } else {
        // Create first note if none exist
        const newTab = {
          id: `temp-1`,
          title: `Untitled-1`,
          content: '',
          txHash: null,
          hasUnsavedChanges: false,
          isSaved: false
        };
        setTabs([newTab]);
        setActiveTabId(newTab.id);
        setNextTabId(2);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      // Create first note on error
      const newTab = {
        id: `temp-1`,
        title: `Untitled-1`,
        content: '',
        txHash: null,
        hasUnsavedChanges: false,
        isSaved: false
      };
      setTabs([newTab]);
      setActiveTabId(newTab.id);
      setNextTabId(2);
    } finally {
      setIsLoading(false);
    }
  };

  // Helpers
  const getActiveTab = () => tabs.find(tab => tab.id === activeTabId);

  // Save note to backend (called after payment for new notes)
  const saveNote = async (tab, txHash = null) => {
    try {
      const noteData = {
        title: tab.title,
        content: tab.content
      };

      // Add txHash for new notes
      if (txHash) {
        noteData.txHash = txHash;
      }

      console.log('Saving note:', { id: tab.id, isSaved: tab.isSaved, noteData });

      let savedId = tab.id;

      if (tab.isSaved && !String(tab.id).startsWith('temp-')) {
        // Update existing note (no payment required)
        console.log('Updating existing note with ID:', tab.id);
        await updateNote(tab.id, noteData);

        // Mark as saved
        setTabs(prevTabs =>
          prevTabs.map(t =>
            t.id === tab.id
              ? { ...t, hasUnsavedChanges: false }
              : t
          )
        );
      } else {
        // Create new note (payment already completed)
        console.log('Creating new note for user:', user.id);
        const response = await createNote(user.id, noteData);
        console.log('Create response:', response.data);
        savedId = response.data.id;

        const oldTabId = tab.id;

        // Update tab with real ID from backend
        setTabs(prevTabs => {
          return prevTabs.map(t =>
            t.id === oldTabId
              ? {
                ...t,
                id: savedId,
                txHash: txHash,
                isSaved: true,
                hasUnsavedChanges: false
              }
              : t
          );
        });

        // Update active tab ID if this was the active tab
        if (activeTabId === oldTabId) {
          setActiveTabId(savedId);
        }

        return savedId;
      }

      return savedId;
    } catch (error) {
      console.error('Error saving note:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  };

  // Manual save handler
  const handleManualSave = async () => {
    const activeTab = getActiveTab();
    if (!activeTab) {
      alert('No active note to save.');
      return;
    }

    // Validate title and content
    const trimmedTitle = activeTab.title?.trim() || '';
    const trimmedContent = activeTab.content?.trim() || '';

    // Check if title starts with "Untitled" or is empty
    if (!trimmedTitle || trimmedTitle.startsWith('Untitled')) {
      alert('Please enter a proper title before saving (not "Untitled").');
      titleRef.current?.focus();
      return;
    }

    if (!trimmedContent) {
      alert('Please enter some content before saving.');
      editorRef.current?.focus();
      return;
    }

    // Check if this is a new note (requires payment)
    const isNewNote = !activeTab.isSaved || String(activeTab.id).startsWith('temp-');

    if (isNewNote) {
      // Open payment modal for new notes
      setPendingSaveTab(activeTab);
      setIsPaymentModalOpen(true);
    } else {
      // Update existing note (no payment required)
      try {
        await saveNote(activeTab);
        alert('Note saved successfully!');
      } catch (error) {
        console.error('Save failed:', error);
        alert('Failed to save note. Please try again.');
      }
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = async (txHash) => {
    setIsPaymentModalOpen(false);
    
    if (!pendingSaveTab) {
      alert('Error: No pending note to save.');
      return;
    }

    try {
      await saveNote(pendingSaveTab, txHash);
      alert(`Note saved successfully!\n\nTransaction: ${txHash.slice(0, 20)}...`);
    } catch (error) {
      console.error('Save failed after payment:', error);
      alert(`Payment was successful (tx: ${txHash.slice(0, 20)}...) but note save failed. Please contact support.`);
    } finally {
      setPendingSaveTab(null);
    }
  };

  // Handle payment modal close
  const handlePaymentModalClose = () => {
    setIsPaymentModalOpen(false);
    setPendingSaveTab(null);
  };

  // Tab actions
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.id === activeTabId
          ? { ...tab, title: newTitle || `Untitled-${tab.id}`, hasUnsavedChanges: true }
          : tab
      )
    );
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.id === activeTabId
          ? { ...tab, content: newContent, hasUnsavedChanges: true }
          : tab
      )
    );
  };

  const handleTabSelect = (tabId) => setActiveTabId(tabId);

  const handleTabClose = async (tabId) => {
    if (tabs.length === 1) return;

    const tabToClose = tabs.find(tab => tab.id === tabId);

    // Only ask for confirmation if there are unsaved changes
    if (tabToClose?.hasUnsavedChanges) {
      const confirmClose = window.confirm('You have unsaved changes. Close without saving?');
      if (!confirmClose) return;
    }

    // Just remove from tabs - DO NOT delete from database
    const newTabs = tabs.filter(tab => tab.id !== tabId);

    // Update active tab if we're closing the current active tab
    if (tabId === activeTabId && newTabs.length > 0) {
      const tabIndex = tabs.findIndex(tab => tab.id === tabId);
      const newActiveTab = newTabs[Math.min(tabIndex, newTabs.length - 1)] || newTabs[0];
      if (newActiveTab) {
        setActiveTabId(newActiveTab.id);
      }
    }

    setTabs(newTabs);
  };

  const handleAddTab = () => {
    const newTab = {
      id: `temp-${nextTabId}`,
      title: `Untitled-${nextTabId}`,
      content: '',
      txHash: null,
      hasUnsavedChanges: false,
      isSaved: false
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setNextTabId(prev => prev + 1);
  };

  const handleFindReplace = (findText, replaceText) => {
    if (!findText) return;
    setTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.id === activeTabId
          ? {
            ...tab,
            content: tab.content.replace(new RegExp(findText, 'g'), replaceText),
            hasUnsavedChanges: true
          }
          : tab
      )
    );
    if (editorRef.current) {
      editorRef.current.value = editorRef.current.value.replace(new RegExp(findText, 'g'), replaceText);
    }
  };

  const activeTab = getActiveTab();

  if (isLoading) {
    return (
      <div className="landing-page">
        <Header
          onBackToHome={() => console.log('Back to home clicked')}
          onNewFile={handleAddTab}
          onFindReplaceClick={() => setIsFindReplaceOpen(true)}
          editorRef={editorRef}
        />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          color: '#9ca3af'
        }}>
          Loading notes...
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      {/* Header with logo */}
      <Header
        onBackToHome={() => console.log('Back to home clicked')}
        onNewFile={handleAddTab}
        onFindReplaceClick={() => setIsFindReplaceOpen(true)}
        onSave={handleManualSave}
        editorRef={editorRef}
      />

      {/* Main layout */}
      <main className="landing-main">
        <section className="landing-full-preview">
          <TabSystem
            tabs={tabs}
            activeTabId={activeTabId}
            onTabSelect={handleTabSelect}
            onTabClose={handleTabClose}
            onAddTab={handleAddTab}
          />
          <div className="landing-editor-wrap">
            {activeTab && (
              <div className="landing-text-editor-container">
                {/* Title Input */}
                <input
                  ref={titleRef}
                  type="text"
                  className="landing-note-title"
                  value={activeTab.title}
                  onChange={handleTitleChange}
                  placeholder="Note title..."
                  spellCheck="false"
                />

                {/* Content Textarea */}
                <textarea
                  ref={editorRef}
                  className="landing-text-editor"
                  value={activeTab.content}
                  onChange={handleContentChange}
                  placeholder="Start typing your notes here..."
                  spellCheck="false"
                />
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Find/Replace Modal */}
      {isFindReplaceOpen && (
        <FindReplaceModal
          onClose={() => setIsFindReplaceOpen(false)}
          onFindReplace={handleFindReplace}
        />
      )}

      {/* Wallet Payment Modal */}
      {isPaymentModalOpen && (
        <WalletPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={handlePaymentModalClose}
          onPaymentSuccess={handlePaymentSuccess}
          wallet={wallet}
        />
      )}
    </div>
  );
};

export default NotesPage;