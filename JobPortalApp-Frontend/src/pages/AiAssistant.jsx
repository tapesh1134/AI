import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ArrowUp, Bot, FileUp, LoaderCircle, Plus, Download, Database, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import './AiAssistant.css';

const suggestions = {
  CANDIDATE: ['Check my application status', 'Recommend jobs based on my skills', 'Summarize my resume'],
  RECRUITER: ['Show my jobs and their IDs', 'Show my application statistics', 'Help me rank applicants for a job'],
  ADMIN: ['Give me a platform overview', 'Show the latest jobs and users', 'Generate a platform report'],
};
const errorText = (error) => typeof error.response?.data?.detail === 'string'
  ? error.response.data.detail : 'The request could not be completed. Check that the AI service is running and try again.';

function download(data, name) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function AiAssistant() {
  const { user } = useSelector((state) => state.auth);
  return <AssistantSession key={`${user?.email}:${user?.role}`} user={user} />;
}

function AssistantSession({ user }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [conversation, setConversation] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [indexOffset, setIndexOffset] = useState(0);
  const fileInput = useRef(null);
  const thread = useRef(null);
  const options = suggestions[user?.role] || [];
  const scrollDown = () => requestAnimationFrame(() => thread.current?.scrollTo({ top: thread.current.scrollHeight, behavior: 'smooth' }));

  async function send(text = draft) {
    const message = text.trim();
    if (!message || busy) return;
    setError(''); setNotice(''); setBusy(true); setDraft('');
    setMessages((old) => [...old, { role: 'user', content: message }]); scrollDown();
    try {
      const { data } = await api.post('/ai/chat', { message, conversation_id: conversation }, { timeout: 300000 });
      setConversation(data.conversation_id);
      setMessages((old) => [...old, { role: 'assistant', content: data.answer, agent: data.agent, evidence: data.evidence }]);
    } catch (e) { setError(errorText(e)); setDraft(message); }
    finally { setBusy(false); scrollDown(); }
  }

  async function newChat() {
    if (busy) return;
    setBusy(true); setError('');
    try {
      if (conversation) await api.delete(`/ai/conversations/${conversation}`);
      setConversation(null); setMessages([]); setNotice('');
    } catch (e) { setError(errorText(e)); }
    finally { setBusy(false); }
  }

  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Choose a resume smaller than 5 MB.'); return; }
    const form = new FormData(); form.append('file', file);
    setBusy(true); setError(''); setNotice('Reading your resume…');
    try {
      const { data } = await api.post('/ai/resumes', form, { timeout: 180000 });
      setNotice('Your resume is ready. You can now ask for a summary or job match.');
      setMessages((old) => [...old, { role: 'assistant', agent: 'resume', content: data.resume.summary,
        evidence: [{ tool: 'resume_extraction', data: data.resume }] }]);
    } catch (e) { setNotice(''); setError(errorText(e)); }
    finally { setBusy(false); scrollDown(); }
  }

  async function removeResume() {
    setBusy(true); setError('');
    try { await api.delete('/ai/resumes/me'); setNotice('Stored resume removed. Use New chat to remove this conversation too.'); }
    catch (e) { setError(errorText(e)); }
    finally { setBusy(false); }
  }

  async function indexJobs() {
    setBusy(true); setError(''); setNotice('Updating semantic job search…');
    try {
      const { data } = await api.post(`/ai/index/jobs?limit=10&offset=${indexOffset}`, {}, { timeout: 300000 });
      setIndexOffset(data.next_offset ?? 0);
      setNotice(`${data.scanned} jobs checked; ${data.updated} updated. ${data.next_offset === null ? 'Index update complete.' : 'Click Continue indexing for the next batch.'}`);
    } catch (e) { setError(errorText(e)); }
    finally { setBusy(false); }
  }

  return <main className="hc-ai">
    <aside className="hc-ai-sidebar">
      <Link to="/dashboard" className="hc-ai-back"><ArrowLeft size={16} /> Dashboard</Link>
      <div className="hc-ai-brand"><span><Bot size={25} /></span><div>HireConnect<small>AI ASSISTANT</small></div></div>
      <button className="hc-ai-new" onClick={newChat} disabled={busy}><Plus size={17} /> New chat</button>
      <p className="hc-ai-label">YOUR WORKSPACE</p>
      <div className="hc-ai-role"><i /> {user?.role?.toLowerCase()} workspace</div>
      <p className="hc-ai-side-note">Answers connected to your jobs, applications and profile.</p>
      <div className="hc-ai-actions">
        {user?.role === 'CANDIDATE' && <>
          <button onClick={() => fileInput.current?.click()} disabled={busy}><FileUp size={17} /> Upload resume</button>
          <small>PDF, DOCX or TXT · up to 5 MB. Text is sent to your configured AI provider; extracted facts are saved for your job matches.</small>
          <button onClick={removeResume} disabled={busy}>Remove stored resume</button>
          <input ref={fileInput} type="file" accept=".pdf,.docx,.txt" onChange={upload} hidden />
        </>}
        {user?.role === 'ADMIN' && <button onClick={indexJobs} disabled={busy}><Database size={17} /> {indexOffset ? 'Continue indexing' : 'Refresh job index'}</button>}
      </div>
      <div className="hc-ai-identity"><strong>{user?.email?.[0]?.toUpperCase()}</strong><span>{user?.email}<small>Signed in to HireConnect</small></span></div>
    </aside>
    <section className="hc-ai-main">
      <header className="hc-ai-header"><div><span className="hc-ai-label">YOUR CAREER, CONNECTED</span><h1>Let’s move things forward.</h1></div><span className="hc-ai-pill">Role-aware assistant</span></header>
      <div className="hc-ai-thread" ref={thread} aria-live="polite" aria-busy={busy}>
        {!messages.length && <div className="hc-ai-welcome"><div className="hc-ai-orb"><Bot size={34} /></div><h2>What can I help you with?</h2><p>Ask a question. Get a clear answer grounded in your portal data.</p><div className="hc-ai-suggestions">{options.map((item, i) => <button key={item} onClick={() => send(item)} disabled={busy}><span>0{i + 1}</span>{item}<ArrowUp size={17} /></button>)}</div></div>}
        {messages.map((message, index) => <article key={index} className={`hc-ai-message ${message.role}`}><div className="hc-ai-message-label">{message.role === 'user' ? 'You' : `${message.agent} agent`}</div><p>{message.content}</p>{message.evidence?.length > 0 && <details><summary>View supporting data · {message.evidence.length} sources</summary>{message.evidence.map((item, i) => <div className="hc-ai-evidence" key={i}><div><strong>{item.tool.replaceAll('_', ' ')}</strong><button onClick={() => download(item.data, `${item.tool}.json`)} aria-label={`Download ${item.tool}`}><Download size={15} /> JSON</button></div><pre>{JSON.stringify(item.data, null, 2)}</pre></div>)}</details>}</article>)}
        {busy && <div className="hc-ai-thinking"><LoaderCircle size={17} className="hc-ai-spin" /> Working on your request…</div>}
      </div>
      <div className="hc-ai-compose-wrap">
        {error && <div className="hc-ai-error" role="alert">{error}</div>}
        {notice && <div className="hc-ai-notice" role="status">{notice}</div>}
        <form onSubmit={(event) => { event.preventDefault(); send(); }} className="hc-ai-compose"><textarea aria-label="Ask the AI assistant" placeholder="Ask about your next opportunity…" value={draft} maxLength={6000} disabled={busy} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); } }} rows={2} /><button type="submit" disabled={busy || !draft.trim()} aria-label="Send message"><ArrowUp size={21} /></button></form>
        <p className="hc-ai-footnote">Review AI answers against the supporting data. Match scores support human decisions.</p>
      </div>
    </section>
  </main>;
}
