// ShareDialog.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { MdClose, MdContentCopy } from "react-icons/md";
import { FaSpinner } from "react-icons/fa";
import { createShare, auth } from "../firebase";
import { toast } from "react-hot-toast";

export default function ShareDialog({ onClose, likedSongs }) {
    const [shareId, setShareId] = useState(null);
    const [isCopying, setIsCopying] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [error, setError] = useState(null);

    const handleShare = async () => {
        if (likedSongs.length === 0) {
            setError("You have no liked songs to share.");
            return;
        }

        setIsSharing(true);
        try {
            const user = auth.currentUser;
            if (!user) {
                setError("You must be signed in to share songs.");
                setIsSharing(false);
                return;
            }
            const generatedShareId = await createShare(user.uid, likedSongs);
            setShareId(generatedShareId);
            setError(null);
            toast.success("Share ID generated successfully!", {
                position: "top-right",
            });
        } catch (err) {
            console.error("Error sharing songs:", err);
            setError("Failed to generate Share ID. Please try again.");
            toast.error("Failed to generate Share ID.", {
                position: "top-right",
            });
        } finally {
            setIsSharing(false);
        }
    };

    const handleCopy = () => {
        if (shareId) {
            setIsCopying(true); 
            navigator.clipboard.writeText(shareId)
                .then(() => {
                    toast.success("Share ID copied to clipboard!", {
                        position: "top-right",
                    });
                    setTimeout(() => setIsCopying(false), 2000);
                })
                .catch((err) => {
                    console.error("Failed to copy:", err);
                    toast.error("Failed to copy Share ID.", {
                        position: "top-right",
                    });
                    setIsCopying(false);
                });
        }
    };

    const handleWhatsAppShare = () => {
        if (shareId) {
            const message = `Hey! Check out my Playlist at https://echo25.netlify.app/ using this Share ID: ${shareId} `;
            const whatsappURL = `https://wa.me/?text=${encodeURIComponent(
                message
            )}`;
            window.open(whatsappURL, "_blank");
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
                className="bg-slate-950/90 backdrop-blur-xl border border-slate-700/50 p-6 rounded-xl shadow-xl w-80 text-white relative"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                transition={{ duration: 0.3 }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-slate-400 hover:text-slate-200 transition-all duration-200 hover:scale-110"
                    aria-label="Close Share Dialog"
                >
                    <MdClose size={24} />
                </button>

                <h2 className="text-xl font-semibold mb-4 text-slate-100">Share Your Liked Songs</h2>

                {error && <p className="text-red-400 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-2">{error}</p>}
                

                {!shareId ? (
                    <button
                        onClick={handleShare}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 py-2 px-4 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg shadow-blue-500/25"
                        disabled={isSharing}
                    >
                        {isSharing ? "Sharing..." : "Share Liked Songs"}
                    </button>
                ) : (
                    <div className="flex flex-col items-center">
                        <p className="mb-2 text-slate-300">Share ID:</p>
                        <div className="flex items-center bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 p-2 rounded-lg w-full">
                            <span className="flex-1 break-all">{shareId}</span>
                            <button
                                onClick={handleCopy}
                                className={`ml-2 text-gray-300 hover:text-gray-100 flex items-center ${
                                    isCopying ? 'opacity-50 cursor-not-allowed' : ''
                                } transition-all duration-200 hover:scale-110`}
                                aria-label="Copy Share ID"
                                disabled={isCopying}
                            >
                                {isCopying ? (
                                    <FaSpinner size={20} className="animate-spin" />
                                ) : (
                                    <MdContentCopy size={20} />
                                )}
                            </button>
                        </div>

                        {/* WhatsApp Share Button */}
                        <button
                            onClick={handleWhatsAppShare}
                            className="mt-4 bg-green-500 hover:bg-green-600 py-2 px-4 rounded-xl flex items-center space-x-2 transition-all duration-200 hover:scale-105 shadow-lg shadow-green-500/25"
                        >
                            <img
                                src="https://img.icons8.com/color/24/000000/whatsapp--v1.png"
                                alt="WhatsApp Icon"
                                className="w-5 h-5"
                            />
                            <span>Share via WhatsApp</span>
                        </button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
