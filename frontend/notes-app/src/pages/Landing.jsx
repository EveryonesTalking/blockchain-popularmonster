import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Landing.css";

import { useAuth } from "../context/AuthContext";
import { getNotesByUser, deleteNote } from "../api/notes";

import Wallet from "./Wallet";
import Profile from "./Profile";

const Landing = () => {
    const [openDropdown, setOpenDropdown] = useState(false);
    const [activeTab, setActiveTab] = useState("notes");
    const [notes, setNotes] = useState([]);
    const [isLoadingNotes, setIsLoadingNotes] = useState(true);

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleDropdownToggle = () => {
        setOpenDropdown(!openDropdown);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openDropdown && !event.target.closest('.account-section')) {
                setOpenDropdown(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [openDropdown]);

    // Load notes from backend
    useEffect(() => {
        if (user?.id && activeTab === "notes") {
            loadNotes();
        }
    }, [user, activeTab]);

    const loadNotes = async () => {
        try {
            setIsLoadingNotes(true);
            const response = await getNotesByUser(user.id);
            setNotes(response.data);
        } catch (error) {
            console.error('Error loading notes:', error);
            setNotes([]);
        } finally {
            setIsLoadingNotes(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const handleProfileClick = () => {
        setActiveTab("profile");
    };

    const handleNewNote = () => {
        navigate("/notes", { state: { createNew: true } });
    };

    const handleOpenNote = (noteId) => {
        navigate("/notes", { state: { noteId } });
    };

    const handleDeleteNote = async (noteId, e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this note? ")) {
            try {
                await deleteNote(noteId);
                setNotes(prevNotes => prevNotes.filter(note => (note.id || note.noteId) !== noteId));
            } catch (error) {
                console.error('Error deleting note:', error);
                alert('Failed to delete note. Please try again.');
            }
        }
    };

    // Get user initials for avatar
    const getUserInitials = () => {
        if (!user?.username) return "U";
        return user.username.substring(0, 2).toUpperCase();
    };

    // Check if user has avatar
    const hasAvatar = () => {
        return user?.avatarUrl && user.avatarUrl !== "/default-avatar.png";
    };

    // Get note color based on index
    const getNoteColor = (index) => {
        const colors = ["yellow", "red", "blue", "green", "purple", "pink"];
        return colors[index % colors.length];
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });
    };

    // Truncate text
    const truncateText = (text, maxLength = 100) => {
        if (!text) return "";
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    };

    return (
        <div className="dashboard">
            {/* Sidebar */}
            <aside className="sidebar">

                {/* Header */}
                <div className="sidebarHeader">
                    <div className="logoSection">
                        <div className="logoIcon">
                            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                                <rect width="40" height="40" rx="8" fill="#6366F1" />
                                <path d="M15 12h10M15 20h10M15 28h6"
                                    stroke="white" strokeWidth="2.5"
                                    strokeLinecap="round" />
                            </svg>
                        </div>
                        <div className="logoText">
                            <div className="logoTitle">Notes App</div>
                            <div className="logoSubtitle">Personal workspace</div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="searchBox">
                    <svg className="searchIcon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                        <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <input type="text" placeholder="Search..." className="searchInput" />
                </div>

                {/* Navigation */}
                <nav className="nav">
                    <button
                        className={`navItem ${activeTab === "notes" ? "navItemActive" : ""}`}
                        onClick={() => setActiveTab("notes")}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                        </svg>
                        <span>Notes</span>
                    </button>

                    <button
                        className={`navItem ${activeTab === "wallet" ? "navItemActive" : ""}`}
                        onClick={() => setActiveTab("wallet")}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="7" width="20" height="14" rx="2" />
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        </svg>
                        <span>Wallet</span>
                    </button>
                </nav>

                {/* User Section at Bottom - Clickable to Profile */}
                <div className="sidebarBottom" onClick={handleProfileClick}>
                    {user && (
                        <>
                            <div className="userAvatar">
                                {hasAvatar() ? (
                                    <img
                                        src={user.avatarUrl}
                                        alt="User Avatar"
                                        className="userAvatarImage"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div
                                    className="userAvatarInitials"
                                    style={{ display: hasAvatar() ? 'none' : 'flex' }}
                                >
                                    {getUserInitials()}
                                </div>
                            </div>
                            <div className="userInfo">
                                <p className="userName">{user.username}</p>
                                <p className="userRole">View Profile</p>
                            </div>
                        </>
                    )}
                    <button
                        className="loginButton"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleLogout();
                        }}
                        title="Logout"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="main">
                {activeTab === "notes" && (
                    <section className="notesSection">
                        <div className="sectionHeader">
                            <h2 className="sectionTitle">My Notes</h2>
                        </div>

                        {isLoadingNotes ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '2rem',
                                color: '#9ca3af'
                            }}>
                                Loading notes...
                            </div>
                        ) : (
                            <div className="notesGrid">
                                {notes.map((note, index) => (
                                    <div
                                        key={note.id}
                                        className={`noteCard ${getNoteColor(index)}`}
                                        onClick={() => handleOpenNote(note.id)}
                                        style={{ cursor: 'pointer', position: 'relative' }}
                                    >
                                        <button
                                            className="noteDeleteBtn"
                                            onClick={(e) => handleDeleteNote(note.id, e)}
                                            title="Delete note"
                                        >
                                            ×
                                        </button>
                                        <div className="noteDate">
                                            {note.createdAt ? formatDate(note.createdAt) : 'No date'}
                                        </div>
                                        <h3 className="noteTitle">{note.title || 'Untitled'}</h3>
                                        <p className="noteText">{truncateText(note.content)}</p>
                                    </div>
                                ))}
                                <button className="newNote" onClick={handleNewNote}>
                                    + New Note
                                </button>
                            </div>
                        )}
                    </section>
                )}

                {activeTab === "wallet" && (
                    <div className="walletContainer">
                        <Wallet />
                    </div>
                )}

                {activeTab === "profile" && (
                    <div className="profileContainer">
                        <Profile />
                    </div>
                )}
            </main>
        </div>
    );
};

export default Landing;