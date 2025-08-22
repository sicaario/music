// Navbar.jsx
import React, { useState } from "react";
import {
    MdHome,
    MdPerson,
    MdFavorite,
    MdLogin,
    MdShare,
    MdDownload,
    MdPlaylistPlay,
} from "react-icons/md";
import { CiLogout } from "react-icons/ci";
import logo from "./logo.png";
import ShareDialog from "./ShareDialog";
import ReceiveDialog from "./ReceiveDialog";
import CreatePlaylistDialog from "./CreatePlaylistDialog";

export default function Navbar({
                                   activePanel,
                                   setActivePanel,
                                   user,
                                   onSignIn,
                                   onSignOut,
                                   likedSongs,
                                   setLikedSongs,
                                   playlists,
                                   setPlaylists,
                               }) {
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [isReceiveOpen, setIsReceiveOpen] = useState(false);
    const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);

    const togglePanel = (panel) =>
        setActivePanel(activePanel === panel ? null : panel);

    return (
        <>
            <nav className="fixed top-0 left-0 h-full w-16 bg-slate-950/80 backdrop-blur-xl border-r border-slate-700/50 text-white flex flex-col items-center py-6 space-y-12">
                {/* Logo */}
                <div className="w-12 h-12 flex items-center justify-center rounded-xl shadow-lg shadow-blue-500/25">
                    <img
                        className="rounded-full h-12"
                        src={logo}
                        alt="Navbar Logo"
                    />
                </div>

                {/* Navigation Icons */}
                <div className="flex flex-col pt-4 space-y-6 mt-6">
                    <button
                        className={`hover:text-blue-400 transition-all duration-200 hover:scale-110 ${
                            activePanel === "home" ? "text-blue-400 bg-blue-500/20 rounded-lg p-2" : "p-2"
                        }`}
                        onClick={() => togglePanel("home")}
                        aria-label="Home"
                    >
                        <MdHome size={26} />
                    </button>

                    <button
                        className={`hover:text-blue-400 transition-all duration-200 hover:scale-110 pt-6 ${
                            activePanel === "liked" ? "text-blue-400 bg-blue-500/20 rounded-lg p-2" : "p-2"
                        }`}
                        onClick={() => togglePanel("liked")}
                        aria-label="Liked Songs"
                    >
                        <MdFavorite size={26} />
                    </button>

                    <button
                        className={`hover:text-blue-400 transition-all duration-200 hover:scale-110 pt-6 ${
                            activePanel === "share" ? "text-blue-400 bg-blue-500/20 rounded-lg p-2" : "p-2"
                        }`}
                        onClick={() => setIsShareOpen(true)}
                        aria-label="Share Liked Songs"
                    >
                        <MdShare size={26} />
                    </button>

                    <button
                        className={`hover:text-blue-400 transition-all duration-200 hover:scale-110 pt-6 ${
                            activePanel === "receive" ? "text-blue-400 bg-blue-500/20 rounded-lg p-2" : "p-2"
                        }`}
                        onClick={() => setIsReceiveOpen(true)}
                        aria-label="Receive Shared Songs"
                    >
                        <MdDownload size={26} />
                    </button>

                    {/* Playlists Button - Only visible when signed in */}
                    {user && (
                        <button
                            className={`hover:text-blue-400 transition-all duration-200 hover:scale-110 pt-6 ${
                                activePanel === "playlists" ? "text-blue-400 bg-blue-500/20 rounded-lg p-2" : "p-2"
                            }`}
                            onClick={() => togglePanel("playlists")}
                            aria-label="Playlists"
                        >
                            <MdPlaylistPlay size={26} />
                        </button>
                    )}

                    <button
                        className={`hover:text-blue-400 transition-all duration-200 hover:scale-110 pt-6 ${
                            activePanel === "signin" ? "text-blue-400 bg-blue-500/20 rounded-lg p-2" : "p-2"
                        }`}
                        onClick={user ? onSignOut : onSignIn}
                        aria-label={user ? "Sign Out" : "Sign In"}
                    >
                        {user ? <CiLogout size={26} /> : <MdLogin size={24} />}
                    </button>
                </div>
            </nav>

            {/* Share Dialog */}
            {isShareOpen && (
                <ShareDialog
                    onClose={() => setIsShareOpen(false)}
                    likedSongs={likedSongs}
                />
            )}

            {/* Receive Dialog */}
            {isReceiveOpen && (
                <ReceiveDialog
                    onClose={() => setIsReceiveOpen(false)}
                    setLikedSongs={setLikedSongs}
                />
            )}

            {/* Create Playlist Dialog */}
            {isCreatePlaylistOpen && (
                <CreatePlaylistDialog
                    onClose={() => setIsCreatePlaylistOpen(false)}
                    setPlaylists={setPlaylists}
                />
            )}
        </>
    );
}
