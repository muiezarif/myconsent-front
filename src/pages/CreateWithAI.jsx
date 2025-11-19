import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Mic,
  Bot,
  Loader2,
  ArrowLeft,
  Phone,
  PhoneOff,
  Download,
  Save,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import api from '@/api/myconsent.js';
import jsPDF from 'jspdf';

const ChatMessage = ({ message }) => {
  const { role, content } = message;
  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-4 my-4 ${isUser ? 'justify-end' : ''}`}
    >
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
          <Bot size={24} />
        </div>
      )}
      <div
        className={`max-w-xl px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-800 rounded-bl-none'
        }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
      {isUser && (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 flex-shrink-0">
          <span className="font-semibold">You</span>
        </div>
      )}
    </motion.div>
  );
};

/** ---------- Helpers to pick the best draft & title ---------- */

// Find the best assistant message to treat as the "final contract draft"
function findBestAssistantDraft(messages) {
  const assistantMessages = messages.filter((m) => m.role === 'assistant');
  if (!assistantMessages.length) return null;

  // Look for the last assistant message that clearly looks like a contract
  for (let i = assistantMessages.length - 1; i >= 0; i--) {
    const text = assistantMessages[i].content || '';
    if (
      /agreement|contract|non-disclosure|nda|consent form|release form|services agreement/i.test(
        text
      )
    ) {
      return assistantMessages[i];
    }
  }

  // Fallback: last assistant message
  return assistantMessages[assistantMessages.length - 1];
}

// Try to detect a nice document type name from the content
function detectDocType(text) {
  const l = text.toLowerCase();
  if (l.includes('non-disclosure') || l.includes('nda')) return 'Non-Disclosure Agreement';
  if (l.includes('service agreement') || l.includes('services agreement'))
    return 'Service Agreement';
  if (l.includes('consulting agreement')) return 'Consulting Agreement';
  if (l.includes('employment agreement')) return 'Employment Agreement';
  if (l.includes('lease') && l.includes('agreement')) return 'Lease Agreement';
  if (l.includes('release form') || l.includes('release and waiver')) return 'Release Form';
  if (l.includes('consent form') || l.includes('informed consent')) return 'Consent Form';
  if (l.includes('partnership agreement')) return 'Partnership Agreement';
  if (l.includes('licensing agreement')) return 'Licensing Agreement';
  return null;
}

// Derive title line from the draft text
function deriveTitleFromText(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return 'AI Legal Document';

  // Prefer a line that clearly looks like a title
  const contractLine = lines.find((l) =>
    /agreement|contract|non-disclosure|nda|consent form|release form/i.test(l)
  );
  const raw = (contractLine || lines[0]).replace(/^#+\s*/, '').trim();
  return raw || 'AI Legal Document';
}

// Slugify for filename
function slugify(str) {
  return (
    str
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 80) || 'ai-legal-document'
  );
}

