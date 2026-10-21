import { ShieldCheck } from 'lucide-react';
import EditTranscriptionModal from './components/EditTranscriptionModal.jsx';
import RecorderPanel from './components/RecorderPanel.jsx';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import TranscriptionHistory from './components/TranscriptionHistory.jsx';
import { useTranscriptionWorkspace } from './hooks/useTranscriptionWorkspace.js';

export default function App() {
  const workspace = useTranscriptionWorkspace();
  const {
    items, selectedId, liveText, status, elapsed, query, setQuery, notice, setNotice,
    editItem, setEditItem, mobileNav, setMobileNav, apiOnline, copied, filteredItems,
    shownText, loadHistory, selectItem, startRecording, stopRecording, removeItem,
    saveEdit, copyText, clearSelection
  } = workspace;

  const startNewTranscription = () => {
    clearSelection();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return <div className="app-shell">
    <Sidebar
      items={items}
      selectedId={selectedId}
      mobileNav={mobileNav}
      onMobileClose={() => setMobileNav(false)}
      onSelect={selectItem}
    />

    <main className="main-area">
      <Topbar apiOnline={apiOnline} onMobileOpen={() => setMobileNav(true)}/>
      <div className="page-content">
        <section className="intro-row">
          <div>
            <div className="eyebrow"><span className="eyebrow-line"/> YOUR THOUGHTS, IN TEXT</div>
            <h1>Say it as it comes.</h1>
            <p className="intro-subtitle">Speak freely. We'll keep up — even when your language changes mid-sentence.</p>
          </div>
          <div className="intro-trust"><ShieldCheck size={16}/><span>Private by design</span></div>
        </section>

        <RecorderPanel
          status={status}
          elapsed={elapsed}
          shownText={shownText}
          liveText={liveText}
          copied={copied}
          notice={notice}
          onCopy={copyText}
          onStart={startRecording}
          onStop={stopRecording}
          onDismissNotice={() => setNotice('')}
        />

        <TranscriptionHistory
          items={items}
          filteredItems={filteredItems}
          selectedId={selectedId}
          query={query}
          onQueryChange={setQuery}
          onSelect={item => {
            selectItem(item);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onEdit={item => setEditItem({ id: item.id, title: item.title, content: item.content })}
          onDelete={removeItem}
          onRefresh={loadHistory}
          onNew={startNewTranscription}
        />

        <footer className="page-footer">
          <span>Made for the way you speak.</span>
          <span>Vocal <span className="footer-dot">·</span> Speech, understood.</span>
        </footer>
      </div>
    </main>

    <EditTranscriptionModal
      item={editItem}
      onChange={setEditItem}
      onClose={() => setEditItem(null)}
      onSubmit={saveEdit}
    />
  </div>;
}
