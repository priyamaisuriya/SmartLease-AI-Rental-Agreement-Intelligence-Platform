const fs = require('fs');

const extractTextFromPDF = async (filePath) => {
  const pdfParse = require('pdf-parse');

  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);

  return data.text || '';
};

const extractTextFromDOCX = async (filePath) => {
  const mammoth = require('mammoth');

  const result = await mammoth.extractRawText({
    path: filePath
  });

  return result.value || '';
};

const extractDocumentText = async (filePath, fileType) => {
  if (!filePath) {
    throw new Error('File path is required');
  }

  const normalizedType = fileType.toLowerCase();

  if (normalizedType === 'pdf') {
    return extractTextFromPDF(filePath);
  }

  if (normalizedType === 'docx') {
    return extractTextFromDOCX(filePath);
  }

  if (normalizedType === 'doc') {
    throw new Error(
      'DOC files are uploaded successfully, but text extraction for DOC is not supported yet'
    );
  }

  throw new Error(`Unsupported document type: ${fileType}`);
};

module.exports = {
  extractDocumentText
};