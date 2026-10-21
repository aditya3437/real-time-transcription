import { FileAudio2, FileText, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { formatDate, formatDuration } from '../utils/transcription.js';

export default function TranscriptionHistory({
  items, filteredItems, selectedId, query, onQueryChange, onSelect, onEdit, onDelete, onRefresh, onNew
}) {
  return <section className="history-section" id="history">
    <div className="history-title-row">
      <div>
        <div className="history-overline">YOUR LIBRARY</div>
        <h2>Transcription history <span>{items.length}</span></h2>
        <p>Past conversations, kept in one place.</p>
      </div>
      <button className="new-transcript" onClick={onNew}><Plus size={16}/> New transcription</button>
    </div>

    <div className="history-tools">
      <div className="history-tabs">
        <button className="tab-active">All transcripts <span>{items.length}</span></button>
        <button className="tab-muted">Recently edited</button>
      </div>
      <label className="search-box">
        <Search size={16}/>
        <input value={query} onChange={event => onQueryChange(event.target.value)} placeholder="Search transcripts"/>
        <kbd>⌘ K</kbd>
      </label>
    </div>

    <div className="history-table">
      <div className="table-head"><span>TRANSCRIPT</span><span>LANGUAGE</span><span>DURATION</span><span>DATE CREATED</span><span/></div>
      {filteredItems.length ? filteredItems.map(item => <div
        className={`table-row ${selectedId === item.id ? 'row-selected' : ''}`}
        key={item.id}
      >
        <button className="transcript-cell" onClick={() => onSelect(item)}>
          <span className="file-icon"><FileAudio2 size={16}/></span>
          <span className="row-title-wrap">
            <strong>{item.title}</strong>
            <small>{item.content.slice(0, 92)}{item.content.length > 92 ? '…' : ''}</small>
          </span>
        </button>
        <span className="language-cell"><span className="language-dot"/>{item.language || 'Auto detect'}</span>
        <span className="duration-cell">{formatDuration(item.durationSeconds)}</span>
        <span className="date-cell">{formatDate(item.createdAt)}</span>
        <div className="row-actions">
          <button title="Edit transcription" onClick={() => onEdit(item)}><Pencil size={15}/></button>
          <button title="Delete transcription" onClick={() => onDelete(item)}><Trash2 size={15}/></button>
        </div>
      </div>) : <div className="history-empty">
        <div className="history-empty-icon"><FileText size={21}/></div>
        <strong>{query ? 'No matching transcripts' : 'A fresh page'}</strong>
        <span>{query ? 'Try a different search term.' : 'Your saved transcriptions will find a home here.'}</span>
      </div>}
    </div>
    {items.length > 0 && <div className="table-bottom">
      <span>Showing {filteredItems.length} of {items.length} transcription{items.length === 1 ? '' : 's'}</span>
      <button onClick={onRefresh}>Refresh history <span>↻</span></button>
    </div>}
  </section>;
}
