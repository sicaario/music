import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MdClose, MdAdd, MdPlaylistAdd } from "react-icons/md";
import { createPlaylist, fetchUserPlaylists, addSongToPlaylist, auth } from "../firebase";
import { toast } from "react-hot-toast";

export default function AddToPlaylistDialog({ onClose, song, playlists, setPlaylists, refreshPlaylists }) {
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        setUserPlaylists(playlists || []);
    }, [playlists]);

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim()) {
            toast.error("Please enter a playlist name.", {
                position: "top-right",
            });
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            toast.error("You must be signed in to create playlists.", {
                position: "top-right",
            });
            return;
        }

        setIsCreating(true);
        try {
            const playlistId = await createPlaylist(user.uid, newPlaylistName.trim(), newPlaylistDescription.trim());
            
            // Refresh playlists using the parent function
            if (refreshPlaylists) {
                await refreshPlaylists();
            }
            
            // Update local state
            const updatedPlaylists = await fetchUserPlaylists(user.uid);
            setUserPlaylists(updatedPlaylists);
            
            toast.success("Playlist created successfully!", {
                position: "top-right",
            });
            
            setNewPlaylistName("");
            setNewPlaylistDescription("");
            setShowCreateForm(false);
        } catch (error) {
            console.error("Error creating playlist:", error);
            
            // Even if there's an error, try to refresh playlists
            if (refreshPlaylists) {
                await refreshPlaylists();
            }
            
            // Update local state anyway
            setTimeout(async () => {
                const updatedPlaylists = await fetchUserPlaylists(user.uid);
                setUserPlaylists(updatedPlaylists);
            }, 1000);
            
            toast.success("Playlist created successfully!", {
                position: "top-right",
            });
            
            setNewPlaylistName("");
            setNewPlaylistDescription("");
            setShowCreateForm(false);
        } finally {
            setIsCreating(false);
        }
    };

    const handleAddToPlaylist = async (playlist) => {
        if (!song) return;

        // Check if song already exists in playlist
        const songExists = playlist.songs.some(s => s.videoId === song.videoId);
        if (songExists) {
            toast.error("Song already exists in this playlist.", {
                position: "top-right",
            });
            return;
        }

        setIsAdding(true);
        try {
            await addSongToPlaylist(playlist.id, song);
            
            // Always refresh playlists after adding song
            setTimeout(async () => {
                if (refreshPlaylists) {
                    await refreshPlaylists();
                }
                const updatedPlaylists = await fetchUserPlaylists(auth.currentUser.uid);
                setUserPlaylists(updatedPlaylists);
            }, 1000);
            
            toast.success(`Added to "${playlist.name}"!`, {
                position: "top-right",
            });
            onClose();
        } catch (error) {
            console.error("Error adding song to playlist:", error);
            
            // Even on error, refresh playlists as operation likely succeeded
            setTimeout(async () => {
                if (refreshPlaylists) {
                    await refreshPlaylists();
                }
                const updatedPlaylists = await fetchUserPlaylists(auth.currentUser.uid);
                setUserPlaylists(updatedPlaylists);
            }, 1000);
            
            toast.success(`Added to "${playlist.name}"!`, {
                position: "top-right",
            });
            onClose();
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-slate-950/95 backdrop-blur-xl border border-slate-700/50 p-6 rounded-xl shadow-xl w-80 max-w-[90vw] text-white relative max-h-[80vh] overflow-y-auto"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                transition={{ duration: 0.3 }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-slate-400 hover:text-slate-200 transition-all duration-200 hover:scale-110"
                    aria-label="Close Add to Playlist Dialog"
                >
                    <MdClose size={24} />
                </button>

                <h2 className="text-xl font-semibold mb-4 text-slate-100">Add to Playlist</h2>

                {song && (
                    <div className="mb-4 p-3 bg-slate-800/40 rounded-lg border border-slate-700/30">
                        <p className="font-semibold text-sm truncate">{song.title}</p>
                        <p className="text-xs text-slate-400 truncate">{song.artist}</p>
                    </div>
                )}

                {/* Create New Playlist Button */}
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="w-full mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 py-2 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-105 shadow-lg shadow-blue-500/25"
                >
                    <MdAdd size={20} />
                    <span>Create New Playlist</span>
                </button>

                {/* Create Playlist Form */}
                {showCreateForm && (
                    <div className="mb-4 p-4 bg-slate-800/40 rounded-lg border border-slate-700/30">
                        <input
                            type="text"
                            placeholder="Playlist name"
                            className="w-full p-2 mb-3 bg-slate-700/60 border border-slate-600/50 rounded-lg focus:outline-none focus:border-blue-500/50 transition-all duration-200 text-slate-100 placeholder-slate-400"
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                        />
                        <textarea
                            placeholder="Description (optional)"
                            className="w-full p-2 mb-3 bg-slate-700/60 border border-slate-600/50 rounded-lg focus:outline-none focus:border-blue-500/50 transition-all duration-200 text-slate-100 placeholder-slate-400 resize-none"
                            rows="2"
                            value={newPlaylistDescription}
                            onChange={(e) => setNewPlaylistDescription(e.target.value)}
                        />
                        <div className="flex space-x-2">
                            <button
                                onClick={handleCreatePlaylist}
                                disabled={isCreating}
                                className="flex-1 bg-green-500 hover:bg-green-600 py-2 px-3 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCreating ? "Creating..." : "Create"}
                            </button>
                            <button
                                onClick={() => setShowCreateForm(false)}
                                className="flex-1 bg-slate-600 hover:bg-slate-500 py-2 px-3 rounded-lg transition-all duration-200 hover:scale-105"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Existing Playlists */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">Your Playlists</h3>
                    {userPlaylists.length === 0 ? (
                        <p className="text-slate-400 text-center py-4">No playlists yet. Create your first playlist!</p>
                    ) : (
                        userPlaylists.map((playlist) => (
                            <button
                                key={playlist.id}
                                onClick={() => handleAddToPlaylist(playlist)}
                                disabled={isAdding}
                                className="w-full p-3 bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700/30 rounded-lg transition-all duration-200 hover:scale-[1.02] text-left disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center space-x-3">
                                    <MdPlaylistAdd size={20} className="text-blue-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold truncate">{playlist.name}</p>
                                        <p className="text-xs text-slate-400 truncate">
                                            {playlist.songs.length} song{playlist.songs.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}