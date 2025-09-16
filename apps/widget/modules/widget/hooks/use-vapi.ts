import Vapi from "@vapi-ai/web";
import { useAtomValue } from "jotai";

import { use, useEffect, useState } from "react";
import { vapiSecretAtom, widgetSettingsAtom } from "../atoms/widget-atoms";

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

  const vapiSecrets = useAtomValue(vapiSecretAtom);
  const widgetSettings = useAtomValue(widgetSettingsAtom);
  useEffect(() => {
    if (!vapiSecrets) {
      return;
    }
    // White-labeling done!!
    const vapiInstance = new Vapi(vapiSecrets.publicApiKey);
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
    if (!vapiSecrets || !widgetSettings?.vapiSettings?.assistantId) {
      return;
    }
    setIsConnecting(true);
    if (vapi) {
      vapi.start(widgetSettings.vapiSettings.assistantId);
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
