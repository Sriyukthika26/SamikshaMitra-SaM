// controllers/geminiController.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();


function bufferToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType,
    },
  };
}

export const geminiImageEvaluation = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Initialize with the latest model name
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest", // Updated model name
    });

    const imagePart = bufferToGenerativePart(
      req.file.buffer,
      req.file.mimetype
    );
    const prompt =
      "Please listen carefully to the attached audio file and provide an accurate transcription of the speech. Capture all spoken words, including any speaker cues or significant pauses. Ignore any background noise that isn't part of the spoken content.";

    // Updated content generation format
    const result = await model.generateContent({
      contents: [
        {
          parts: [{ text: prompt }, imagePart],
        },
      ],
    });

    const response = await result.response;
    const text = response.text();

    return res.status(200).json({
      message: "Image analysis successful",
      analysis: text,
    });
  } catch (error) {
    console.error("Error in geminiImageEvaluation:", error);
    return res.status(500).json({
      error: "Image analysis failed",
      details: error.message,
    });
  }
};

export const geminiUrlEvaluation = async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) return res.status(400).json({ error: 'No URL provided' });
  
      // Fetch image from Cloudinary URL
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      const mimeType = response.headers.get('content-type');
  
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
  
      const imagePart = bufferToGenerativePart(Buffer.from(buffer), mimeType);
      const prompt = "Give detailed evaluation of the file uploaded";
      
      const result = await model.generateContent({
        contents: [{ parts: [{ text: prompt }, imagePart] }]
      });
      
      const text = (await result.response).text();
      res.status(200).json({ analysis: text });
    } catch (error) {
      console.error('Error in geminiUrlEvaluation:', error);
      res.status(500).json({ error: 'Analysis failed', details: error.message });
    }
  };
