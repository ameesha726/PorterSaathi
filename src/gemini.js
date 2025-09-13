import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyAJSxO_k0E4ZEzP7NPpRpLZmMxqQV1wQtM"; // 🔑 replace with your real key
const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 50,
  responseMimeType: "text/plain",
};

async function run(prompt) {
  // Gemini automatically handles multiple languages
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig,
  });

  const result = await model.generateContent(prompt);
  return result.response.text(); // returns in same language as prompt
}

export default run;
