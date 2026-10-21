import { CircleHelp, Menu } from 'lucide-react';

export default function Topbar({ apiOnline, onMobileOpen }) {
  return <header className="topbar">
    <button className="icon-button mobile-menu" onClick={onMobileOpen} aria-label="Open menu"><Menu size={20}/></button>
    <div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>Transcribe</strong></div>
    <div className="topbar-right">
      <div className={`service-pill ${apiOnline ? '' : 'service-offline'}`}>
        <span className="service-dot"/>{apiOnline ? 'All systems normal' : 'API unavailable'}
      </div>
      <button className="help-button"><CircleHelp size={17}/><span>Help</span></button>
      <div className="top-avatar">A</div>
    </div>
  </header>;
}
