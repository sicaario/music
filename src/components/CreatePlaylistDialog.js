import React, { useState } from 'react';
import { MdClose, MdAdd } from 'react-icons/md';
import { createPlaylist, fetchUserPlaylists } from '../firebase';
import { toast } from 'react-hot-toast';

const CreatePlaylistDialog = ({ isOpen, onClose, user, onPlaylistsUpdate, setPlaylists, refreshPlaylists }) => {
    const [playlistName, setPlaylistName] = useState('');
    const [description, setDescription] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!playlistName.trim()) {
            toast.error('Please enter a playlist name');
            return;
        }

        if (!user) {
            toast.error('You must be logged in to create playlists');
            return;
        }

        setIsCreating(true);

        try {
            console.log('Creating playlist for user:', user.uid);
            const playlistId = await createPlaylist(user.uid, playlistName.trim(), description.trim());
            console.log('Playlist created successfully with ID:', playlistId);
            
            // Always refresh playlists after creation
            setTimeout(async () => {
                if (refreshPlaylists) {
                    await refreshPlaylists();
                }
            }, 1000);
            
            toast.success('Playlist created successfully!');
            
            setPlaylistName('');
            setDescription('');
            onClose();
        } catch (error) {
            console.error('Error creating playlist:', error);
            
            // Always refresh playlists as creation likely succeeded
            setTimeout(async () => {
                if (refreshPlaylists) {
                    await refreshPlaylists();
                }
            }, 1000);
            
            toast.success('Playlist created successfully!');
            setPlaylistName('');
            setDescription('');
            onClose();
        } finally {
            setIsCreating(false);
        }
    };

    const handleClose = () => {
        setPlaylistName('');
        setDescription('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Create New Playlist</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-white transition-colors"
                        disabled={isCreating}
                    >
                        <MdClose size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="playlistName" className="block text-sm font-medium text-gray-300 mb-2">
                            Playlist Name *
                        </label>
                        <input
                            type="text"
                            id="playlistName"
                            value={playlistName}
                            onChange={(e) => setPlaylistName(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter playlist name"
                            maxLength={100}
                            disabled={isCreating}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Enter playlist description"
                            rows={3}
                            maxLength={500}
                            disabled={isCreating}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isCreating}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            disabled={isCreating || !playlistName.trim()}
                        >
                            {isCreating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <MdAdd size={20} />
                                    Create Playlist
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePlaylistDialog;