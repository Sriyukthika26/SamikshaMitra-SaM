// controllers/geminiController.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

function bufferToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType
    }
  };
}

export const geminiImageEvaluation = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Initialize with the latest model name
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash-latest' // Updated model name
    });

    const imagePart = bufferToGenerativePart(req.file.buffer, req.file.mimetype);
    const prompt = "give detailed evaluation of the file uploaded";
    
    // Updated content generation format
    const result = await model.generateContent({
      contents: [{
        parts: [
          { text: prompt },
          imagePart
        ]
      }]
    });
    
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({
      message: 'Image analysis successful',
      analysis: text
    });

  } catch (error) {
    console.error('Error in geminiImageEvaluation:', error);
    return res.status(500).json({ 
      error: 'Image analysis failed',
      details: error.message
    });
  }
};