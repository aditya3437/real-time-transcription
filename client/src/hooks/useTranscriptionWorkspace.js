import { useCallback, useEffect, useRef, useState } from 'react';
import { mergeTranscript, parseTranscript } from '../utils/transcription.js';

const API = (import.meta.env.VITE_API_URL || (
  import.meta.env.DEV ? '/api' : 'https://real-time-transcription-ahgx.vercel.app/api'
)).replace(/\/$/, '');

function getLiveSocketUrl() {
  const url = new URL(`${API}/live`, window.location.origin);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
}

export function useTranscriptionWorkspace() {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [liveText, setLiveText] = useState('');
  const [status, setStatus] = useState('idle');
  const [elapsed, setElapsed] = useState(0);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [apiOnline, setApiOnline] = useState(true);
  const [copied, setCopied] = useState(false);
  const socketRef = useRef(null);
  const audioRef = useRef(null);
  const streamRef = useRef(null);
  const startedRef = useRef(0);
  const savedTextRef = useRef('');

  const loadHistory = useCallback(async () => {
    try {
      const response = await fetch(`${API}/transcriptions`);
      if (!response.ok) throw new Error('Could not load history');
      setItems(await response.json());
      setApiOnline(true);
    } catch {
      setApiOnline(false);
      setNotice('The API or MySQL database is offline. Start the backend and try again.');
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  useEffect(() => {
    if (status !== 'recording') return undefined;
    const interval = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedRef.current) / 1000));
    }, 250);
    return () => window.clearInterval(interval);
  }, [status]);

  const stopResources = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState < WebSocket.CLOSING) socketRef.current.close();
    socketRef.current = null;
    if (audioRef.current) { audioRef.current.disconnect(); audioRef.current = null; }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (window.__vocalAudioContext) {
      window.__vocalAudioContext.close().catch(() => {});
      window.__vocalAudioContext = null;
    }
  }, []);

  useEffect(() => () => stopResources(), [stopResources]);

  const startRecording = useCallback(async () => {
    setNotice(''); setLiveText(''); savedTextRef.current = ''; setElapsed(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true }
      });
      streamRef.current = stream;
      const socket = new WebSocket(getLiveSocketUrl());
      socket.binaryType = 'arraybuffer'; socketRef.current = socket;
      socket.onmessage = event => {
        try {
          const next = parseTranscript(typeof event.data === 'string' ? event.data : '');
          if (next !== null && next.trim()) {
            const merged = mergeTranscript(savedTextRef.current, next);
            savedTextRef.current = merged;
            setLiveText(merged);
          }
        } catch (error) { setNotice(error.message); }
      };
      socket.onerror = () => setNotice('Could not reach the transcription service. Check that the backend and Whisper service are running.');
      await new Promise((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error('The transcription service did not connect in time.')), 8000);
        socket.onopen = () => { window.clearTimeout(timeout); resolve(); };
        socket.onerror = () => {
          window.clearTimeout(timeout);
          reject(new Error('Could not connect to the transcription service.'));
        };
      });

      const audioContext = new AudioContext();
      window.__vocalAudioContext = audioContext;
      await audioContext.audioWorklet.addModule('/pcm-worklet.js');
      const source = audioContext.createMediaStreamSource(stream);
      const processor = new AudioWorkletNode(audioContext, 'pcm-capture');
      processor.port.onmessage = event => {
        if (socket.readyState === WebSocket.OPEN) socket.send(event.data);
      };
      source.connect(processor);
      const gain = audioContext.createGain();
      gain.gain.value = 0;
      processor.disconnect(); processor.connect(gain); gain.connect(audioContext.destination);
      audioRef.current = processor;
      startedRef.current = Date.now();
      setStatus('recording');
    } catch (error) {
      stopResources(); setStatus('idle');
      setNotice(error.name === 'NotAllowedError'
        ? 'Allow microphone access to start transcribing.'
        : error.message || 'Could not start recording.');
    }
  }, [stopResources]);

  const stopRecording = useCallback(async () => {
    const text = savedTextRef.current || liveText;
    const durationSeconds = Math.floor((Date.now() - startedRef.current) / 1000);
    stopResources(); setStatus('saving');
    if (!text.trim()) {
      setStatus('idle'); setNotice('No speech was captured. Try speaking a little longer.');
      return;
    }
    try {
      const response = await fetch(`${API}/transcriptions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: text.trim(),
          title: text.trim().split(/\s+/).slice(0, 7).join(' '),
          language: 'Auto detect',
          durationSeconds
        })
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Could not save transcription.');
      const saved = await response.json();
      setItems(previous => [saved, ...previous]);
      setSelectedId(saved.id); setLiveText(saved.content);
      setNotice('Transcription saved to your history.');
    } catch (error) {
      setNotice(`${error.message} Your transcript is still available here.`);
    }
    setStatus('idle');
  }, [liveText, stopResources]);

  const selectItem = useCallback(item => {
    setSelectedId(item.id); setLiveText(item.content); setMobileNav(false);
  }, []);

  const removeItem = useCallback(async item => {
    try {
      const response = await fetch(`${API}/transcriptions/${item.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Could not delete this transcription.');
      setItems(previous => previous.filter(entry => entry.id !== item.id));
      if (selectedId === item.id) { setSelectedId(null); setLiveText(''); }
      setNotice('Transcription deleted.');
    } catch (error) { setNotice(error.message); }
  }, [selectedId]);

  const saveEdit = useCallback(async event => {
    event.preventDefault();
    try {
      const response = await fetch(`${API}/transcriptions/${editItem.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editItem.title, content: editItem.content })
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Could not update transcription.');
      const saved = await response.json();
      setItems(previous => previous.map(item => item.id === saved.id ? saved : item));
      if (selectedId === saved.id) setLiveText(saved.content);
      setEditItem(null); setNotice('Changes saved.');
    } catch (error) { setNotice(error.message); }
  }, [editItem, selectedId]);

  const copyText = useCallback(async text => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }, []);

  const filteredItems = items.filter(item =>
    `${item.title} ${item.content}`.toLowerCase().includes(query.toLowerCase())
  );
  const active = items.find(item => item.id === selectedId);
  const shownText = status === 'recording' ? liveText : (active?.content || liveText);

  return {
    items, selectedId, liveText, status, elapsed, query, setQuery, notice, setNotice,
    editItem, setEditItem, mobileNav, setMobileNav, apiOnline, copied, filteredItems,
    shownText, loadHistory, selectItem, startRecording, stopRecording, removeItem,
    saveEdit, copyText, clearSelection: () => {
      setSelectedId(null); setLiveText(''); setElapsed(0);
    }
  };
}
