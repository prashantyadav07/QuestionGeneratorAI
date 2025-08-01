// src/services/pdfParser.js
import { PDFExtract } from 'pdf.js-extract';

/**
 * Extract plain text from PDF buffer using pdf.js-extract
 * @param {Buffer} pdfBuffer - Buffer of uploaded PDF file
 * @returns {Promise<string>} - Extracted plain text
 */
export const extractTextFromPDF = async (pdfBuffer) => {
  const pdfExtract = new PDFExtract();
  try {
    // Nayi library buffer aur ek khali object leti hai
    const data = await pdfExtract.extractBuffer(pdfBuffer, {}); 
    
    // Iska output thoda alag hota hai, hum saare pages ke text ko jodenge
    const text = data.pages.map(page => {
      return page.content.map(item => item.str).join(' ');
    }).join('\n');

    return text;

  } catch (error) {
    console.error("❌ PDF Parsing Error:", error);
    throw new Error("Failed to extract text from PDF.");
  }
};