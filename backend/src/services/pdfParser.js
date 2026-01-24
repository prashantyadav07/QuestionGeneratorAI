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
    const data = await pdfExtract.extractBuffer(pdfBuffer, {}); 
    
    if (!data || !data.pages || data.pages.length === 0) {
      throw new Error("PDF has no extractable text content");
    }
    
    // Extract text from all pages
    const text = data.pages.map(page => {
      if (!page.content || page.content.length === 0) {
        return '';
      }
      return page.content.map(item => item.str || '').join(' ');
    }).join('\n').trim();

    if (!text || text.length === 0) {
      throw new Error("No text could be extracted from the PDF. The PDF may be image-based (scanned document). Please try an OCR service or provide a text-based PDF.");
    }

    return text;

  } catch (error) {
    console.error("❌ PDF Parsing Error:", error.message);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};