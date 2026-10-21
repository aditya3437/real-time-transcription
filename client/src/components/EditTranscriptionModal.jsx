import { Check, X } from 'lucide-react';

export default function EditTranscriptionModal({ item, onChange, onClose, onSubmit }) {
  if (!item) return null;

  return <div className="modal-backdrop" onMouseDown={event => {
    if (event.target === event.currentTarget) onClose();
  }}>
    <form className="edit-modal" onSubmit={onSubmit}>
      <div className="modal-heading">
        <div><span className="history-overline">EDIT TRANSCRIPT</span><h2>Make it yours</h2></div>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Close"><X size={19}/></button>
      </div>
      <label>Title
        <input autoFocus maxLength={160} value={item.title} onChange={event => onChange({ ...item, title: event.target.value })}/>
      </label>
      <label>Transcript
        <textarea rows={7} value={item.content} onChange={event => onChange({ ...item, content: event.target.value })}/>
      </label>
      <div className="modal-actions">
        <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
        <button className="start-button" type="submit"><Check size={15}/> Save changes</button>
      </div>
    </form>
  </div>;
}
