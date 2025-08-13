import Vapi from "@vapi-ai/web";

import { useEffect, useState } from "react";

interface TranscriptMessage {
  // role can be the user or assistant with the text data
  role: "user" | "assistant";
  text: string;
}

export const useVapi = () => {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  //Jhala(connect)...
  const [isConnected, setIsConnected] = useState(false);
  //Hotai(connect)...
  const [isConnecting, setIsConnecting] = useState(false);
  //Boltoi(assistant sobat)...
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  useEffect(() => {
    // Only for testing the Vapi API, otherwise customers will provide their own API keys
    // I.e. we will be white-labeling the vapi key 💀
    const vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_KEY || "");
    setVapi(vapiInstance);
    vapiInstance.on("call-start", () => {
      setIsConnected(true);
      setIsConnecting(false);
      setTranscript([]);
    });
    vapiInstance.on("call-end", () => {
      setIsConnected(false);
      setIsConnecting(false);
      setIsSpeaking(false);
    });
    vapiInstance.on("speech-start", () => {
      setIsSpeaking(true);
    });
    vapiInstance.on("speech-end", () => {
      setIsSpeaking(false);
    });
    vapiInstance.on("error", (error) => {
      console.error(error, "VAPI_ERROR");
      setIsConnecting(false);
    });

    vapiInstance.on("message", (message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        setTranscript((prev) => [
          ...prev,
          {
            role: message.role === "user" ? "user" : "assistant",
            text: message.transcript,
          },
        ]);
      }
    });
    return () => {
      vapiInstance?.stop();
    };
  }, []);

  const startCall = () => {
    setIsConnecting(true);
    if (vapi) {
      // Only for testing the Vapi API, otherwise customers will provide their own API keys
      // I.e. we will be white-labeling the vapi key 💀
      vapi.start("9b4d7728-10de-445b-aaeb-084ac586bbfc");
    }
  };
  const endCall = () => {
    if (vapi) {
      vapi.stop();
    }
  };
  return {
    isSpeaking,
    isConnected,
    isConnecting,
    transcript,
    startCall,
    endCall,
  };
};
