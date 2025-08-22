import React, { useState } from 'react'
import { MdSearch } from 'react-icons/md'
import axios from 'axios'

/**
 * A simple function to strip out common extraneous text from YouTube titles.
 */
function cleanUpTitle(rawTitle = '') {
    return rawTitle
        .replace(/\(.*?\)/gi, '')
        .replace(/\[.*?\]/gi, '')
        .replace(/official\s*video/gi, '')
        .replace(/title\s*song/gi, '')
        .replace(/full\s*video/gi, '')
        .replace(/lyric\s*video/gi, '')
        .replace(/audio/gi, '')
        .replace(/\|.*$/, '')
        .trim()
}

/**
 * Removes "VEVO", " - Topic", or other known channel suffixes from channel name.
 */
function cleanUpChannel(channel = '') {
    return channel
        .replace(/vevo/gi, '')
        .replace(/- topic/gi, '')
        .trim()
}

/**
 * Attempt to parse out a "song title" and "artist" from YouTube snippet data.
 */
function parseSongAndArtist(snippetTitle, channelTitle) {
    const cleanedTitle = cleanUpTitle(snippetTitle)
    const cleanedChannel = cleanUpChannel(channelTitle)

    return {
        title: cleanedTitle || snippetTitle || 'Unknown Title',
        artist: cleanedChannel || 'Unknown Artist',
    }
}

export default function PermanentSearchBar({ setSong }) {
    const [query, setQuery] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [showSuggestions, setShowSuggestions] = useState(false)

    const fetchSuggestions = async () => {
        if (!query.trim()) {
            setSuggestions([])
            setShowSuggestions(false)
            return
        }

        const API_KEY = 'AIzaSyC-Pm8v6RUZa68yvF9Y30tbhAhmLuszs6Y'
        const API_URL = `https://www.googleapis.com/youtube/v3/search`

        setIsLoading(true)
        setError(null)

        try {
            const response = await axios.get(API_URL, {
                params: {
                    part: 'snippet',
                    q: query,
                    type: 'video',
                    maxResults: 5,
                    key: API_KEY,
                },
            })

            const results = response.data.items.map((item) => {
                const rawTitle = item.snippet.title
                const rawChannel = item.snippet.channelTitle

                const { title, artist } = parseSongAndArtist(rawTitle, rawChannel)

                return {
                    videoId: item.id.videoId,
                    title,
                    artist,
                    imageUrl:
                        item.snippet.thumbnails.high?.url ||
                        item.snippet.thumbnails.medium?.url ||
                        item.snippet.thumbnails.default.url,
                }
            })

            setSuggestions(results)
            setShowSuggestions(true)
        } catch (err) {
            console.error('Error fetching suggestions:', err)
            setError('Failed to fetch suggestions. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        fetchSuggestions()
    }

    const handleSongSelect = (song) => {
        setSong(song)
        setQuery('')
        setSuggestions([])
        setShowSuggestions(false)
    }

    return (
        <div className="relative w-full max-w-4xl mx-auto mb-4 sm:mb-6 px-2 sm:px-0">
            {/* Search Bar */}
            <form
                onSubmit={handleSubmit}
                className="bg-gradient-to-r from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-2xl border border-cyan-500/30 rounded-3xl py-3 sm:py-4 px-4 sm:px-6 flex items-center space-x-3 sm:space-x-4 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 hover:border-cyan-400/50"
            >
                <MdSearch className="text-cyan-400 flex-shrink-0" size={20} />
                <input
                    type="text"
                    placeholder="Search for songs, artists, or albums..."
                    className="flex-1 bg-transparent text-white placeholder-slate-400 focus:outline-none text-sm sm:text-lg"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button
                    type="submit"
                    className="text-cyan-400 hover:text-cyan-300 transition-all duration-200 hover:scale-110 flex-shrink-0 p-1 rounded-full hover:bg-cyan-500/10"
                    aria-label="Search"
                >
                    <MdSearch size={20} />
                </button>
            </form>

            {/* Loading Indicator */}
            {isLoading && (
                <div className="absolute top-full left-2 right-2 sm:left-0 sm:right-0 mt-2 text-center text-cyan-400 bg-slate-900/95 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-cyan-500/30 z-50 shadow-xl">
                    Loading...
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="absolute top-full left-2 right-2 sm:left-0 sm:right-0 mt-2 text-center text-red-400 bg-slate-900/95 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-red-500/30 z-50 shadow-xl">
                    {error}
                </div>
            )}

            {/* Suggestions List */}
            {showSuggestions && suggestions.length > 0 && !isLoading && !error && (
                <div className="absolute top-full left-2 right-2 sm:left-0 sm:right-0 mt-2 bg-slate-900/95 backdrop-blur-2xl border border-cyan-500/30 max-h-80 overflow-y-auto scrollbar-hidden rounded-2xl shadow-2xl z-50">
                    {suggestions.map((suggestion) => (
                        <div
                            key={suggestion.videoId}
                            onClick={() => handleSongSelect(suggestion)}
                            className="flex items-center p-3 sm:p-4 hover:bg-gradient-to-r hover:from-slate-800/80 hover:to-slate-700/80 cursor-pointer transition-all duration-200 hover:scale-[1.02] border-b border-slate-700/30 last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl"
                        >
                            <img
                                src={suggestion.imageUrl}
                                alt={suggestion.title}
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl mr-3 sm:mr-4 object-cover border border-slate-600/50 shadow-lg flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="text-slate-100 font-semibold truncate text-sm sm:text-lg">
                                    {suggestion.title}
                                </div>
                                <div className="text-slate-400 text-xs sm:text-sm truncate">
                                    {suggestion.artist}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* No Results */}
            {showSuggestions && suggestions.length === 0 && !isLoading && query.trim() !== '' && !error && (
                <div className="absolute top-full left-2 right-2 sm:left-0 sm:right-0 mt-2 text-center text-slate-400 bg-slate-900/95 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-slate-700/50 z-50 shadow-xl">
                    No results found.
                </div>
            )}
        </div>
    )
}