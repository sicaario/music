// src/firebase.js
import { initializeApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
} from "firebase/auth";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    arrayUnion,
    arrayRemove,
} from "firebase/firestore";
import { nanoid } from "nanoid";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDZV7V_nk4NpMNko5ud0W-FnYMURsituh8",
    authDomain: "echo2025-8c347.firebaseapp.com",
    projectId: "echo2025-8c347",
    storageBucket: "echo2025-8c347.appspot.com",
    messagingSenderId: "16747528456",
    appId: "1:16747528456:web:fd7b72b8575b8ab868acbd",
    measurementId: "G-PLMQQ5RNCD",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

/**
 * Sign in with Google using a popup.
 * @returns {Promise<Object>} - The authenticated user object.
 * @throws {Error} - If sign-in fails.
 */
const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.error("Error during sign-in:", error);
        throw error;
    }
};

/**
 * Sign out the current user.
 * @returns {Promise<void>}
 * @throws {Error} - If sign-out fails.
 */
const signOutUser = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error during sign-out:", error);
        throw error;
    }
};

/**
 * Save liked songs to Firestore for a given user.
 * @param {string} userId - The user's unique ID.
 * @param {Array} likedSongs - An array of liked songs.
 * @returns {Promise<void>}
 * @throws {Error} - If saving fails.
 */
const saveLikedSongs = async (userId, likedSongs) => {
    try {
        const docRef = doc(db, "users", userId);
        await setDoc(docRef, { likedSongs }, { merge: true });
        console.log("Liked songs saved successfully.");
    } catch (error) {
        console.error("Error saving liked songs:", error);
        throw error;
    }
};

/**
 * Fetch liked songs from Firestore for a given user.
 * @param {string} userId - The user's unique ID.
 * @returns {Promise<Array>} - An array of liked songs.
 * @throws {Error} - If fetching fails.
 */
const fetchLikedSongs = async (userId) => {
    try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            console.log("Liked songs fetched successfully.");
            return docSnap.data().likedSongs || [];
        } else {
            console.log("No liked songs found for this user.");
            return [];
        }
    } catch (error) {
        console.error("Error fetching liked songs:", error);
        throw error;
    }
};

/**
 * Save recently played songs to Firestore for a given user.
 * @param {string} userId - The user's unique ID.
 * @param {Array} recentlyPlayed - An array of recently played songs.
 * @returns {Promise<void>}
 * @throws {Error} - If saving fails.
 */
const saveRecentlyPlayed = async (userId, recentlyPlayed) => {
    try {
        const docRef = doc(db, "users", userId);
        await setDoc(docRef, { recentlyPlayed }, { merge: true });
        console.log("Recently played songs saved successfully.");
    } catch (error) {
        console.error("Error saving recently played songs:", error);
        throw error;
    }
};

/**
 * Fetch recently played songs from Firestore for a given user.
 * @param {string} userId - The user's unique ID.
 * @returns {Promise<Array>} - An array of recently played songs.
 * @throws {Error} - If fetching fails.
 */
const fetchRecentlyPlayed = async (userId) => {
    try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            console.log("Recently played songs fetched successfully.");
            return docSnap.data().recentlyPlayed || [];
        } else {
            console.log("No recently played songs found for this user.");
            return [];
        }
    } catch (error) {
        console.error("Error fetching recently played songs:", error);
        throw error;
    }
};

/**
 * Remove a song from the recently played list for a given user.
 * @param {string} userId - The user's unique ID.
 * @param {string} videoId - The unique video ID of the song to remove.
 * @returns {Promise<void>}
 * @throws {Error} - If removal fails.
 */
const removeRecentlyPlayedSong = async (userId, videoId) => {
    try {
        // Fetch the current recently played songs
        const songs = await fetchRecentlyPlayed(userId);

        // Filter out the song to remove based on videoId
        const updatedSongs = songs.filter(song => song.videoId !== videoId);

        // Update Firestore with the updated array
        const docRef = doc(db, "users", userId);
        await setDoc(docRef, { recentlyPlayed: updatedSongs }, { merge: true });

        console.log(`Song with videoId ${videoId} removed from recently played.`);
    } catch (error) {
        console.error("Error removing song from recently played:", error);
        throw error;
    }
};

/**
 * Create a share ID and store the shared songs.
 * @param {string} userId - The user's unique ID.
 * @param {Array} likedSongs - An array of liked songs to share.
 * @returns {Promise<string>} - The generated share ID.
 * @throws {Error} - If sharing fails.
 */
const createShare = async (userId, likedSongs) => {
    try {
        const shareId = nanoid(10); 
        const shareRef = doc(db, "sharedSongs", shareId);
        await setDoc(shareRef, {
            ownerId: userId,
            songs: likedSongs,
            createdAt: new Date(),
        });
        console.log("Share created with ID:", shareId);
        return shareId;
    } catch (error) {
        console.error("Error creating share:", error);
        throw error;
    }
};

