/**
 * Splits text into intelligent chunks considering word boundaries
 * and adding overlap for better context preservation
 * @param {string} text - The text to split
 * @param {number} maxChunkSize - Maximum characters per chunk
 * @param {number} overlapSize - Overlap size for context preservation
 * @returns {string[]} - Array of text chunks
 */
export const splitTextIntoChunks = (text, maxChunkSize = 4000, overlapSize = 200) => {
    if (!text || typeof text !== 'string') {
        console.warn('Invalid text provided to splitTextIntoChunks');
        return [];
    }

    const trimmedText = text.trim();

    // If text is short enough, return as single chunk
    if (trimmedText.length <= maxChunkSize) {
        return [trimmedText];
    }

    const chunks = [];
    let startIndex = 0;
    const minChunkSize = 100; // Minimum useful chunk size

    while (startIndex < trimmedText.length) {
        // Calculate end index
        let endIndex = Math.min(startIndex + maxChunkSize, trimmedText.length);

        // If not at the end of text, try to find sentence/paragraph boundary
        if (endIndex < trimmedText.length) {
            // Try to find sentence boundaries first (. ! ?)
            const sentenceEndPattern = /[.!?]\s/g;
            let lastSentenceEnd = -1;
            let match;

            sentenceEndPattern.lastIndex = startIndex;
            while ((match = sentenceEndPattern.exec(trimmedText.slice(0, endIndex))) !== null) {
                lastSentenceEnd = match.index + 1; // Include the punctuation
            }

            // If we found a good sentence boundary
            if (lastSentenceEnd > startIndex + maxChunkSize * 0.7) {
                endIndex = lastSentenceEnd;
            } else {
                // Fall back to paragraph boundary
                let paragraphIndex = trimmedText.lastIndexOf('\n\n', endIndex);
                if (paragraphIndex > startIndex + maxChunkSize * 0.6) {
                    endIndex = paragraphIndex;
                } else {
                    // Fall back to newline
                    let newlineIndex = trimmedText.lastIndexOf('\n', endIndex);
                    if (newlineIndex > startIndex + maxChunkSize * 0.6) {
                        endIndex = newlineIndex;
                    } else {
                        // Last resort: word boundary
                        let spaceIndex = trimmedText.lastIndexOf(' ', endIndex);
                        if (spaceIndex > startIndex + maxChunkSize * 0.7) {
                            endIndex = spaceIndex;
                        }
                    }
                }
            }
        }

        // Extract chunk
        let chunk = trimmedText.substring(startIndex, endIndex).trim();

        // Only add non-empty chunks that meet minimum size (except last chunk)
        if (chunk && (chunk.length >= minChunkSize || endIndex === trimmedText.length)) {
            chunks.push(chunk);
        }

        // Move start index forward, considering overlap
        if (endIndex >= trimmedText.length) {
            break; // We've reached the end
        }

        startIndex = Math.max(startIndex + 1, endIndex - overlapSize);
    }

    return chunks.filter(chunk => chunk.length > 0);
};