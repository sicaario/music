import React, { useState } from "react";
import { motion } from "framer-motion";
import { MdPlaylistPlay, MdDelete, MdEdit, MdAdd, MdArrowBack, MdPlayArrow, MdSkipPrevious, MdSkipNext } from "react-icons/md";
import { deletePlaylist, updatePlaylist, removeSongFromPlaylist } from "../firebase";
import { toast } from "react-hot-toast";

export default function PlaylistsPanel({ playlists, setPlaylists, onSelectSong, onCreatePlaylist, refreshPlaylists, currentSong, onPrevPlaylistSong, onNextPlaylistSong }) {
    const [viewingPlaylist, setViewingPlaylist] = useState(null);
    const [editingPlaylist, setEditingPlaylist] = useState(null);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");

    const handleDeletePlaylist = async (playlistId, playlistName) => {
        if (!window.confirm(`Are you sure you want to delete "${playlistName}"?`)) {
            return;
        }

        try {
            await deletePlaylist(playlistId);
            setPlaylists(prev => prev.filter(p => p.id !== playlistId));
            
            // Refresh playlists to ensure consistency
            if (refreshPlaylists) {
                await refreshPlaylists();
            }
            
            toast.success("Playlist deleted successfully!", {
                position: "top-right",
            });
        } catch (error) {
            console.error("Error deleting playlist:", error);
            toast.error("Failed to delete playlist.", {
                position: "top-right",
            });
        }
    };

    const handleEditPlaylist = (playlist) => {
        setEditingPlaylist(playlist.id);
        setEditName(playlist.name);
        setEditDescription(playlist.description || "");
    };

    const handleSaveEdit = async () => {
        if (!editName.trim()) {
            toast.error("Please enter a playlist name.", {
                position: "top-right",
            });
            return;
        }

        try {
            await updatePlaylist(editingPlaylist, {
                name: editName.trim(),
                description: editDescription.trim(),
            });

            setPlaylists(prev => 
                prev.map(p => 
                    p.id === editingPlaylist 
                        ? { ...p, name: editName.trim(), description: editDescription.trim() }
                        : p
                )
            );

            // Refresh playlists to ensure consistency
            if (refreshPlaylists) {
                await refreshPlaylists();
            }

            toast.success("Playlist updated successfully!", {
                position: "top-right",
            });
            setEditingPlaylist(null);
        } catch (error) {
            console.error("Error updating playlist:", error);
            toast.error("Failed to update playlist.", {
                position: "top-right",
            });
        }
    };

    const handleCancelEdit = () => {
        setEditingPlaylist(null);
        setEditName("");
        setEditDescription("");
    };

    const handleViewPlaylist = (playlist) => {
        setViewingPlaylist(playlist);
    };

    const handleBackToPlaylists = () => {
        setViewingPlaylist(null);
    };

    const handleSongClick = (song, index) => {
        onSelectSong && onSelectSong(song);
    };

    const handleDeleteSongFromPlaylist = async (song, playlistId) => {
        if (!window.confirm(`Remove "${song.title}" from this playlist?`)) {
            return;
        }

        try {
            await removeSongFromPlaylist(playlistId, song);
            
            // Update local state
            setPlaylists(prev => 
                prev.map(playlist => 
                    playlist.id === playlistId 
                        ? { ...playlist, songs: playlist.songs.filter(s => s.videoId !== song.videoId) }
                        : playlist
                )
            );

            // Update the viewing playlist if it's currently being viewed
            if (viewingPlaylist && viewingPlaylist.id === playlistId) {
                setViewingPlaylist(prev => ({
                    ...prev,
                    songs: prev.songs.filter(s => s.videoId !== song.videoId)
                }));
            }

            // Refresh playlists to ensure consistency
            if (refreshPlaylists) {
                setTimeout(async () => {
                    await refreshPlaylists();
                }, 1000);
            }

            toast.success("Song removed from playlist!", {
                position: "top-right",
            });
        } catch (error) {
            console.error("Error removing song from playlist:", error);
            toast.error("Failed to remove song from playlist.", {
                position: "top-right",
            });
        }
    };

    // If viewing a specific playlist, show its songs
    if (viewingPlaylist) {
        const currentSongIndex = viewingPlaylist.songs.findIndex(song => song.videoId === currentSong?.videoId);
        const isPlaylistActive = currentSongIndex !== -1;
        
        return (
            <div className="p-2 sm:p-4 md:p-6">
                <div className="flex items-center mb-4">
                    <button
                        onClick={handleBackToPlaylists}
                        className="mr-3 sm:mr-4 p-2 hover:bg-slate-700/50 rounded-xl transition-all duration-200 hover:scale-110"
                    >
                        <MdArrowBack size={20} className="sm:w-6 sm:h-6 text-cyan-400" />
                    </button>
                    <div>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-100">{viewingPlaylist.name}</h2>
                        {viewingPlaylist.description && (
                            <p className="text-slate-400 text-xs sm:text-sm">{viewingPlaylist.description}</p>
                        )}
                        <p className="text-slate-500 text-xs sm:text-sm">
                            {viewingPlaylist.songs.length} song{viewingPlaylist.songs.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                {/* Playlist Controls - Only show when playlist is active */}
                {isPlaylistActive && (
                    <div className="flex items-center justify-center mb-4 p-3 bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/30">
                        <button
                            onClick={() => onPrevPlaylistSong && onPrevPlaylistSong(viewingPlaylist.songs)}
                            disabled={currentSongIndex <= 0}
                            className={`p-2 rounded-xl transition-all duration-200 ${
                                currentSongIndex <= 0
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 hover:scale-110"
                            }`}
                        >
                            <MdSkipPrevious size={24} />
                        </button>
                        
                        <div className="mx-4 text-center">
                            <p className="text-xs text-slate-400">Now Playing</p>
                            <p className="text-sm font-semibold text-slate-100 truncate max-w-32">
                                {currentSong?.title}
                            </p>
                        </div>
                        
                        <button
                            onClick={() => onNextPlaylistSong && onNextPlaylistSong(viewingPlaylist.songs)}
                            disabled={currentSongIndex >= viewingPlaylist.songs.length - 1}
                            className={`p-2 rounded-xl transition-all duration-200 ${
                                currentSongIndex >= viewingPlaylist.songs.length - 1
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 hover:scale-110"
                            }`}
                        >
                            <MdSkipNext size={24} />
                        </button>
                    </div>
                )}

                {viewingPlaylist.songs.length === 0 ? (
                    <div className="text-center py-12">
                        <MdPlaylistPlay size={64} className="mx-auto text-slate-600 mb-4" />
                        <p className="text-slate-400 text-lg">No songs in this playlist yet</p>
                        <p className="text-slate-500 text-sm">Add songs to this playlist from the music player or search results!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4">
                        {viewingPlaylist.songs.map((song, index) => (
                            <motion.div
                                key={`${song.videoId}-${index}`}
                                className={`relative bg-gradient-to-b h-36 sm:h-44 md:h-48 lg:h-52 from-slate-800/60 to-slate-900/80 backdrop-blur-sm border rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 shadow-lg ${
                                    currentSong?.videoId === song.videoId 
                                        ? 'border-cyan-400/50 shadow-cyan-500/30' 
                                        : 'border-slate-700/30 hover:shadow-cyan-500/20'
                                }`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <div 
                                    className="cursor-pointer h-full"
                                    onClick={() => handleSongClick(song, index)}
                                >
                                    <img
                                        src={song.imageUrl || 'https://via.placeholder.com/150'}
                                        alt={song.title}
                                        className="w-full h-20 sm:h-28 md:h-32 lg:h-36 object-cover"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2 md:p-3 bg-slate-900/90 backdrop-blur-sm">
                                        <p className="text-xs sm:text-sm font-semibold truncate text-slate-100 leading-tight">{song.title}</p>
                                        <p className="text-xs text-slate-400 truncate leading-tight">{song.artist}</p>
                                    </div>
                                    
                                    {/* Now Playing Indicator */}
                                    {currentSong?.videoId === song.videoId && (
                                        <div className="absolute top-2 left-2 bg-cyan-500/90 backdrop-blur-sm rounded-full px-2 py-1">
                                            <p className="text-xs font-semibold text-white">♪</p>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Action buttons */}
                                <div className="absolute bottom-8 sm:bottom-11 md:bottom-12 right-1 sm:right-2 flex space-x-1">
                                    {/* Play Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSongClick(song, index);
                                        }}
                                        className="text-cyan-400 bg-slate-900/70 backdrop-blur-sm rounded-full p-1 sm:p-1.5 hover:bg-slate-800/80 hover:text-cyan-300 transition-all duration-200 hover:scale-110 border border-slate-600/50 shadow-lg"
                                        aria-label="Play Song"
                                    >
                                        <MdPlayArrow size={12} className="sm:w-3.5 sm:h-3.5" />
                                    </button>
                                    
                                    {/* Delete Song Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteSongFromPlaylist(song, viewingPlaylist.id);
                                        }}
                                        className="text-red-400 bg-slate-900/70 backdrop-blur-sm rounded-full p-1 sm:p-1.5 hover:bg-slate-800/80 hover:text-red-300 transition-all duration-200 hover:scale-110 border border-slate-600/50 shadow-lg"
                                        aria-label="Remove song from playlist"
                                    >
                                        <MdDelete size={10} className="sm:w-3 sm:h-3" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (!playlists || playlists.length === 0) {
        return (
            <div className="p-2 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-100">Your Playlists</h2>
                    <button
                        onClick={onCreatePlaylist}
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 py-2 px-3 sm:px-4 rounded-2xl flex items-center space-x-1 sm:space-x-2 transition-all duration-200 hover:scale-105 shadow-lg shadow-cyan-500/25"
                    >
                        <MdAdd size={18} className="sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Create Playlist</span>
                        <span className="sm:hidden text-xs">Create</span>
                    </button>
                </div>
                <div className="text-center py-12">
                    <MdPlaylistPlay size={64} className="mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-400 text-lg mb-4">No playlists yet</p>
                    <p className="text-slate-500 text-sm">Create your first playlist to organize your favorite songs!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-2 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-100">Your Playlists</h2>
                <button
                    onClick={onCreatePlaylist}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 py-2 px-3 sm:px-4 rounded-2xl flex items-center space-x-1 sm:space-x-2 transition-all duration-200 hover:scale-105 shadow-lg shadow-cyan-500/25"
                >
                    <MdAdd size={18} className="sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Create Playlist</span>
                    <span className="sm:hidden text-xs">Create</span>
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {playlists.map((playlist) => (
                    <motion.div
                        key={playlist.id}
                        className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/30 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-cyan-500/20"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {editingPlaylist === playlist.id ? (
                            <div className="p-4">
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full p-2 mb-2 bg-slate-700/60 border border-slate-600/50 rounded-xl focus:outline-none focus:border-cyan-500/50 transition-all duration-200 text-slate-100"
                                />
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    placeholder="Description (optional)"
                                    className="w-full p-2 mb-3 bg-slate-700/60 border border-slate-600/50 rounded-xl focus:outline-none focus:border-cyan-500/50 transition-all duration-200 text-slate-100 placeholder-slate-400 resize-none"
                                    rows="2"
                                />
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleSaveEdit}
                                        className="flex-1 bg-green-500 hover:bg-green-600 py-1 px-2 rounded-xl text-sm transition-all duration-200"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="flex-1 bg-slate-600 hover:bg-slate-500 py-1 px-2 rounded-xl text-sm transition-all duration-200"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="h-28 sm:h-32 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                                    <MdPlaylistPlay size={40} className="sm:w-12 sm:h-12 text-cyan-400" />
                                </div>
                                <div className="p-3 sm:p-4">
                                    <h3 className="font-semibold text-sm sm:text-lg truncate text-slate-100 mb-1">{playlist.name}</h3>
                                    {playlist.description && (
                                        <p className="text-xs sm:text-sm text-slate-400 mb-2 line-clamp-2">{playlist.description}</p>
                                    )}
                                    <p className="text-xs sm:text-sm text-slate-500 mb-3">
                                        {playlist.songs.length} song{playlist.songs.length !== 1 ? 's' : ''}
                                    </p>
                                    
                                    <div className="flex items-center justify-between">
                                        <button
                                            onClick={() => handleViewPlaylist(playlist)}
                                            disabled={playlist.songs.length === 0}
                                            className="bg-cyan-500 hover:bg-cyan-600 py-1 px-2 sm:px-3 rounded-xl text-xs sm:text-sm transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="hidden sm:inline">View Songs</span>
                                            <span className="sm:hidden">View</span>
                                        </button>
                                        
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={() => handleEditPlaylist(playlist)}
                                                className="p-1.5 text-slate-400 hover:text-cyan-400 transition-all duration-200 hover:scale-110 rounded-lg hover:bg-slate-700/50"
                                            >
                                                <MdEdit size={14} className="sm:w-4 sm:h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeletePlaylist(playlist.id, playlist.name)}
                                                className="p-1.5 text-slate-400 hover:text-red-400 transition-all duration-200 hover:scale-110 rounded-lg hover:bg-slate-700/50"
                                            >
                                                <MdDelete size={14} className="sm:w-4 sm:h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}