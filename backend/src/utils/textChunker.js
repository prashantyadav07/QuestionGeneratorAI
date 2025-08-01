// backend/src/utils/textChunker.js

/**
 * Ek bade text ko AI ke liye aasan, chote-chote tukdon (chunks) mein todta hai.
 * @param {string} text - Poora text jo todna hai.
 * @param {number} maxChunkSize - Har chunk ka maximum size (characters mein).
 * @returns {string[]} - Chunks ka ek array.
 */
export const splitTextIntoChunks = (text, maxChunkSize = 4000) => {
    const chunks = [];
    let i = 0;
    while (i < text.length) {
        chunks.push(text.slice(i, i + maxChunkSize));
        i += maxChunkSize;
    }
    return chunks;
};