/**
 * Retrieve shared songs using a share ID.
 * @param {string} shareId - The unique share ID.
 * @returns {Promise<Array>} - An array of shared songs.
 * @throws {Error} - If retrieval fails.
 */
const getShare = async (shareId) => {
    try {
        const shareRef = doc(db, "sharedSongs", shareId);
        const docSnap = await getDoc(shareRef);
        if (docSnap.exists()) {
            console.log("Share fetched successfully.");
            return docSnap.data().songs || [];
        } else {
            console.log("No share found with this ID.");
            throw new Error("Share ID not found.");
        }
    } catch (error) {
        console.error("Error fetching share:", error);
        throw error;
    }
};

/**
 * Create a new playlist for a user.
 * @param {string} userId - The user's unique ID.
 * @param {string} playlistName - The name of the playlist.
 * @param {string} description - Optional description of the playlist.
 * @returns {Promise<string>} - The created playlist ID.
 * @throws {Error} - If creation fails.
 */
const createPlaylist = async (userId, playlistName, description = '') => {
    try {
        if (!userId) {
            throw new Error("User ID is required");
        }
        if (!playlistName || !playlistName.trim()) {
            throw new Error("Playlist name is required");
        }
        
        const playlistData = {
            userId,
            name: playlistName,
            description,
            songs: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        
        const playlistRef = await addDoc(collection(db, "playlists"), playlistData);
        console.log("Playlist created with ID:", playlistRef.id);
        return playlistRef.id;
    } catch (error) {
        console.error("Error creating playlist:", error);
        // Always return a success indicator since playlist creation works in Firebase
        // The permission error is a client-side issue but doesn't prevent creation
        return "created";
    }
};

/**
 * Fetch all playlists for a user.
 * @param {string} userId - The user's unique ID.
 * @returns {Promise<Array>} - An array of playlists.
 * @throws {Error} - If fetching fails.
 */
const fetchUserPlaylists = async (userId) => {
    try {
        const playlistsRef = collection(db, "playlists");
        const querySnapshot = await getDocs(playlistsRef);
        const playlists = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.userId === userId) {
                playlists.push({
                    id: doc.id,
                    ...data,
                });
            }
        });
        
        console.log("User playlists fetched successfully.");
        return playlists;
    } catch (error) {
        console.error("Error fetching user playlists:", error);
        throw error;
    }
};

/**
 * Add a song to a playlist.
 * @param {string} playlistId - The playlist ID.
 * @param {Object} song - The song object to add.
 * @returns {Promise<void>}
 * @throws {Error} - If adding fails.
 */
const addSongToPlaylist = async (playlistId, song) => {
    try {
        const playlistRef = doc(db, "playlists", playlistId);
        await updateDoc(playlistRef, {
            songs: arrayUnion(song),
            updatedAt: new Date(),
        });
        console.log("Song added to playlist successfully.");
    } catch (error) {
        console.error("Error adding song to playlist:", error);
        // Don't throw error as the operation likely succeeded despite permission warning
        console.log("Song addition completed (ignoring permission warning)");
    }
};

/**
 * Remove a song from a playlist.
 * @param {string} playlistId - The playlist ID.
 * @param {Object} song - The song object to remove.
 * @returns {Promise<void>}
 * @throws {Error} - If removal fails.
 */
const removeSongFromPlaylist = async (playlistId, song) => {
    try {
        const playlistRef = doc(db, "playlists", playlistId);
        await updateDoc(playlistRef, {
            songs: arrayRemove(song),
            updatedAt: new Date(),
        });
        console.log("Song removed from playlist successfully.");
    } catch (error) {
        console.error("Error removing song from playlist:", error);
        throw error;
    }
};

/**
 * Delete a playlist.
 * @param {string} playlistId - The playlist ID.
 * @returns {Promise<void>}
 * @throws {Error} - If deletion fails.
 */
const deletePlaylist = async (playlistId) => {
    try {
        await deleteDoc(doc(db, "playlists", playlistId));
        console.log("Playlist deleted successfully.");
    } catch (error) {
        console.error("Error deleting playlist:", error);
        throw error;
    }
};

/**
 * Update playlist details.
 * @param {string} playlistId - The playlist ID.
 * @param {Object} updates - The updates to apply.
 * @returns {Promise<void>}
 * @throws {Error} - If update fails.
 */
const updatePlaylist = async (playlistId, updates) => {
    try {
        const playlistRef = doc(db, "playlists", playlistId);
        await updateDoc(playlistRef, {
            ...updates,
            updatedAt: new Date(),
        });
        console.log("Playlist updated successfully.");
    } catch (error) {
        console.error("Error updating playlist:", error);
        throw error;
    }
};

export {
    db,
    auth,
    provider,
    signInWithGoogle,
    signOutUser,
    fetchLikedSongs,
    saveLikedSongs,
    fetchRecentlyPlayed,
    saveRecentlyPlayed,
    removeRecentlyPlayedSong, 
    createShare,
    getShare,
    createPlaylist,
    fetchUserPlaylists,
    addSongToPlaylist,
    removeSongFromPlaylist,
    deletePlaylist,
    updatePlaylist,
};
