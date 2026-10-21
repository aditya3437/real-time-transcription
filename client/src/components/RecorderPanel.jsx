import {
  AudioWaveform, Check, ChevronDown, CircleHelp, Copy, Languages,
  Mic, ShieldCheck, Square
} from 'lucide-react';
import { formatDuration } from '../utils/transcription.js';

export default function RecorderPanel({
  status, elapsed, shownText, liveText, copied, notice, onCopy, onStart, onStop, onDismissNotice
}) {
  const isRecording = status === 'recording';
  const hasError = notice.includes('offline') || notice.includes('Could not') || notice.includes('Allow');

  return <>
    <section className={`recorder-card ${isRecording ? 'is-recording' : ''}`}>
      <div className="recorder-head">
        <div className="recorder-heading">
          <span className="recorder-icon"><Mic size={17}/></span>
          <div><h2>Live transcription</h2><p>Real-time speech recognition</p></div>
        </div>
        <div className="language-select"><Languages size={16}/><span>Auto detect</span><ChevronDown size={14}/></div>
      </div>
      <div className="recorder-divider"/>
      <div className={`transcript-stage ${shownText ? 'has-text' : ''}`}>
        {isRecording && <div className="live-label"><span className="live-dot"/> LIVE TRANSCRIPTION</div>}
        {shownText
          ? <p className="transcript-text">{shownText}{isRecording && <span className="caret"/>}</p>
          : <div className="empty-prompt">
            <div className="sound-orb"><AudioWaveform size={25}/></div>
            <strong>Your words will appear here</strong>
            <span>Start speaking to see your transcript in real time</span>
          </div>}
        {isRecording && !liveText && <div className="listening-hint"><span/><span/><span/><span/><span/>Listening for speech</div>}
      </div>
      <div className="recorder-footer">
        <div className="recording-meta">
          <div className="timer"><span className={isRecording ? 'timer-dot' : ''}/>{formatDuration(elapsed)}</div>
          <span className="meta-divider"/>
          <span className="meta-language"><Languages size={14}/> Multilingual</span>
        </div>
        <div className="record-controls">
          {shownText && !isRecording && <button className="subtle-button" onClick={() => onCopy(shownText)}><Copy size={15}/>{copied ? 'Copied' : 'Copy'}</button>}
          {isRecording
            ? <button className="stop-button" onClick={onStop}><Square size={14} fill="currentColor"/> Finish &amp; save</button>
            : <button className="start-button" disabled={status === 'saving'} onClick={onStart}>
              {status === 'saving' ? <><span className="button-spinner"/> Saving...</> : <><span className="start-mic"><Mic size={16}/></span> Start speaking</>}
            </button>}
        </div>
      </div>
    </section>

    <div className="privacy-note">
      <ShieldCheck size={15}/>
      <span>Your browser streams audio to your self-hosted Whisper service. This app stores only the transcript in MySQL.</span>
      <button aria-label="Privacy information"><CircleHelp size={14}/></button>
    </div>
    {notice && <div className={`notice ${hasError ? 'notice-error' : ''}`}>
      <span>{notice}</span><button onClick={onDismissNotice} aria-label="Dismiss"><span aria-hidden="true">×</span></button>
    </div>}
  </>;
}
