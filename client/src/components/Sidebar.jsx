import {
  AudioLines, AudioWaveform, ChevronDown, Clock3, FileText, Menu,
  MoreHorizontal, Settings2, Sparkles, X
} from 'lucide-react';

export default function Sidebar({ items, selectedId, mobileNav, onMobileClose, onSelect }) {
  const scrollToHistory = () => document.getElementById('history')?.scrollIntoView({ behavior: 'smooth' });

  return <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
    <div className="brand">
      <div className="brand-mark"><AudioLines size={20}/></div>
      <span>vocal<span className="brand-dot">.</span></span>
      <button className="icon-button close-nav" onClick={onMobileClose} aria-label="Close menu"><X size={18}/></button>
    </div>
    <div className="workspace">
      <div className="workspace-avatar">S</div>
      <div className="workspace-name"><strong>Studio workspace</strong><span>Personal</span></div>
      <ChevronDown size={15} className="muted"/>
    </div>
    <div className="side-label">WORKSPACE</div>
    <nav className="side-nav">
      <button className="nav-item nav-selected"><AudioWaveform size={17}/><span>Transcribe</span><span className="nav-key">⌘ 1</span></button>
      <button className="nav-item" onClick={scrollToHistory}><Clock3 size={17}/><span>History</span><span className="nav-count">{items.length}</span></button>
    </nav>
    <div className="side-label history-label">RECENT TRANSCRIPTS <span>{items.length}</span></div>
    <div className="recent-list">
      {items.slice(0, 5).map(item => <button
        key={item.id}
        onClick={() => onSelect(item)}
        className={`recent-item ${selectedId === item.id ? 'recent-active' : ''}`}
      ><FileText size={15}/><span>{item.title}</span></button>)}
      {items.length === 0 && <div className="recent-empty">Your recent work appears here.</div>}
    </div>
    <div className="sidebar-bottom">
      <div className="upgrade-card">
        <div className="upgrade-icon"><Sparkles size={16}/></div>
        <strong>Words worth keeping</strong>
        <p>Every idea, captured and ready when you need it.</p>
        <button onClick={scrollToHistory}>Explore your history <span>↗</span></button>
      </div>
      <button className="nav-item settings-item"><Settings2 size={17}/><span>Settings</span></button>
      <div className="profile-row">
        <div className="profile-avatar">A</div>
        <div className="profile-copy"><strong>Aditya</strong><span>Personal plan</span></div>
        <MoreHorizontal size={18} className="muted"/>
      </div>
    </div>
  </aside>;
}
