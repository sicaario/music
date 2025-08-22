// ReceiveDialog.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { MdClose } from "react-icons/md";
import { getShare } from "../firebase";
import { toast } from "react-hot-toast";

export default function ReceiveDialog({ onClose, setLikedSongs }) {
    const [inputId, setInputId] = useState("");
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState(null);

    const handleImport = async () => {
        if (!inputId.trim()) {
            setError("Please enter a valid Share ID.");
            return;
        }

        setIsImporting(true);
        setError(null);

        try {
            const sharedSongs = await getShare(inputId.trim());

            if (sharedSongs.length === 0) {
                setError("No songs found for this Share ID.");
                toast.error("No songs found for this Share ID.", {
                    position: "top-right",
                });
            } else {
                setLikedSongs((prevSongs) => {
                    const existingIds = new Set(prevSongs.map((song) => song.videoId));
                    const newSongs = sharedSongs.filter(
                        (song) => !existingIds.has(song.videoId)
                    );
                    return [...prevSongs, ...newSongs];
                });
                toast.success("Songs imported successfully!", {
                    position: "top-right",
                });
                setInputId("");
            }
        } catch (err) {
            console.error("Error importing songs:", err);
            setError("Failed to import songs. Please check the Share ID and try again.");
            toast.error("Failed to import songs.", {
                position: "top-right",
            });
        } finally {
            setIsImporting(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleImport();
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
                    aria-label="Close Receive Dialog"
                >
                    <MdClose size={24} />
                </button>

                <h2 className="text-xl font-semibold mb-4 text-slate-100">Import Shared Songs</h2>

                {error && <p className="text-red-400 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-2">{error}</p>}
                

                <input
                    type="text"
                    placeholder="Enter Share ID"
                    className="w-full p-3 mb-4 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg focus:outline-none focus:border-blue-500/50 transition-all duration-200 text-slate-100 placeholder-slate-400"
                    value={inputId}
                    onChange={(e) => setInputId(e.target.value)}
                    onKeyPress={handleKeyPress}
                />

                <button
                    onClick={handleImport}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 py-2 px-4 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg shadow-blue-500/25"
                    disabled={isImporting}
                >
                    {isImporting ? "Importing..." : "Import Songs"}
                </button>
            </motion.div>
        </motion.div>
    );
}
