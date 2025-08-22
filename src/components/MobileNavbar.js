import React, { useState } from 'react';
import { MdHome, MdFavorite, MdLogin, MdPlaylistPlay} from 'react-icons/md';
import { CiLogout } from 'react-icons/ci';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';


export default function MobileNavbar({ 
    activePanel,
    setActivePanel,
    user,          
    onSignIn,      
    onSignOut,     
    likedSongs,
    setLikedSongs,
}) {
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [isReceiveOpen, setIsReceiveOpen] = useState(false);

    // Helper function to toggle the panel
    const togglePanel = (panel) =>
        setActivePanel(activePanel === panel ? null : panel);

    return (
        <>
            <motion.nav 
                className="h-20 bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 backdrop-blur-2xl border-t border-cyan-500/30 text-white flex justify-around items-center md:hidden relative overflow-hidden"
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                {/* Futuristic glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/10 to-purple-500/5 animate-pulse" />
                
                {/* Navigation Items */}
                <div className="flex justify-around items-center w-full relative z-10">
                    {/* Home Button */}
                    <motion.button
                        className={`relative p-3 rounded-2xl transition-all duration-300 ${
                            activePanel === 'home' 
                                ? 'text-cyan-400 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 shadow-lg shadow-cyan-500/25' 
                                : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
                        }`}
                        onClick={() => togglePanel('home')}
                        aria-label="Home"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <MdHome size={24} />
                        {activePanel === 'home' && (
                            <motion.div 
                                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full"
                                layoutId="activeIndicator"
                            />
                        )}
                    </motion.button>

                    {/* Liked Songs Button */}
                    <motion.button
                        className={`relative p-3 rounded-2xl transition-all duration-300 ${
                            activePanel === 'liked' 
                                ? 'text-pink-400 bg-gradient-to-br from-pink-500/20 to-red-500/20 shadow-lg shadow-pink-500/25' 
                                : 'text-slate-300 hover:text-pink-400 hover:bg-slate-800/50'
                        }`}
                        onClick={() => togglePanel('liked')}
                        aria-label="Liked Songs"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <MdFavorite size={24} />
                        {activePanel === 'liked' && (
                            <motion.div 
                                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-pink-400 rounded-full"
                                layoutId="activeIndicator"
                            />
                        )}
                    </motion.button>

                    {/* Playlists Button - Only visible when signed in */}
                    {user && (
                        <motion.button
                            className={`relative p-3 rounded-2xl transition-all duration-300 ${
                                activePanel === 'playlists' 
                                    ? 'text-purple-400 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 shadow-lg shadow-purple-500/25' 
                                    : 'text-slate-300 hover:text-purple-400 hover:bg-slate-800/50'
                            }`}
                            onClick={() => togglePanel('playlists')}
                            aria-label="Playlists"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <MdPlaylistPlay size={24} />
                            {activePanel === 'playlists' && (
                                <motion.div 
                                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-400 rounded-full"
                                    layoutId="activeIndicator"
                                />
                            )}
                        </motion.button>
                    )}

                    {/* Sign-In / Sign-Out Button */}
                    <motion.button
                        className="relative p-3 rounded-2xl text-slate-300 hover:text-orange-400 hover:bg-slate-800/50 transition-all duration-300"
                        onClick={user ? onSignOut : onSignIn}
                        aria-label={user ? "Sign Out" : "Sign In"}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {user ? <CiLogout size={24} /> : <MdLogin size={24} />}
                    </motion.button>
                </div>
            </motion.nav>

        </>
    );
}

MobileNavbar.propTypes = {
    activePanel: PropTypes.string.isRequired,
    setActivePanel: PropTypes.func.isRequired,
    user: PropTypes.object,               
    onSignIn: PropTypes.func.isRequired,  
    onSignOut: PropTypes.func.isRequired,
    likedSongs: PropTypes.array.isRequired,
    setLikedSongs: PropTypes.func.isRequired,
};
