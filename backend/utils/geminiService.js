import axios from 'axios';

export const generateGeminiEvaluation = async (imageUrl) => {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    // Sample endpoint: adjust the URL and request payload as needed per Gemini API documentation
    const endpoint = `https://generativeai.googleapis.com/v1beta2/models/gemini:predict?key=${apiKey}`;

    const requestData = {
      prompt: `Please evaluate the following image: ${imageUrl}`,
      // Include additional parameters as required by the Gemini API
      // For example:
      // temperature: 0.5,
      // maxOutputTokens: 256,
    };

    const response = await axios.post(endpoint, requestData);
    // Process the response as needed (this is just an example)
    return response.data;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return 'Error evaluating image';
  }
};
