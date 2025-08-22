import React, { useState, useEffect } from "react";
import "./App.css";
import {
    auth,
    signInWithGoogle,
    signOutUser,
    saveLikedSongs,
    fetchLikedSongs,
    fetchRecentlyPlayed,
    saveRecentlyPlayed,
    removeRecentlyPlayedSong,
    fetchUserPlaylists,
} from "./firebase";
import AnimatedBackground from "./components/AnimatedBackground";
import Visualizer from "./components/Visualizer";
import Navbar from "./components/Navbar";
import MobileNavbar from "./components/MobileNavbar"; 
import PermanentSearchBar from "./components/PermanentSearchBar";
import MusicPlayer from "./components/MusicPlayer";
import RecentlyPlayed from "./components/RecentlyPlayed";
import LikedSongs from "./components/LikedSongs";
import PlaylistsPanel from "./components/PlaylistsPanel";
import AddToPlaylistDialog from "./components/AddToPlaylistDialog";
import CreatePlaylistDialog from "./components/CreatePlaylistDialog";
import { AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { MdPerson } from "react-icons/md";

export default function App() {
    const [activePanel, setActivePanel] = useState(null);
    const [currentSong, setCurrentSong] = useState(null);
    const [recentlyPlayed, setRecentlyPlayed] = useState([]);
    const [likedSongs, setLikedSongs] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
    const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);
    const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
    const [user, setUser] = useState(null); 

    // Function to refresh playlists from Firebase
    const refreshPlaylists = async () => {
        if (user) {
            try {
                const fetchedPlaylists = await fetchUserPlaylists(user.uid);
                setPlaylists(fetchedPlaylists);
                console.log("Playlists refreshed:", fetchedPlaylists);
            } catch (error) {
                console.error("Error refreshing playlists:", error);
                // Keep existing playlists if fetch fails due to permissions
                console.log("Keeping existing playlists due to permission issue");
            }
        }
    };

    // If the main content should be blurred based on active panels
    const shouldBlur = ["profile", "settings"].includes(activePanel);

    useEffect(() => {
        // Listen for Firebase Auth State changes
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    const fetchedLikedSongs = await fetchLikedSongs(currentUser.uid);
                    setLikedSongs(fetchedLikedSongs);
                    console.log("Liked songs fetched on sign-in or app load.");

                    const fetchedRecentlyPlayed = await fetchRecentlyPlayed(currentUser.uid);
                    setRecentlyPlayed(fetchedRecentlyPlayed);
                    console.log("Recently played songs fetched on sign-in or app load.");

                    const fetchedPlaylists = await fetchUserPlaylists(currentUser.uid);
                    setPlaylists(fetchedPlaylists);
                    console.log("User playlists fetched on sign-in or app load.");
                } catch (error) {
                    console.error("Error fetching songs:", error);
                    toast.error("Failed to fetch songs.", {
                        position: "top-right",
                    });
                }
            } else {
                setLikedSongs([]);
                setRecentlyPlayed([]);
                setPlaylists([]);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        // Save liked and recently played songs when the user closes the browser or refreshes
        const saveSongsOnUnload = async () => {
            if (user) {
                try {
                    await saveLikedSongs(user.uid, likedSongs);
                    await saveRecentlyPlayed(user.uid, recentlyPlayed);
                    console.log("Songs saved successfully on browser close.");
                } catch (error) {
                    console.error("Error saving songs on browser close:", error);
                }
            }
        };

        window.addEventListener("beforeunload", saveSongsOnUnload);

        return () => {
            window.removeEventListener("beforeunload", saveSongsOnUnload);
        };
    }, [user, likedSongs, recentlyPlayed]);

    /**
     * Handle user sign-in with Google
     */
    const handleSignIn = async () => {
        try {
            const signedInUser = await signInWithGoogle();
            setUser(signedInUser);
            toast.success(`Welcome, ${signedInUser.displayName}!`, {
                position: "top-right",
            });
        } catch (error) {
            console.error("Error during sign-in:", error.message);
            toast.error(`Sign in failed: ${error.message}`, {
                position: "top-right",
            });
        }
    };

    /**
     * Handle user sign-out
     */
    const handleSignOut = async () => {
        try {
            if (user) {
                await saveLikedSongs(user.uid, likedSongs);
                await saveRecentlyPlayed(user.uid, recentlyPlayed);
                console.log("Songs saved successfully before sign-out.");
            }

            await signOutUser();
            setUser(null);
            setLikedSongs([]);
            setRecentlyPlayed([]);
            toast.success("You have been signed out.", {
                position: "top-right",
            });
        } catch (error) {
            console.error("Error during sign-out:", error.message);
            toast.error(`Sign out failed: ${error.message}`, {
                position: "top-right",
            });
        }
    };

    /**
     * Close all active panels/dialogs
     */
    const closeAllPanels = () => setActivePanel(null);

    /**
     * Set the current song and update recently played list
     * @param {Object} song - The selected song object
     */
    const handleSetCurrentSong = (song) => {
        if (!song?.videoId) {
            alert("This song does not have a valid YouTube videoId.");
            return;
        }
        setCurrentSong(song);
        setRecentlyPlayed((prev) => {
            const filtered = prev.filter((item) => item.videoId !== song.videoId);
            return [song, ...filtered].slice(0, 10); // Keep only the latest 10
        });
    };

    /**
     * Toggle like status of a song
     * @param {Object} song - The song to toggle
     * @param {boolean} isCurrentlyLiked - Whether the song is currently liked
     */
    const handleLikeToggle = (song, isCurrentlyLiked) => {
        setLikedSongs((prev) => {
            if (isCurrentlyLiked) {
                return prev.filter((item) => item.videoId !== song.videoId);
            } else {
                return [song, ...prev];
            }
        });
    };

    /**
     * Reorder liked songs in the list
     * @param {number} fromIndex - The current index of the song
     * @param {number} toIndex - The new index to move the song to
     */
    const handleReorderLikedSongs = (fromIndex, toIndex) => {
        setLikedSongs((prev) => {
            if (toIndex < 0 || toIndex >= prev.length) return prev;
            const arr = [...prev];
            const [removed] = arr.splice(fromIndex, 1);
            arr.splice(toIndex, 0, removed);
            return arr;
        });
    };

    /**
     * Play the previous liked song
     */
    const handlePrevLikedSong = () => {
        if (!currentSong) return;
        const idx = likedSongs.findIndex((s) => s.videoId === currentSong.videoId);
        if (idx > 0) {
            setCurrentSong(likedSongs[idx - 1]);
        }
    };

    /**
     * Play the next liked song
     */
    const handleNextLikedSong = () => {
        if (!currentSong) return;
        const idx = likedSongs.findIndex((s) => s.videoId === currentSong.videoId);
        if (idx >= 0 && idx < likedSongs.length - 1) {
            setCurrentSong(likedSongs[idx + 1]);
        }
    };

    /**
     * Handle deletion of a song from Recently Played
     * @param {string} videoId - The unique video ID of the song to delete
     */
    const handleDeleteSong = async (videoId) => {
        if (!user) {
            toast.error("You must be signed in to delete songs.", {
                position: "top-right",
            });
            return;
        }

        try {
            console.log(`Deleting song with videoId: ${videoId}`);
            // Remove the song from Firestore
            await removeRecentlyPlayedSong(user.uid, videoId);

            // Update local state
            setRecentlyPlayed((prevSongs) =>
                prevSongs.filter((song) => song.videoId !== videoId)
            );

            toast.success("Song removed from Recently Played.", {
                position: "top-right",
            });
            console.log(`Song with videoId ${videoId} deleted successfully.`);
        } catch (error) {
            console.error("Failed to delete song:", error);
            toast.error("Failed to delete the song. Please try again.", {
                position: "top-right",
            });
        }
    };

    /**
     * Handle adding a song to playlist
     * @param {Object} song - The song to add to playlist
     */
    const handleAddToPlaylist = (song) => {
        if (!user) {
            toast.error("You must be signed in to add songs to playlists.", {
                position: "top-right",
            });
            return;
        }
        setSelectedSongForPlaylist(song);
        setShowAddToPlaylist(true);
    };

    /**
     * Handle creating a new playlist from navbar
     */
    const handleCreatePlaylist = () => {
        if (!user) {
            toast.error("You must be signed in to create playlists.", {
                position: "top-right",
            });
            return;
        }
        setShowCreatePlaylist(true);
    };

    const isLikedPanelActive = activePanel === "liked";
    const isPlaylistsPanelActive = activePanel === "playlists";

    return (
        <div className="relative w-screen h-screen text-white overflow-hidden">
            {/* Toast Notifications */}
            <Toaster position="top-right" reverseOrder={false} />

            {/* Background and Visualizer */}
            <AnimatedBackground />
            <Visualizer />

            {/* Desktop Navbar */}
            <div className="hidden md:block z-20">
                <Navbar
                    activePanel={activePanel}
                    setActivePanel={setActivePanel}
                    user={user}
                    onSignIn={handleSignIn}
                    onSignOut={handleSignOut}
                    likedSongs={likedSongs}
                />
            </div>

            {/* Mobile Navbar */}
            <div className="fixed bottom-0 left-0 right-0 z-50">
                <MobileNavbar
                    activePanel={activePanel}
                    setActivePanel={setActivePanel}
                    user={user}
                    onSignIn={handleSignIn}
                    onSignOut={handleSignOut}
                />
            </div>

            {/* Main Content */}
            <div
                className={`relative z-10 p-4 sm:p-6 md:ml-20 h-full flex flex-col transition-all duration-300 ${
                    shouldBlur ? "blur-sm" : ""
                }`}
            >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent text-center md:text-left">
                        Echo AI Music
                    </h1>
                    
                    {/* User Profile - Top Right */}
                    {user && (
                        <div className="flex items-center space-x-2 sm:space-x-3 bg-gradient-to-r from-slate-900/70 to-slate-800/70 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl p-2 shadow-lg shadow-cyan-500/10">
                            <MdPerson className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
                            <span className="text-slate-100 font-medium text-sm sm:text-base hidden sm:block truncate max-w-32">{user.displayName}</span>
                        </div>
                    )}
                </div>

                {/* Permanent Search Bar */}
                <PermanentSearchBar setSong={handleSetCurrentSong} />

                {/* Scrollable Section */}
                <div className="flex-1 overflow-y-auto scrollbar-hidden mb-24 sm:mb-20 md:mb-20 bg-gradient-to-br from-slate-900/30 to-slate-800/30 rounded-2xl border border-slate-700/30 backdrop-blur-sm">
                    {isLikedPanelActive ? (
                        <LikedSongs
                            songs={likedSongs}
                            onSelectSong={handleSetCurrentSong}
                            onReorder={handleReorderLikedSongs}
                            user={user}
                            onAddToPlaylist={handleAddToPlaylist}
                        />
                    ) : isPlaylistsPanelActive ? (
                        <PlaylistsPanel
                            playlists={playlists}
                            setPlaylists={setPlaylists}
                            onSelectSong={handleSetCurrentSong}
                            onCreatePlaylist={handleCreatePlaylist}
                            refreshPlaylists={refreshPlaylists}
                            currentSong={currentSong}
                            onPrevPlaylistSong={(playlistSongs) => {
                                const currentIndex = playlistSongs.findIndex(s => s.videoId === currentSong?.videoId);
                                if (currentIndex > 0) handleSetCurrentSong(playlistSongs[currentIndex - 1]);
                            }}
                            onNextPlaylistSong={(playlistSongs) => {
                                const currentIndex = playlistSongs.findIndex(s => s.videoId === currentSong?.videoId);
                                if (currentIndex >= 0 && currentIndex < playlistSongs.length - 1) handleSetCurrentSong(playlistSongs[currentIndex + 1]);
                            }}
                        />
                    ) : (
                        <RecentlyPlayed
                            songs={recentlyPlayed}
                            onSelectSong={handleSetCurrentSong}
                            onDeleteSong={handleDeleteSong}
                            user={user}
                            onAddToPlaylist={handleAddToPlaylist}
                        />
                    )}
                </div>
            </div>

            {/* Dialog Overlays */}

            {/* Desktop Music Player */}
            <div className="hidden md:block fixed bottom-0 left-0 right-0 h-20 lg:h-24 z-50">
                <MusicPlayer
                    song={currentSong}
                    likedSongs={likedSongs}
                    isLikedPanelActive={isLikedPanelActive}
                    onLikeToggle={handleLikeToggle}
                    onPrevLikedSong={handlePrevLikedSong}
                    onNextLikedSong={handleNextLikedSong}
                />
            </div>

            {/* Mobile Music Player */}
            <div className="md:hidden fixed bottom-20 left-0 right-0 z-40 flex flex-col">
                <div className="h-20">
                    <MusicPlayer
                        song={currentSong}
                        likedSongs={likedSongs}
                        isLikedPanelActive={isLikedPanelActive}
                        onLikeToggle={handleLikeToggle}
                        onPrevLikedSong={handlePrevLikedSong}
                        onNextLikedSong={handleNextLikedSong}
                        user={user}
                        playlists={playlists}
                        setPlaylists={setPlaylists}
                    />
                </div>
            </div>

            {/* Add to Playlist Dialog */}
            {showAddToPlaylist && (
                <AddToPlaylistDialog
                    onClose={() => {
                        setShowAddToPlaylist(false);
                        setSelectedSongForPlaylist(null);
                    }}
                    song={selectedSongForPlaylist}
                    playlists={playlists}
                    setPlaylists={setPlaylists}
                    refreshPlaylists={refreshPlaylists}
                />
            )}

            {/* Create Playlist Dialog */}
            {showCreatePlaylist && (
                <CreatePlaylistDialog
                    isOpen={showCreatePlaylist}
                    onClose={() => setShowCreatePlaylist(false)}
                    user={user}
                    onPlaylistsUpdate={setPlaylists}
                    setPlaylists={setPlaylists}
                    refreshPlaylists={refreshPlaylists}
                />
            )}
        </div>
    );
}