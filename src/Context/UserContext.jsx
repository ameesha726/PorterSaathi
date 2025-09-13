import React, { createContext, useState } from "react";
import * as models from "../models"; // Ensure ../models/index.js exists

export const dataContext = createContext();

function UserContext({ children }) {
  const [speaking, setSpeaking] = useState(false);
  const [prompt, setPrompt] = useState("listening...");
  const [response, setResponse] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini");

  // 🔊 Text-to-Speech with auto language detection
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);

    // Detect language based on Unicode ranges
    if (/[\u0900-\u097F]/.test(text)) utterance.lang = "hi-IN"; // Hindi / Marathi
    else if (/[\u0B80-\u0BFF]/.test(text)) utterance.lang = "ta-IN"; // Tamil
    else if (/[\u0C00-\u0C7F]/.test(text)) utterance.lang = "te-IN"; // Telugu
    else if (/[\u0980-\u09FF]/.test(text)) utterance.lang = "bn-IN"; // Bengali
    else utterance.lang = "en-US"; // Default English

    utterance.volume = 1;
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  // 🤖 AI fallback
  const aiResponse = async (command) => {
    if (!models[selectedModel]) return;
    setSpeaking(true);
    try {
      const text = await models[selectedModel](command);
      const cleaned = text.replace(/\*\*/g, "").replace(/\*/g, "").replace(/google/gi, "Sant");
      setPrompt(cleaned);
      speak(cleaned);
      setResponse(true);
    } catch (err) {
      console.error("AI error:", err);
      setPrompt("Sorry, I could not process that.");
      speak("Sorry, I could not process that.");
    } finally {
      setTimeout(() => setSpeaking(false), 5000);
    }
  };

  // 🎙️ Speech recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.onresult = (e) => {
    const transcript = e.results[e.resultIndex][0].transcript;
    setPrompt(transcript);
    takeCommand(transcript.toLowerCase());
  };

  // 🌐 Predefined multilingual commands
  const commandMap = {
    // Websites
    "open youtube": "https://www.youtube.com/",
    "youtube kholo": "https://www.youtube.com/",
    "open google": "https://www.google.com/",
    "google kholo": "https://www.google.com/",
    "open chatgpt": "https://chat.openai.com/",
    "chatgpt kholo": "https://chat.openai.com/",
    "open digilocker": "https://digilocker.gov.in/",
    "digilocker kholo": "https://digilocker.gov.in/",
    "open umang": "https://web.umang.gov.in/",
    "umang kholo": "https://web.umang.gov.in/",

    // Emergency
    "emergency": "Emergency activated. Aapka call turant process ho raha hai.",
    "sahayata": "Emergency activated. Aapka call turant process ho raha hai.",
    
    // Business / Earnings
    "today's earnings": "Aaj ki kamai 1800 rupaye hai.",
    "aaj ki kamai": "Aaj ki kamai 1800 rupaye hai.",
    "yesterday's earnings": "Kal ki kamai 1500 rupaye hai.",
    "kal ki kamai": "Kal ki kamai 1500 rupaye hai.",

    // Learning / Tutorials
    "how to contest challan": "Step-by-step guide to contest traffic challan shuru ho raha hai.",
    "challan kaise contest karein": "Step-by-step guide to contest traffic challan shuru ho raha hai.",
  // 📌 Websites / Gov Portals
  "open mparivahan": "https://parivahan.gov.in/parivahan/",
  "open epass": "https://epass.hp.gov.in/",
  "open aadhar": "https://resident.uidai.gov.in/",
  "open pan": "https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html",
  "open gst portal": "https://www.gst.gov.in/",
  "open rto": "https://parivahan.gov.in/rcdl/",
  "open sbi": "https://www.onlinesbi.com/",
  "open icici": "https://www.icicibank.com/",
  "open hdfc": "https://www.hdfcbank.com/",
  "open upi": "https://www.upi.org/",

  // ⏰ Time & Date
  "what time is it": new Date().toLocaleTimeString(),
  "current time": new Date().toLocaleTimeString(),
  "today's date": new Date().toLocaleDateString(),
  "what's the date today": new Date().toLocaleDateString(),

  // 💰 Earnings / Business
  "today's earnings": "Aaj ki kamai 1800 rupaye hai.",
  "yesterday's earnings": "Kal ki kamai 1500 rupaye hai.",
  "this week's earnings": "Iss hafte ki total kamai 12000 rupaye hai.",
  "last week's earnings": "Pichle hafte ki total kamai 11000 rupaye hai.",
  "this month's earnings": "Iss mahine ki total kamai 48000 rupaye hai.",
  "last month's earnings": "Pichle mahine ki total kamai 45000 rupaye hai.",
  "show penalties": "Aapke account me 2 penalties hain, 30 minute late delivery ke liye.",
  "show rewards": "Aapko 3 rewards mile hain, sab time par deliveries complete karne ke liye.",
  "business growth": "Aapka business pichle hafte se 12% behtar hai.",
  "total deliveries today": "Aaj ki total deliveries 15 hain.",
  "total deliveries this week": "Iss hafte total deliveries 85 hain.",
  "average delivery time": "Average delivery time aaj 25 minutes hai.",

  // 🚨 Safety / Emergency
  "emergency": "Emergency activated. Aapka call turant process ho raha hai.",
  "sahayata button": "Emergency help activated. Kripya shant rahe.",
  "accident nearby": "Accident reported nearby. Drive carefully.",
  "roadblock ahead": "Roadblock ahead, please take an alternate route.",
  "weather alert": "Aaj ka mausam kharab hai. Drive carefully.",
  "vehicle breakdown": "Breakdown assistance requested. Help is on the way.",
  "traffic jam": "Traffic jam reported. Suggested alternate route activated.",

  // 🏫 Learning / Tutorials
  "how to contest challan": "Step-by-step guide to contest traffic challan shuru ho raha hai.",
  "how to upload documents": "Audio guide for uploading documents to DigiLocker shuru ho raha hai.",
  "vehicle insurance tutorial": "Vehicle insurance ke liye short tutorial audio shuru ho raha hai.",
  "customer service tips": "Customer service ke tips audio format mein sunaiye.",
  "government schemes info": "Important government schemes summary sunaiye audio format mein.",
  "how to use umang app": "Umang app ka audio tutorial shuru ho raha hai.",
  "tax filing guide": "Income tax filing ka step-by-step guide audio shuru ho raha hai.",
  "loan application tutorial": "Loan application guide shuru ho raha hai.",

  // 🎉 Fun / Misc
  "tell me a joke": "Ek joke: Ek driver bola - traffic signal red, aur main green!",
  "tell me a short story": "Ek chhoti kahani: Ek driver apni gaadi lekar adventure par nikal pada...",
  "poem for kids": "Chandni raat mein, gaadi chalti jaaye...",
  "weather today": "Aaj ka weather clear hai, 32 degree Celsius.",
  "latest news": "Top news: India vs Australia cricket match aaj ho raha hai.",
  "fun fact": "Fun fact: Bharat me sabse lambi highway NH44 hai.",
  "daily motivation": "Aaj ka motivation: Mehnat ka phal hamesha meetha hota hai.",

  // 🗂 Miscellaneous Commands
  "help menu": "Aapke liye available commands list shuru ho raha hai.",
  "list of commands": "Aapko guide ke liye commands list sunai ja rahi hai.",
  "feedback": "Kripya apna feedback bolein. Hum sun rahe hain.",
  "support": "Support team ko call connect kar rahe hain.",
  "settings": "Settings menu open kar diya gaya hai.",
  "change language": "Language preferences menu open kar diya gaya hai.",
  "contact support": "Support team se connect kar rahe hain.",
  "reset app": "App reset ho raha hai. Kripya thoda intezaar karein.",
  "restart voice assistant": "Voice assistant restart ho raha hai.",
  "pause assistant": "Voice assistant temporarily paused.",
  "resume assistant": "Voice assistant resumed.",
  "start training module": "Training module shuru ho raha hai.",
  "stop training module": "Training module stop kar diya gaya hai.",

  "open youtube": "https://www.youtube.com/",
  "youtube kholo": "https://www.youtube.com/",
  "open google": "https://www.google.com/",
  "google kholo": "https://www.google.com/",
  "open chatgpt": "https://chat.openai.com/",
  "chatgpt kholo": "https://chat.openai.com/",
  "open digilocker": "https://digilocker.gov.in/",
  "digilocker kholo": "https://digilocker.gov.in/",
  "open umang": "https://web.umang.gov.in/",
  "umang kholo": "https://web.umang.gov.in/",

  // ⏰ Time & Date
  "what time is it": new Date().toLocaleTimeString(),
  "samay kya hai": new Date().toLocaleTimeString(),
  "current time": new Date().toLocaleTimeString(),
  "aaj ki tareekh kya hai": new Date().toLocaleDateString(),
  "today's date": new Date().toLocaleDateString(),

  // 💰 Earnings / Business
  "today's earnings": "Aaj ki kamai 1800 rupaye hai.",
  "aaj ki kamai": "Aaj ki kamai 1800 rupaye hai.",
  "yesterday's earnings": "Kal ki kamai 1500 rupaye hai.",
  "kal ki kamai": "Kal ki kamai 1500 rupaye hai.",
  "this week's earnings": "Iss hafte ki total kamai 12000 rupaye hai.",
  "iss hafte ki kamai": "Iss hafte ki total kamai 12000 rupaye hai.",

  // 🚨 Safety / Emergency
  "emergency": "Emergency activated. Aapka call turant process ho raha hai.",
  "sahayata": "Emergency activated. Aapka call turant process ho raha hai.",
  "accident nearby": "Accident reported nearby. Drive carefully.",
  "sadak durghatna": "Accident reported nearby. Drive carefully.",
  "roadblock ahead": "Roadblock ahead, please take an alternate route.",
  "sadak band hai": "Roadblock ahead, please take an alternate route.",

  // 🏫 Learning / Tutorials
  "how to contest challan": "Step-by-step guide to contest traffic challan shuru ho raha hai.",
  "challan kaise contest karein": "Step-by-step guide to contest traffic challan shuru ho raha hai.",
  "how to upload documents": "Audio guide for uploading documents to DigiLocker shuru ho raha hai.",
  "documents kaise upload karein": "Audio guide for uploading documents to DigiLocker shuru ho raha hai.",
  "vehicle insurance tutorial": "Vehicle insurance ke liye short tutorial audio shuru ho raha hai.",
  "gaadi insurance guide": "Vehicle insurance ke liye short tutorial audio shuru ho raha hai.",

  // 🎉 Fun / Misc
  "tell me a joke": "Ek joke: Ek driver bola - traffic signal red, aur main green!",
  "mujhe joke sunao": "Ek joke: Ek driver bola - traffic signal red, aur main green!",
  "tell me a story": "Ek short story: Ek driver adventure par nikal pada...",
  "ek kahani sunao": "Ek short story: Ek driver adventure par nikal pada...",

  // 🏦 Banking / Finance
  "check account balance": "Your current account balance is 25,000 INR.",
  "balance dekhao": "Your current account balance is 25,000 INR.",
  "view last transaction": "Last transaction: 2,500 INR credited.",
  "aakhri transaction dikhao": "Last transaction: 2,500 INR credited.",
  "pay electricity bill": "Electricity bill payment process shuru ho raha hai.",
  "bijli ka bill bharein": "Electricity bill payment process shuru ho raha hai.",

  // 🌐 Regional Language Examples
  "நண்பர்கள் யூடியூப் திற": "https://www.youtube.com/", // Tamil: open YouTube
  "చాట్ జిపిటి ఓపెన్ చేయండి": "https://chat.openai.com/", // Telugu: open ChatGPT
  "গুগল খুলুন": "https://www.google.com/", // Bengali: open Google
  "गूगल खोलो": "https://www.google.com/", // Marathi/Hindi


  // 🔄 More Business Commands
  "check balance": "Aapka account balance 25000 rupaye hai.",
  "pending invoices": "Aapke 3 invoices pending hain.",
  "paid invoices": "Aapke 5 invoices successfully paid hain.",
  "update profile": "Profile update menu open ho raha hai.",
  "upload document": "Document upload process shuru ho raha hai.",
  "view performance": "Aapke business performance ka summary sunaiye ja raha hai.",
  "delivery history": "Last 10 deliveries ka record sunaiye ja raha hai.",
  "weekly report": "Weekly business report audio mein sunaiye ja raha hai.",
  "monthly report": "Monthly report audio format mein sunaiye ja raha hai.",
  "yearly report": "Yearly summary report audio format mein sunaiye ja raha hai.",

  // 🚦 Safety & Traffic Alerts
  "alert road hazard": "Road hazard ahead. Drive carefully.",
  "alert traffic": "Traffic alert ahead. Take alternate route.",
  "alert weather": "Weather alert: heavy rain expected.",
  "alert accident": "Accident ahead. Slow down.",
  "alert construction": "Construction ahead. Drive carefully.",
  "alert school zone": "School zone ahead. Slow down.",
  "alert railway crossing": "Railway crossing ahead. Be careful.",

  // 🏦 Financial / Banking
  "check account balance": "Your current account balance is 25,000 INR.",
  "view last transaction": "Last transaction: 2,500 INR credited.",
  "pay electricity bill": "Electricity bill payment process shuru ho raha hai.",
  "pay water bill": "Water bill payment process shuru ho raha hai.",
  "pay gas bill": "Gas bill payment process shuru ho raha hai.",
  "pay mobile bill": "Mobile bill payment process shuru ho raha hai.",
  "pay broadband bill": "Broadband bill payment process shuru ho raha hai.",
  "loan status": "Your loan application is under review.",
  "emi details": "Your EMI due this month is 5,000 INR.",
  "investment portfolio": "Investment portfolio summary sunaiye ja raha hai.",

    // Fun
    "tell me a joke": "Ek joke: Ek driver bola - traffic signal red, aur main green!",
    "mujhe joke sunao": "Ek joke: Ek driver bola - traffic signal red, aur main green!",

    // Regional languages
    "நண்பர்கள் யூடியூப் திற": "https://www.youtube.com/", // Tamil
    "చాట్ జిపిటి ఓపెన్ చేయండి": "https://chat.openai.com/", // Telugu
    "গুগল খুলুন": "https://www.google.com/", // Bengali
    "गूगल खोलो": "https://www.google.com/" // Hindi / Marathi
  };

  // 🗣️ Handle commands
  const takeCommand = (command) => {
    if (typeof command !== "string") return;

    for (const key in commandMap) {
      if (command.includes(key)) {
        const value = commandMap[key];
        if (value.startsWith("http")) {
          speak(`Redirecting to ${key}...`);
          window.open(value, "_blank");
          setPrompt(`Redirected to ${key}`);
        } else {
          speak(value);
          setPrompt(value);
        }
        setResponse(true);
        setTimeout(() => setSpeaking(false), 5000);
        return;
      }
    }

    // Time & date
    if (command.includes("time")) {
      const time = new Date().toLocaleTimeString();
      speak(time);
      setPrompt(time);
      setResponse(true);
    } else if (command.includes("date")) {
      const date = new Date().toLocaleDateString();
      speak(date);
      setPrompt(date);
      setResponse(true);
    } else {
      aiResponse(command); // fallback AI
    }

    setTimeout(() => setSpeaking(false), 5000);
  };

  const value = {
    recognition,
    speaking,
    setSpeaking,
    prompt,
    setPrompt,
    response,
    setResponse,
    selectedModel,
    setSelectedModel,
    aiResponse,
  };

  return <dataContext.Provider value={value}>{children}</dataContext.Provider>;
}

export default UserContext;
