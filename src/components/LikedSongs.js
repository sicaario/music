// LikedSongs.js
import React from 'react'
import { MdArrowUpward, MdArrowDownward, MdPlaylistAdd } from 'react-icons/md'

export default function LikedSongs({ songs, onSelectSong, onReorder, user, onAddToPlaylist }) {
    if (!songs || songs.length === 0) {
        return (
            <div className="p-4">
                <p className="text-lg font-bold">No liked songs yet.</p>
            </div>
        )
    }

    return (
        <div className="p-2 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-100">Your Liked Songs</h2>
                <div className="text-xs sm:text-sm text-slate-400">
                    {songs.length} song{songs.length !== 1 ? 's' : ''}
                </div>
            </div>
            <ul className="space-y-2 sm:space-y-3 md:space-y-4">
                {songs.map((song, index) => (
                    <li
                        key={song.videoId}
                        className="bg-gradient-to-r from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/30 p-2 sm:p-3 md:p-4 rounded-2xl flex items-center justify-between min-h-14 sm:min-h-16 hover:bg-gradient-to-r hover:from-slate-800/60 hover:to-slate-700/60 transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-cyan-500/20"
                    >
                        {/* Click song to select and play */}
                        <div
                            className="cursor-pointer overflow-hidden flex-1 min-w-0 mr-2 sm:mr-3"
                            onClick={() => onSelectSong(song)}
                        >
                            {/* Truncate the song title */}
                            <div className="font-semibold text-sm sm:text-base md:text-lg truncate text-slate-100 leading-tight">{song.title}</div>
                            <div className="text-xs sm:text-sm text-slate-400 truncate leading-tight">{song.artist}</div>
                        </div>

                        {/* Up/Down arrows for reordering */}
                        <div className="flex items-center space-x-1 flex-shrink-0">
                            {/* Add to Playlist Button - Only visible when signed in */}
                            {user && onAddToPlaylist && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddToPlaylist(song);
                                    }}
                                    className="p-1.5 sm:p-2 rounded-xl hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 transition-all duration-200 hover:scale-110 touch-manipulation border border-transparent hover:border-cyan-500/30"
                                    aria-label="Add to Playlist"
                                >
                                    <MdPlaylistAdd size={16} className="sm:w-5 sm:h-5"/>
                                </button>
                            )}
                            
                            {/* Move Up */}
                            <button
                                onClick={() => onReorder(index, index - 1)}
                                disabled={index === 0}
                                className={`p-1 rounded ${
                                    index === 0
                                        ? "opacity-50 cursor-not-allowed"
                                        : "hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all duration-200 hover:scale-110 touch-manipulation border border-transparent hover:border-blue-500/30"
                                }`}
                            >
                                <MdArrowUpward size={16} className="sm:w-5 sm:h-5"/>
                            </button>

                            {/* Move Down */}
                            <button
                                onClick={() => onReorder(index, index + 1)}
                                disabled={index === songs.length - 1}
                                className={`p-1 rounded ${
                                    index === songs.length - 1
                                        ? "opacity-50 cursor-not-allowed"
                                        : "hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all duration-200 hover:scale-110 touch-manipulation border border-transparent hover:border-blue-500/30"
                                }`}
                            >
                                <MdArrowDownward size={16} className="sm:w-5 sm:h-5"/>
                            </button>
                        </div>
                    </li>

                ))}
            </ul>
        </div>
    )
}
