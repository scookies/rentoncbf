/**
 * YouTube API Configuration
 * 
 * Instructions:
 * 1. Get a YouTube API key from Google Cloud Console
 * 2. Enable YouTube Data API v3
 * 3. Replace YOUR_API_KEY_HERE with your actual API key
 * 4. Replace the video IDs with your actual video IDs
 * 
 * To find video IDs:
 * - From a YouTube URL like: https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - The video ID is: dQw4w9WgXcQ (the part after v=)
 */

// Configure YouTube API when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (window.youtubeManager) {
        // REPLACE THESE VALUES WITH YOUR ACTUAL API KEY AND VIDEO IDs
        window.youtubeManager
            .setApiKey('AIzaSyB_YGXb9LenWiaYqHTCZDuGXzK9owU2Vyo')  // Replace with your YouTube API key
            .setVideoIds([
		'JEc-gFf1dgc',
                '8wWaJ13OIYQ',  // Replace with your first video ID
                'uvHvQ5zwcds',  // Replace with your second video ID
                'O_3WNxGBuDM',
		'mswFroYx0-4',
		'IxZtfh7IRzE',
		'hVAv-ElXqJU',
		'sZ7zh9GXLyk',// Add more video IDs as needed
            ]);
    }
});

// Example configuration (uncomment and modify):
/*
document.addEventListener('DOMContentLoaded', function() {
    if (window.youtubeManager) {
        window.youtubeManager
            .setApiKey('AIzaSyBOxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
            .setVideoIds([
                'dQw4w9WgXcQ',
                'jNQXAC9IVRw',
                'astISOttCQ0'
            ]);
    }
});
*/
