// src/components/RecentlyPlayed.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FaTrash } from 'react-icons/fa';
import { MdPlaylistAdd } from 'react-icons/md';

export default function RecentlyPlayed({ songs, onSelectSong, onDeleteSong, user, onAddToPlaylist }) {
    if (!songs.length) {
        return null; 
    }

    return (
        <div className="mt-4 sm:mt-6 p-2 sm:p-4 md:p-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 text-slate-100">Recently Played</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4">
                {songs.map((song) => (
                    <div
                        key={song.videoId}
                        className="relative bg-gradient-to-b h-36 sm:h-44 md:h-48 lg:h-52 from-slate-800/60 to-slate-900/80 backdrop-blur-sm border border-slate-700/30 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-cyan-500/20"
                    >
                        <div
                            className="cursor-pointer h-full"
                            onClick={() => onSelectSong(song)} // Set as current song
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
                        </div>
                        
                        {/* Action buttons */}
                        <div className="absolute bottom-8 sm:bottom-11 md:bottom-12 right-1 sm:right-2 flex space-x-1">
                            {/* Add to Playlist Button - Only visible when signed in */}
                            {user && onAddToPlaylist && (
                                <button
                                    className="text-cyan-400 bg-slate-900/70 backdrop-blur-sm rounded-full p-1 sm:p-1.5 hover:bg-slate-800/80 hover:text-cyan-300 transition-all duration-200 hover:scale-110 border border-slate-600/50 shadow-lg"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddToPlaylist(song);
                                    }}
                                    aria-label="Add to Playlist"
                                >
                                    <MdPlaylistAdd size={12} className="sm:w-3.5 sm:h-3.5" />
                                </button>
                            )}
                            
                            {/* Delete Button */}
                            <button
                                className="text-red-400 bg-slate-900/70 backdrop-blur-sm rounded-full p-1 sm:p-1.5 hover:bg-slate-800/80 hover:text-red-300 transition-all duration-200 hover:scale-110 border border-slate-600/50 shadow-lg"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    console.log(`Attempting to delete song with videoId: ${song.videoId}`);
                                    onDeleteSong(song.videoId);
                                }}
                                aria-label="Delete Song"
                            >
                                <FaTrash size={10} className="sm:w-3 sm:h-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

RecentlyPlayed.propTypes = {
    songs: PropTypes.arrayOf(
        PropTypes.shape({
            videoId: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            artist: PropTypes.string.isRequired,
            imageUrl: PropTypes.string,
        })
    ).isRequired,
    onSelectSong: PropTypes.func.isRequired,
    onDeleteSong: PropTypes.func.isRequired, 
    user: PropTypes.object,
    onAddToPlaylist: PropTypes.func,
};