function CreateWithAI() {
  const { user } = useAuth();

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        `Hello ${user?.email?.split('@')[0] || 'there'}! I can help you generate a legal document.\n\n` +
        `We'll go step by step, like a form. I'll ask one question at a time to collect the details. When you're ready, click "Generate Contract" so I produce the full agreement.`
    }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Realtime / WebRTC state
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [dataChannel, setDataChannel] = useState(null);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const peerConnection = useRef(null);
  const audioElement = useRef(null);
  const micStreamRef = useRef(null);

  // buffer for streaming assistant text
  const responseTextRef = useRef('');
  const [streamingAssistantText, setStreamingAssistantText] = useState('');
  const [isGeneratingContract, setIsGeneratingContract] = useState(false);

  // Scroll chat to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages, streamingAssistantText]);

  /** ---------- Realtime helpers ---------- */

  const sendClientEvent = (message) => {
    if (dataChannel && dataChannel.readyState === 'open') {
      message.event_id = message.event_id || crypto.randomUUID();
      console.log('[CreateWithAI -> OAI]', message);
      dataChannel.send(JSON.stringify(message));
    } else {
      console.warn('[CreateWithAI] DataChannel not ready; cannot send:', message);
      toast({
        variant: 'destructive',
        title: 'AI session not connected',
        description: 'Click "Connect AI Session" to start the assistant.'
      });
    }
  };

  const sendTextMessageToRealtime = (text) => {
    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text }]
      }
    };
    sendClientEvent(event);
    // Ask model to respond
    sendClientEvent({ type: 'response.create' });
  };

  const startSession = async () => {
    try {
      setIsConnecting(true);
      setError('');
      console.groupCollapsed('[CreateWithAI] startSession');

      console.log('Fetching legal voice-agent token...');
      const tokenResponse = await api.get('/voice-agent/legal/token');
      console.log('Token response status:', tokenResponse.status);

      if (tokenResponse.status !== 200) {
        throw new Error(
          `Token request failed: ${tokenResponse.status} - ${
            tokenResponse.statusText || 'Bad response'
          }`
        );
      }
      const data = tokenResponse.data;
      if (!data?.client_secret?.value) {
        console.error('Unexpected token payload:', data);
        throw new Error('Invalid token response structure (missing client_secret.value)');
      }
      const EPHEMERAL_KEY = data.client_secret.value;

      console.log('Creating RTCPeerConnection...');
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      peerConnection.current = pc;

      // Receive audio from assistant
      pc.addTransceiver('audio', { direction: 'sendrecv' });
      pc.ontrack = (e) => {
        console.log('[CreateWithAI] ontrack (assistant audio stream received)');
        if (audioElement.current) {
          audioElement.current.srcObject = e.streams[0];
          audioElement.current.muted = false; // unmute for Q&A
          audioElement.current.playsInline = true;
          audioElement.current
            .play()
            .catch(() => {
              /* ignore play error */
            });
        }
      };

      // Mic stream
      console.log('Requesting microphone access...');
      const ms = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      micStreamRef.current = ms;
      const micTrack = ms.getTracks()[0];
      const sender = pc.addTrack(micTrack);

      // Enable Opus DTX to save bandwidth
      try {
        const params = sender.getParameters();
        if (!params.encodings) params.encodings = [{}];
        params.encodings = params.encodings.map((enc) => ({ ...enc, dtx: true }));
        await sender.setParameters(params);
        console.log('Enabled Opus DTX on mic sender');
      } catch (e) {
        console.warn('Could not enable Opus DTX:', e);
      }

      // Data channel
      const dc = pc.createDataChannel('oai-events');
      setDataChannel(dc);
      console.log('DataChannel created');

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log('Local SDP created.');

      const baseUrl = 'https://api.openai.com/v1/realtime';
      const model = 'gpt-4o-realtime-preview-2024-12-17';

      console.log('Posting SDP to Realtime API...');
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          'Content-Type': 'application/sdp'
        }
      });

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text();
        console.error('SDP exchange failed payload:', errorText);
        throw new Error(`SDP exchange failed: ${sdpResponse.status} - ${errorText}`);
      }

      const answer = { type: 'answer', sdp: await sdpResponse.text() };
      await pc.setRemoteDescription(answer);

      console.log('Remote SDP set. WebRTC session established.');
      console.groupEnd();

      toast({
        title: '🤖 AI assistant connected',
        description:
          'We will go question by question. Answer briefly and then press "Generate Contract" when ready.'
      });
    } catch (err) {
      console.groupEnd();
      console.error('Session start error:', err);

      const status = err.response?.status;
      const data = err.response?.data;

      if (status === 402 && data?.error === 'insufficient_credits') {
        const msg =
          'You do not have enough AI credits in MyConsent to start a session. Please top up your credits.';
        setError(msg);
        toast({
          variant: 'destructive',
          title: 'Not enough AI credits',
          description: msg
        });
      } else {
        const msg = `Failed to start AI session: ${
          data?.message || err.message || 'Unknown error'
        }`;
        setError(msg);
        toast({
          variant: 'destructive',
          title: 'Connection failed',
          description: msg
        });
      }
      stopSession();
    } finally {
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    console.groupCollapsed('[CreateWithAI] stopSession');
    if (dataChannel) {
      try {
        dataChannel.close();
      } catch {
        /* ignore */
      }
    }
    if (peerConnection.current) {
      try {
        peerConnection.current.getSenders().forEach((sender) => {
          try {
            sender.track && sender.track.stop();
          } catch {
            /* ignore */
          }
        });
        peerConnection.current.close();
      } catch {
        /* ignore */
      }
      peerConnection.current = null;
    }
    if (micStreamRef.current) {
      try {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch {
        /* ignore */
      }
      micStreamRef.current = null;
    }
    setIsSessionActive(false);
    setDataChannel(null);
    responseTextRef.current = '';
    setStreamingAssistantText('');
    setIsGeneratingContract(false);
    console.groupEnd();
  };

  // When dataChannel becomes available, attach listeners
  useEffect(() => {
    if (!dataChannel) return;

    const flushStreamingBufferToMessages = () => {
      const finalText = responseTextRef.current.trim();
      if (finalText) {
        setMessages((prev) => [...prev, { role: 'assistant', content: finalText }]);
      }
      responseTextRef.current = '';
      setStreamingAssistantText('');
      setIsGeneratingContract(false);
    };

    const onMessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        console.groupCollapsed(`[OAI -> CreateWithAI] ${event.type}`);
        console.log('raw event:', event);
        console.groupEnd();

        switch (event.type) {
          /**
           * 1) Realtime "Responses" mode: response.delta
           *    Tokens are in event.delta.output_text[].content[].text
           */
          case 'response.delta': {
            const outputs = event.delta?.output_text || [];
            let textDelta = '';
            for (const o of outputs) {
              const contentArr = o?.content || [];
              for (const c of contentArr) {
                if (c?.type === 'output_text' && c.text) {
                  textDelta += c.text;
                }
              }
            }
            if (textDelta) {
              responseTextRef.current += textDelta;
              setStreamingAssistantText(responseTextRef.current);
            }
            break;
          }

          /**
           * 2) Low-level text delta: response.output_text.delta
           *    Sometimes delta is just a string, sometimes structure. Support both.
           */
          case 'response.output_text.delta': {
            const d = event.delta;
            if (typeof d === 'string') {
              responseTextRef.current += d;
            } else if (d && typeof d === 'object') {
              const outputs = d.output_text || [];
              let textDelta = '';
              for (const o of outputs) {
                const contentArr = o?.content || [];
                for (const c of contentArr) {
                  if (c?.type === 'output_text' && c.text) {
                    textDelta += c.text;
                  }
                }
              }
              responseTextRef.current += textDelta;
            }
            if (responseTextRef.current) {
              setStreamingAssistantText(responseTextRef.current);
            }
            break;
          }

          /**
           * 3) Completion events -> flush accumulated text into messages
           */
          case 'response.output_text.done':
          case 'response.completed':
          case 'response.done': {
            flushStreamingBufferToMessages();
            break;
          }

          /**
           * 4) Transcript of what the user said (voice)
           */
          case 'conversation.item.input_audio_transcription.completed': {
            const transcript = String(event.transcript || '').trim();
            if (transcript) {
              setMessages((prev) => [...prev, { role: 'user', content: transcript }]);
            }
            break;
          }

          /**
           * 5) Errors
           */
          case 'error':
          case 'response.error':
            console.error('[Realtime error]', event.error);
            setError(event.error?.message || 'Realtime error');
            toast({
              variant: 'destructive',
              title: 'AI error',
              description: event.error?.message || 'An error occurred in the AI session.'
            });
            setIsGeneratingContract(false);
            break;

          default:
            break;
        }
      } catch (err) {
        console.error('Error parsing data channel message:', err);
      }
    };

    const onOpen = () => {
      console.log('[CreateWithAI] DataChannel open');
      setIsSessionActive(true);

      // Initial instruction to behave like a form wizard
      setTimeout(() => {
        sendTextMessageToRealtime(
          'We are starting a new contract. Please act like a form wizard: ask me one short question at a time to collect all required details, and keep your replies short. Do not generate the full contract until I say or the system asks you to "generate the contract".'
        );
      }, 500);
    };

    const onClose = () => {
      console.log('[CreateWithAI] DataChannel closed');
      setIsSessionActive(false);
    };

    const onError = (err) => {
      console.error('[CreateWithAI] DataChannel error:', err);
      setError('Communication error occurred');
    };

    dataChannel.addEventListener('message', onMessage);
    dataChannel.addEventListener('open', onOpen);
    dataChannel.addEventListener('close', onClose);
    dataChannel.addEventListener('error', onError);

    return () => {
      dataChannel.removeEventListener('message', onMessage);
      dataChannel.removeEventListener('open', onOpen);
      dataChannel.removeEventListener('close', onClose);
      dataChannel.removeEventListener('error', onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataChannel]);

  useEffect(() => {
    return () => {
      stopSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** ---------- Chat handlers ---------- */

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    if (!isSessionActive || !dataChannel) {
      toast({
        variant: 'destructive',
        title: 'AI session not connected',
        description: 'Please click the phone icon to connect to the AI first.'
      });
      return;
    }

    const text = input.trim();
    setInput('');
    setIsSending(true);

    setMessages((prev) => [...prev, { role: 'user', content: text }]);

    try {
      sendTextMessageToRealtime(text);
    } catch (error) {
      console.error('Failed to send text to Realtime:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not send message to the AI.'
      });
    } finally {
      setIsSending(false);
    }
  };

  const toggleSession = () => {
    if (isSessionActive || dataChannel) {
      stopSession();
    } else {
      startSession();
    }
  };

  // This explicitly tells the AI to generate a full contract now (text-only, and we mute audio)
  const handleGenerateContract = () => {
    if (!isSessionActive || !dataChannel) {
      toast({
        variant: 'destructive',
        title: 'AI session not connected',
        description: 'Connect the AI session before generating the contract.'
      });
      return;
    }

    // 🔇 mute audio so the full contract is not spoken
    if (audioElement.current) {
      audioElement.current.muted = true;
    }

    setIsGeneratingContract(true);
    sendTextMessageToRealtime(
      'Using all the information you have collected so far, please generate the full legal contract now as a single message ONLY in text. ' +
        'Start with a clear UPPERCASE title that matches the document type (e.g., "NON-DISCLOSURE AGREEMENT"), ' +
        'then include all clauses and details we discussed, adapted to the user\'s stated jurisdiction where relevant. ' +
        'Do not include explanations, conversation summary, or chit-chat—only the contract text and at the end your standard disclaimer.'
    );
  };

  /** ---------- PDF generation + upload ---------- */

  // Generate PDF: **only the main contract text**
  const generateAiPdfBlob = (title, mainText) => {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    });

    const margin = 15;
    const pageWidth = doc.internal.pageSize.width;
    const usableWidth = pageWidth - margin * 2;
    const pageHeight = doc.internal.pageSize.height;

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, 20);

    // Main contract text only
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const mainLines = doc.splitTextToSize(mainText, usableWidth);
    let y = 30;

    mainLines.forEach((line) => {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 5;
    });

    return doc.output('blob');
  };

  const handleSaveAsPdf = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Login required',
        description: 'Please log in to save documents to your dashboard.'
      });
      return;
    }

    const draftMsg = findBestAssistantDraft(messages);

    if (!draftMsg) {
      toast({
        variant: 'destructive',
        title: 'No AI draft found',
        description:
          'Use the "Generate Contract" button first so the AI outputs the full contract in one message.'
      });
      return;
    }

    try {
      const fullText = draftMsg.content.trim();
      if (!fullText) {
        throw new Error('Empty AI draft content');
      }

      const detectedType = detectDocType(fullText);
      const derivedTitle = deriveTitleFromText(fullText);
      const title = detectedType || derivedTitle || 'AI Legal Document';

      const pdfBlob = generateAiPdfBlob(title, fullText);
      const fileName = `${slugify(title)}.pdf`;

      const payload = {
        kind: 'ai-legal',
        title,
        messages
      };

      const formData = new FormData();
      formData.append('file', pdfBlob, fileName);
      formData.append('title', title);
      formData.append('payload', JSON.stringify(payload));

      const { data } = await api.post('/contracts/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('contracts/upload response:', data);

      toast({
        title: 'Document Saved',
        description: `Your "${title}" has been saved to your dashboard.`
      });
    } catch (err) {
      console.error('Save as PDF error:', err);
      toast({
        variant: 'destructive',
        title: 'Error saving document',
        description: err.message || 'There was a problem saving your document.'
      });
    }
  };

  const handleDownloadPdfOnly = async () => {
    const draftMsg = findBestAssistantDraft(messages);

    if (!draftMsg) {
      toast({
        variant: 'destructive',
        title: 'No AI draft found',
        description:
          'Use the "Generate Contract" button first so the AI outputs the full contract in one message.'
      });
      return;
    }

    const fullText = draftMsg.content.trim();
    const detectedType = detectDocType(fullText);
    const derivedTitle = deriveTitleFromText(fullText);
    const title = detectedType || derivedTitle || 'AI Legal Document';

    const pdfBlob = generateAiPdfBlob(title, fullText);
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slugify(title)}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-[calc(100vh-150px)] bg-white rounded-2xl shadow-2xl overflow-hidden border"
    >
      <audio ref={audioElement} className="hidden" />

      <header className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center">
          <Button asChild variant="ghost" size="icon" className="mr-4">
            <Link to="/dashboard">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <Bot className="w-7 h-7 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold">Create With AI</h1>
              <p className="text-sm text-gray-500">
                Step-by-step legal contract assistant (not legal advice)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant={isSessionActive ? 'destructive' : 'outline'}
            size="sm"
            onClick={toggleSession}
            disabled={isConnecting}
            className="flex items-center gap-2"
          >
            {isSessionActive ? (
              <>
                <PhoneOff className="w-4 h-4" />
                End Session
              </>
            ) : (
              <>
                <Phone className="w-4 h-4" />
                {isConnecting ? 'Connecting…' : 'Connect AI Session'}
              </>
            )}
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
        </AnimatePresence>

        {/* live streaming bubble */}
        {streamingAssistantText && (
          <div className="flex items-start gap-4 my-4">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
              <Bot size={24} />
            </div>
            <div className="max-w-xl px-4 py-3 rounded-2xl bg-gray-100 text-gray-800 rounded-bl-none">
              <p className="whitespace-pre-wrap">{streamingAssistantText}</p>
            </div>
          </div>
        )}

        {isSending && !streamingAssistantText && (
          <div className="flex items-start gap-4 my-4">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
              <Bot size={24} />
            </div>
            <div className="max-w-xl px-4 py-3 rounded-2xl bg-gray-100 text-gray-800 rounded-bl-none flex items-center">
              <Loader2 className="animate-spin w-5 h-5 text-gray-500" />
              <span className="ml-3 italic text-gray-500">AI is thinking...</span>
            </div>
          </div>
        )}

        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        <div ref={messagesEndRef} />
      </main>

      <div className="px-4 py-2 border-t bg-gray-50 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span
            className={`w-2 h-2 rounded-full ${
              isSessionActive ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
          {isSessionActive
            ? 'AI session active — answer each question briefly, then generate the contract.'
            : 'AI session not connected'}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateContract}
            disabled={!isSessionActive || isGeneratingContract}
            className="flex items-center gap-1"
          >
            {isGeneratingContract ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            {isGeneratingContract ? 'Generating…' : 'Generate Contract'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadPdfOnly}
            className="flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleSaveAsPdf}
            className="flex items-center gap-1"
          >
            <Save className="w-4 h-4" />
            Save to Dashboard
          </Button>
        </div>
      </div>

      <footer className="p-4 border-t bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isSessionActive
                ? 'Answer the current question in one short sentence...'
                : 'Connect AI session, then answer questions here...'
            }
            className="flex-1"
            disabled={isSending}
          />
          <Button
            type="button"
            variant={isSessionActive ? 'outline' : 'secondary'}
            size="icon"
            onClick={toggleSession}
            disabled={isConnecting}
          >
            <Mic className="w-5 h-5" />
          </Button>
          <Button type="submit" size="icon" disabled={isSending || !input.trim()}>
            {isSending ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
          </Button>
        </form>
      </footer>
    </motion.div>
  );
}

export default CreateWithAI;
