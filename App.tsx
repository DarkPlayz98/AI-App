import React, { FormEvent, useEffect, useRef, useState } from 'react';

type Message = { id: string; sender: 'me' | 'other'; text: string; time: string };
type Room = { id: string; name: string; accent: string; members: string[]; status: string; unread: number; messages: Message[] };

const initialRooms: Room[] = [
  { id: 'lounge', name: 'Design Lounge', accent: 'DL', members: ['Maya Chen', 'Jordan Lee', 'You'], status: '8 members online', unread: 0, messages: [
    { id: '1', sender: 'other', text: 'Good morning, team! I dropped the updated moodboard in the shared folder.', time: '9:41 AM' },
    { id: '2', sender: 'me', text: 'It looks fantastic — the warm palette is exactly where I was hoping we’d land.', time: '9:43 AM' },
    { id: '3', sender: 'other', text: 'Amazing. I’ll refine the type pairings and share a first pass before lunch.', time: '9:45 AM' },
  ] },
  { id: 'product', name: 'Product Sprint', accent: 'PS', members: ['Alex Morgan', 'Sam Rivera', 'You'], status: '5 members online', unread: 2, messages: [
    { id: '4', sender: 'other', text: 'The onboarding flow is ready for a quick review when you have a moment.', time: '10:12 AM' },
    { id: '5', sender: 'other', text: 'I also added the edge cases from yesterday’s notes.', time: '10:14 AM' },
  ] },
  { id: 'weekend', name: 'Weekend Plans', accent: 'WP', members: ['Nina Patel', 'Leo Ross', 'You'], status: '12 members online', unread: 0, messages: [
    { id: '6', sender: 'other', text: 'I found a sunny spot for Saturday’s picnic ☀️', time: 'Yesterday' },
    { id: '7', sender: 'me', text: 'Perfect. I’ll bring snacks!', time: 'Yesterday' },
  ] },
  { id: 'bookclub', name: 'Book Club', accent: 'BC', members: ['Amelia Wright', 'You'], status: '3 members online', unread: 0, messages: [
    { id: '8', sender: 'other', text: 'Chapter six had such a great ending. Can’t wait to discuss it.', time: 'Mon' },
  ] },
];

const replyOptions = [
  'That sounds great — I’m on board!',
  'Love that idea. I’ll take a look and circle back shortly.',
  'Perfect, thanks for the update.',
  'Absolutely. Adding it to my list now.',
  'Nice! That should work really well.',
];
const now = () => new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date());

