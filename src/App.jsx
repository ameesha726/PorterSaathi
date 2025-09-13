import React, { useContext } from 'react'
import "./App.css"
import va from './assets/ai.png'
import { CiMicrophoneOn } from "react-icons/ci";
import { dataContext } from './Context/UserContext';
import speakImg from "./assets/speak.gif"
import aigif from "./assets/aiVoice.gif"

function App() {
  let {recognition,speaking,setSpeaking,prompt,response,setPrompt, setResponse} = useContext(dataContext)
 
  
  return (
    <div className="main">
      <img src={va} alt="" id="shifra" />
      <span>I'm Porter Sathi, Your Advanced Virtual Assistant</span>
      {!speaking ? 
        <button
          onClick={() => {
            setPrompt("listening...")
            setSpeaking(true);
            setResponse(false)
            recognition.start();
          }}
        >
          Click Here <CiMicrophoneOn />
        </button>
       : (
        <div className="response">
          {!response ? 
            <img src={speakImg} alt="" id="speak" />
           : 
            <img src={aigif} alt="" id="aigif" />
          }

          <p>{prompt}</p>
        </div>
      )}
    </div>
  );
}

export default App