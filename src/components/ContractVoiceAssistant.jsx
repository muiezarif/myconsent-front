// src/components/ContractVoiceAssistant.jsx
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Mic, PhoneOff, Loader2, MessageCircle } from "lucide-react";
import api from "@/api/myconsent.js";

/**
 * Floating voice assistant button.
 * - Click to start/stop AI voice call.
 * - It receives:
 *    - formType
 *    - step (builder/review/export/...)
 *    - formData (latest data)
 *    - snapshotVersion (increments when user completes a step)
 *
 * The assistant ONLY sends FORM_SNAPSHOT when:
 *  - The WebRTC data channel first opens (initial snapshot)
 *  - snapshotVersion changes (step completed / stage change)
 */
export default function ContractVoiceAssistant({
  formType,
  step,
  formData,
  snapshotVersion,
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const peerConnection = useRef(null);
  const audioElement = useRef(null);
  const micStreamRef = useRef(null);
  const [dataChannel, setDataChannel] = useState(null);

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");
  const [currentMessage, setCurrentMessage] = useState("");
  const [showBubble, setShowBubble] = useState(false);

  // ------------- helpers -------------

  const cleanup = () => {
    try {
      if (dataChannel && dataChannel.readyState === "open") {
        dataChannel.close();
      }
    } catch (e) {
      console.warn("Error closing dataChannel", e);
    }
    setDataChannel(null);

    if (peerConnection.current) {
      try {
        peerConnection.current.getSenders().forEach((s) => s.track && s.track.stop());
        peerConnection.current.close();
      } catch (e) {
        console.warn("Error closing peerConnection", e);
      }
      peerConnection.current = null;
    }

    if (micStreamRef.current) {
      try {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch (e) {
        console.warn("Error stopping mic tracks", e);
      }
      micStreamRef.current = null;
    }

    setIsSessionActive(false);
  };

  const sendClientEvent = (payload) => {
    if (!dataChannel || dataChannel.readyState !== "open") return;
    dataChannel.send(JSON.stringify(payload));
  };

  const sendTextMessage = (text) => {
    if (!text) return;
    sendClientEvent({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text }],
      },
    });
    sendClientEvent({ type: "response.create" });
  };

  const sendFormSnapshot = (reason = "update") => {
    if (!dataChannel || dataChannel.readyState !== "open") return;

    const snapshot = {
      formType,
      step,
      formData,
      reason,
    };

    const text = [
      "FORM_SNAPSHOT:",
      `Reason: ${reason}`,
      `Form type: ${formType || "unknown"}`,
      `Current step: ${step}`,
      "JSON:",
      JSON.stringify(snapshot, null, 2),
    ].join("\n");

    sendTextMessage(text);
  };

  // ------------- start / stop session -------------

  const startSession = async () => {
    try {
      setIsConnecting(true);
      setError("");
      setCurrentMessage("");
      setShowBubble(false);

      // 1) get ephemeral key for legal agent
      const { data } = await api.get("/voice-agent/legal/token", {
        params: {
          lang,
        },
      });

      const EPHEMERAL_KEY = data?.client_secret?.value;
      if (!EPHEMERAL_KEY) {
        throw new Error("No client secret returned by /voice-agent/legal/token");
      }

      // 2) WebRTC setup
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerConnection.current = pc;

      // incoming assistant audio
      pc.addTransceiver("audio", { direction: "sendrecv" });

      pc.ontrack = (e) => {
        if (audioElement.current) {
          audioElement.current.srcObject = e.streams[0];
          audioElement.current.muted = false;
          audioElement.current.playsInline = true;
          audioElement.current
            .play()
            .catch((err) => console.warn("audio play error", err));
        }
      };

      // microphone stream
      const ms = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      micStreamRef.current = ms;
      ms.getTracks().forEach((track) => pc.addTrack(track, ms));

      // data channel for events
      const dc = pc.createDataChannel("oai-events");
      setDataChannel(dc);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-realtime-mini"; // same as in voice-agent.js

      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
        },
      });

      if (!sdpResponse.ok) {
        const errText = await sdpResponse.text();
        throw new Error(`SDP exchange failed: ${sdpResponse.status} - ${errText}`);
      }

      const answer = { type: "answer", sdp: await sdpResponse.text() };
      await pc.setRemoteDescription(answer);
    } catch (err) {
      console.error("[ContractVoiceAssistant] startSession error", err);
      setError(err.message || "Failed to start session");
      cleanup();
    } finally {
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    try {
      sendTextMessage(
        "The user is ending the session now. Thank you for your help."
      );
    } catch {
      // ignore
    }
    cleanup();
  };

  const toggleSession = () => {
    if (isSessionActive || isConnecting) {
      stopSession();
    } else {
      startSession();
    }
  };

  // ------------- dataChannel lifecycle -------------

  useEffect(() => {
    if (!dataChannel) return;

    const onOpen = () => {
      setIsSessionActive(true);
      setError("");
      setShowBubble(false);

      // initial snapshot when connection opens
      sendFormSnapshot("initial");

      // initial instructions based on step
      if (step === "review" || step === "export") {
        sendTextMessage(
          "You are assisting the user with reviewing a contract that is already filled in the form. " +
            "First, give a short summary (3–6 bullet points) of the contract in simple language. " +
            "After that, wait for the user's questions. Keep every response short."
        );
      } else {
        // builder
        sendTextMessage(
          "You are assisting the user while they fill a contract form. " +
            "You will receive FORM_SNAPSHOT messages after each step is completed. " +
            "Use them to understand the contract and answer questions, but do NOT run your own step-by-step interview."
        );
      }
    };

    const onMessage = (e) => {
      try {
        const event = JSON.parse(e.data);

        if (
          event.type === "conversation.item.created" &&
          event.item?.role === "assistant"
        ) {
          const text =
            event.item.content?.[0]?.text ||
            event.item.content?.[0]?.transcript ||
            "";
          if (text) {
            setCurrentMessage(text);
            setShowBubble(true);
          }
        }

        if (event.type === "response.audio_transcript.done" && event.transcript) {
          setCurrentMessage(event.transcript);
          setShowBubble(true);
        }

        if (event.type === "error") {
          setError(event.error?.message || "Realtime error");
        }
      } catch (err) {
        console.error("dataChannel message parse error", err);
      }
    };

    const onClose = () => {
      setIsSessionActive(false);
      cleanup();
    };

    const onError = (err) => {
      console.error("dataChannel error", err);
      setError(err?.message || "Communication error");
    };

    dataChannel.addEventListener("open", onOpen);
    dataChannel.addEventListener("message", onMessage);
    dataChannel.addEventListener("close", onClose);
    dataChannel.addEventListener("error", onError);

    return () => {
      dataChannel.removeEventListener("open", onOpen);
      dataChannel.removeEventListener("message", onMessage);
      dataChannel.removeEventListener("close", onClose);
      dataChannel.removeEventListener("error", onError);
    };
  }, [dataChannel, step, formType]);

  // ------------- STEP-LEVEL SNAPSHOTS (the important change) -------------

  /**
   * When snapshotVersion changes, it means:
   * - user completed a step in the form builder, or
   * - user moved past review/agreement/donation stages.
   *
   * Only then we send an updated FORM_SNAPSHOT.
   * This avoids spamming the model for every keystroke.
   */
  useEffect(() => {
    if (!isSessionActive) return;
    if (!dataChannel || dataChannel.readyState !== "open") return;
    if (!snapshotVersion) return; // 0 means nothing to send yet

    sendFormSnapshot("step-committed");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshotVersion, isSessionActive]);

  // ------------- UI -------------

  const label = isConnecting
    ? t("assistant.connecting", "Connecting…")
    : isSessionActive
    ? t("assistant.stop", "Stop AI Call")
    : t("assistant.start", "Ask AI about this contract");

  return (
    <>
      <audio ref={audioElement} className="hidden" />

      {/* Floating button bottom-right */}
      <button
        type="button"
        onClick={toggleSession}
        className={`
          fixed bottom-6 right-6 z-50
          rounded-full shadow-xl
          flex items-center justify-center
          w-14 h-14
          border
          ${
            isSessionActive
              ? "bg-red-600 hover:bg-red-700 border-red-400"
              : "bg-indigo-600 hover:bg-indigo-700 border-indigo-400"
          }
          text-white
          transition
        `}
      >
        {isConnecting ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : isSessionActive ? (
          <PhoneOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
        <span className="sr-only">{label}</span>
      </button>

      {/* Small hint label above button on desktop */}
      {!isSessionActive && !isConnecting && (
        <div className="hidden md:block fixed bottom-24 right-6 z-40 bg-black/80 text-white text-xs px-3 py-2 rounded-lg shadow-lg max-w-xs">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <span>{t("assistant.hint", "Click to talk about this contract")}</span>
          </div>
        </div>
      )}

      {/* Bubble with last AI message */}
      {showBubble && currentMessage && (
        <div
          className="fixed bottom-24 right-6 z-40 max-w-xs bg-white text-gray-900 text-xs px-3 py-2 rounded-lg shadow-lg border border-gray-200 cursor-pointer"
          onClick={() => setShowBubble(false)}
        >
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="w-3 h-3 text-indigo-600" />
            <span className="font-semibold text-[11px]">
              {t("assistant.lastMessage", "AI summary")}
            </span>
          </div>
          <p className="text-[11px] leading-snug line-clamp-4">{currentMessage}</p>
        </div>
      )}

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-24 right-6 z-40 max-w-xs bg-red-600 text-white text-xs px-3 py-2 rounded-lg shadow-lg cursor-pointer">
          <p className="font-semibold mb-1">AI error</p>
          <p>{error}</p>
        </div>
      )}
    </>
  );
}