const App: React.FC = () => {
  const [rooms, setRooms] = useState(initialRooms);
  const [activeRoom, setActiveRoom] = useState('lounge');
  const [draft, setDraft] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const room = rooms.find(item => item.id === activeRoom)!;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [room.messages.length, activeRoom, isTyping]);

  const selectRoom = (id: string) => {
    setActiveRoom(id); setSidebarOpen(false);
    setRooms(current => current.map(item => item.id === id ? { ...item, unread: 0 } : item));
  };

  const sendMessage = (event?: FormEvent) => {
    event?.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const id = crypto.randomUUID();
    setRooms(current => current.map(item => item.id === activeRoom ? { ...item, messages: [...item.messages, { id, sender: 'me', text, time: now() }] } : item));
    setDraft(''); setIsTyping(true);
    const targetRoom = activeRoom;
    window.setTimeout(() => {
      const reply = replyOptions[Math.floor(Math.random() * replyOptions.length)];
      setRooms(current => current.map(item => item.id === targetRoom ? { ...item, messages: [...item.messages, { id: crypto.randomUUID(), sender: 'other', text: reply, time: now() }], unread: item.id === activeRoom ? 0 : item.unread + 1 } : item));
      if (targetRoom === activeRoom) setIsTyping(false);
    }, 950 + Math.random() * 900);
  };

  return <main className="chat-app">
    <style>{`
      *{box-sizing:border-box} body{margin:0;background:#f3f5fb;color:#15213a;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif} button,textarea{font:inherit} button{cursor:pointer}
      .chat-app{min-height:100vh;background:radial-gradient(circle at top right,#e8ebff 0,transparent 33%),#f6f7fb;padding:clamp(12px,3vw,36px);display:grid;place-items:center}.chat-frame{width:min(1180px,100%);height:min(790px,calc(100vh - 24px));min-height:580px;display:grid;grid-template-columns:296px 1fr;background:#fff;border:1px solid #e6e9f2;border-radius:26px;overflow:hidden;box-shadow:0 28px 75px #27376b1c}
      .sidebar{background:#fbfcff;border-right:1px solid #e9ecf4;padding:24px 16px;display:flex;flex-direction:column;gap:22px}.brand{display:flex;align-items:center;gap:10px;padding:0 9px;font-weight:800;font-size:20px;letter-spacing:-.05em}.brand-mark{width:31px;height:31px;border-radius:10px;background:#5b63eb;color:white;display:grid;place-items:center;font-size:18px;box-shadow:0 7px 16px #5b63eb42}.side-label{padding:0 9px;color:#9aa4b8;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.rooms{display:grid;gap:5px}.room{width:100%;border:0;background:transparent;text-align:left;padding:11px 9px;border-radius:13px;display:flex;align-items:center;gap:10px;color:#526078}.room:hover{background:#f1f3fa}.room.active{background:#eaebff;color:#313aa5}.avatar{width:37px;height:37px;border-radius:12px;color:white;display:grid;place-items:center;font-size:11px;font-weight:800;flex:none;background:linear-gradient(135deg,#7f87ef,#464dce)}.room:nth-child(2) .avatar{background:linear-gradient(135deg,#eea878,#d65d70)}.room:nth-child(3) .avatar{background:linear-gradient(135deg,#54b8ad,#2e837c)}.room:nth-child(4) .avatar{background:linear-gradient(135deg,#c28be5,#7552bd)}.room-copy{min-width:0;flex:1;display:block}.room-name{display:block;font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.room-preview{display:block;margin-top:3px;font-size:11px;color:#99a3b6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.badge{background:#5b63eb;color:white;border-radius:50px;min-width:18px;height:18px;padding:0 5px;display:grid;place-items:center;font-size:10px;font-weight:800}.profile{margin-top:auto;padding:13px 10px;border-top:1px solid #e9ecf4;display:flex;align-items:center;gap:10px}.me-avatar{width:34px;height:34px;border-radius:50%;background:#1b2948;color:white;display:grid;place-items:center;font-weight:800;font-size:12px}.profile strong{font-size:13px;display:block}.profile span{font-size:11px;color:#7f8aa0}.online{margin-left:auto;width:8px;height:8px;border-radius:50%;background:#37bf86;box-shadow:0 0 0 3px #e5f8ef}
      .conversation{min-width:0;display:flex;flex-direction:column;background:#fff}.chat-header{min-height:88px;padding:18px 30px;border-bottom:1px solid #edf0f6;display:flex;align-items:center;gap:13px}.header-avatar{width:43px;height:43px;border-radius:14px;background:linear-gradient(135deg,#7f87ef,#464dce);color:#fff;display:grid;place-items:center;font-size:12px;font-weight:800}.header-title{font-size:17px;font-weight:800;letter-spacing:-.03em}.header-status{font-size:12px;color:#7d889c;margin-top:3px}.header-status i{display:inline-block;width:7px;height:7px;border-radius:50%;background:#38c18a;margin-right:5px}.header-actions{margin-left:auto;display:flex;gap:7px}.circle-btn,.mobile-menu{width:38px;height:38px;border:1px solid #e7eaf2;background:#fff;border-radius:11px;color:#758199;display:grid;place-items:center;font-size:17px}.mobile-menu{display:none}
      .feed{flex:1;overflow:auto;padding:29px clamp(18px,5vw,62px);display:flex;flex-direction:column;gap:18px}.date{text-align:center;font-size:11px;font-weight:700;color:#9ca6b7;margin:1px 0 8px}.message{display:flex;gap:10px;max-width:78%;align-items:flex-end}.message.mine{align-self:flex-end;flex-direction:row-reverse}.message .avatar{width:31px;height:31px;border-radius:10px;font-size:9px}.bubble-wrap{display:grid;gap:5px}.bubble{padding:11px 14px;border-radius:16px 16px 16px 4px;background:#f2f4f8;color:#334058;font-size:14px;line-height:1.45;box-shadow:0 1px 1px #27376b08}.mine .bubble{background:#5b63eb;color:#fff;border-radius:16px 16px 4px 16px;box-shadow:0 6px 15px #5b63eb33}.time{font-size:10px;color:#a4adbd}.mine .time{text-align:right}.typing{display:flex;gap:10px;align-items:end}.typing .bubble{padding:13px 16px;display:flex;gap:4px}.dot{width:5px;height:5px;border-radius:50%;background:#9ba5b5;animation:pulse 1s infinite}.dot:nth-child(2){animation-delay:.15s}.dot:nth-child(3){animation-delay:.3s}@keyframes pulse{50%{transform:translateY(-3px);opacity:.45}}
      .composer{padding:18px clamp(18px,4vw,30px) 25px;border-top:1px solid #edf0f6}.composer form{display:flex;align-items:flex-end;gap:10px;padding:7px 8px 7px 15px;border:1px solid #dfe4ef;border-radius:16px;background:#fff;box-shadow:0 7px 20px #31437408}.composer textarea{flex:1;resize:none;border:0;outline:0;color:#26344d;min-height:28px;max-height:100px;padding:5px 0;line-height:1.4;background:transparent}.composer textarea::placeholder{color:#abb3c2}.send{border:0;width:36px;height:36px;border-radius:11px;background:#5b63eb;color:#fff;font-size:17px;transition:.18s}.send:hover{background:#474fda;transform:translateY(-1px)}.hint{font-size:10px;color:#a8b0bf;margin:8px 5px 0}
      @media(max-width:700px){.chat-app{padding:0;display:block}.chat-frame{height:100vh;min-height:0;border:0;border-radius:0;display:block}.sidebar{position:fixed;z-index:10;inset:0 auto 0 0;width:min(296px,85vw);transform:translateX(-105%);transition:.25s;box-shadow:15px 0 40px #18234525}.sidebar.open{transform:translateX(0)}.mobile-menu{display:grid}.chat-header{padding:15px 17px;min-height:75px}.header-actions{display:none}.feed{padding:24px 17px}.message{max-width:88%}.composer{padding:13px 15px 18px}.hint{display:none}}
    `}</style>
    <section className="chat-frame">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}><div className="brand"><span className="brand-mark">✦</span>talkspace</div><div><p className="side-label">Your rooms</p><nav className="rooms">{rooms.map(item => <button key={item.id} className={`room ${item.id === activeRoom ? 'active' : ''}`} onClick={() => selectRoom(item.id)}><span className="avatar">{item.accent}</span><span className="room-copy"><span className="room-name">{item.name}</span><span className="room-preview">{item.messages.at(-1)?.text}</span></span>{item.unread > 0 && <span className="badge">{item.unread}</span>}</button>)}</nav></div><div className="profile"><span className="me-avatar">YO</span><span><strong>You</strong><span>Available</span></span><i className="online"/></div></aside>
      <section className="conversation"><header className="chat-header"><button className="mobile-menu" aria-label="Open rooms" onClick={() => setSidebarOpen(true)}>☰</button><span className="header-avatar">{room.accent}</span><div><div className="header-title">{room.name}</div><div className="header-status"><i/>{room.status}</div></div><div className="header-actions"><button className="circle-btn" aria-label="Search">⌕</button><button className="circle-btn" aria-label="More options">•••</button></div></header><div className="feed"><div className="date">TODAY</div>{room.messages.map((message, index) => <article key={message.id} className={`message ${message.sender === 'me' ? 'mine' : ''}`}><span className="avatar">{message.sender === 'me' ? 'YO' : room.members[index % Math.max(1, room.members.length - 1)].split(' ').map(x => x[0]).join('')}</span><div className="bubble-wrap"><div className="bubble">{message.text}</div><span className="time">{message.time}</span></div></article>)}{isTyping && <div className="typing"><span className="avatar">MC</span><div className="bubble"><i className="dot"/><i className="dot"/><i className="dot"/></div></div>}<div ref={endRef}/></div><div className="composer"><form onSubmit={sendMessage}><textarea value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} placeholder={`Message #${room.name.toLowerCase().replaceAll(' ', '-')}`} aria-label="Message"/><button className="send" type="submit" aria-label="Send message">↑</button></form><div className="hint">Press Enter to send · Shift + Enter for a new line</div></div></section>
    </section>
  </main>;
};
export default App;
