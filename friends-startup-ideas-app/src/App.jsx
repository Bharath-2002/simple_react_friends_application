import React, { useEffect, useState } from 'react'
import { FaMoon, FaSun } from 'react-icons/fa'

// --- Seed data ---
const SEED_DATA = {
  users: [
    {
      id: 'u1',
      username: 'bharath',
      password: '1234',
      profile: {
        name: 'Bharath',
        bio: 'Coder, software developer providing B2B ideas',
        funnyTitle: 'Idea Machine',
        superPower: 'Can create a startup pitch in under 5 minutes'
      },
       ideas: [
        {
          id: 'i1',
          title: 'AR based object visualization',
          description: 'AR object visualization for e-commerce to help customers see products in their environment before buying.image to 3d model conversion is required. ',
          ratings: { u1: 5, u2: 4 }
        }
      ]
    },
    {
      id: 'u2',
      username: 'enish',
      password: 'abcd',
      profile: {
        name: 'Enish',
        bio: 'Civil engineer',
        funnyTitle: 'Structure Sensei',
        superPower: 'Can measure distances just by looking'
      },
      ideas: []
    },
    {
      id: 'u3',
      username: 'kavimani',
      password: 'abcd',
      profile: {
        name: 'Kavimani',
        bio: 'Developer, provides software ideas',
        funnyTitle: 'Logic Architect',
        superPower: 'Turns coffee into code instantly'
      },
      ideas: []
    },
    {
      id: 'u4',
      username: 'magesh',
      password: 'abcd',
      profile: {
        name: 'Magesh',
        bio: 'UI/UX developer',
        funnyTitle: 'Pixel Perfectionist',
        superPower: 'Can spot a 1px misalignment from across the room'
      },
      ideas: []
    },
    {
      id: 'u5',
      username: 'dhyanesh',
      password: 'abcd',
      profile: {
        name: 'Dhyanesh',
        bio: 'Software developer',
        funnyTitle: 'Bug Whisperer',
        superPower: 'Fixes bugs before they appear'
      },
      ideas: []
    },
    {
      id: 'u6',
      username: 'badhri',
      password: 'abcd',
      profile: {
        name: 'Badhri',
        bio: 'Gemology expert with gemstone knowledge',
        funnyTitle: 'Stone Sage',
        superPower: 'Identifies gems faster than Google Lens'
      },
      ideas: []
    }
  ]
}


const STORAGE_KEY = 'friends_startup_data_v1'
const THEME_KEY = 'friends_theme'
const PRESENTER_KEY = 'next_week_presenter'

function makeId(prefix = 'id') {
  return prefix + '_' + Math.random().toString(36).slice(2, 9)
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  return JSON.parse(JSON.stringify(SEED_DATA))
}

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch (e) {}
}

function loadPresenter() {
  try {
    const raw = localStorage.getItem(PRESENTER_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  return { presenter: '', date: '' }
}

function savePresenter(data) {
  try { localStorage.setItem(PRESENTER_KEY, JSON.stringify(data)) } catch (e) {}
}

// --- Styles ---
const styles = `
  :root {
    --accent:#ff6b6b;
    --muted:#666;
    --card:#fff;
    --bg:#fff7f2;
    --text:#222;
  }
  body.dark {
    --card:#1e1e1e;
    --bg:#121212;
    --text:#eee;
    --muted:#aaa;
  }
  *{ box-sizing:border-box; }
  html, body, #root {
    height: 100%;
  }
  body {
    margin:0;
    font-family:Inter, system-ui, sans-serif;
    color:var(--text);
    background:var(--bg);
    transition:background 0.3s, color 0.3s;
  }
  .app { padding:18px; min-height:100%; display:flex; flex-direction:column; }
  .header {
    display:flex; justify-content:space-between; align-items:center;
    gap:12px; flex-wrap:wrap;
  }
  .card {
    background:var(--card);
    padding:16px;
    border-radius:14px;
    box-shadow:0 6px 20px rgba(0,0,0,0.06);
    transition:background 0.3s;
  }
  .btn {
    background:var(--accent);
    color:#fff;
    padding:8px 12px;
    border-radius:10px;
    border:none;
    cursor:pointer;
    font-size:14px;
  }
  .muted{ color:var(--muted); font-size:13px; }
  .grid { display:grid; gap:16px; grid-template-columns:1fr; }
  @media(min-width:900px){ .grid{ grid-template-columns:320px 1fr; } }
  .idea {
    padding:12px;
    border-radius:12px;
    background:var(--card);
    box-shadow:0 4px 12px rgba(0,0,0,0.04);
    transition:background 0.3s;
  }
  .star { font-size:20px; margin-right:6px; cursor:pointer; }
  .star.filled{ color:#f6c84c; }
  .small{ font-size:13px; }
  input, textarea{
    width:100%; padding:8px; border-radius:8px; border:1px solid #ccc;
    background:var(--card); color:var(--text); transition:background 0.3s, color 0.3s;
  }
  .modal-overlay {
    position:fixed; inset:0; display:flex; align-items:center; justify-content:center;
    background:rgba(0,0,0,0.45); z-index:50;
  }
  .modal {
    background:var(--card); padding:18px; border-radius:12px; width:90%; max-width:520px;
    box-shadow:0 12px 40px rgba(0,0,0,0.3);
  }
  .rating-row {
    display:flex; justify-content:space-between; padding:10px 0;
    border-bottom:1px solid rgba(0,0,0,0.05);
  }
`

function ThemeToggle({ theme, toggle }) {
  return (
    <button
      onClick={toggle}
      style={{
        background:'transparent', border:'none',
        cursor:'pointer', fontSize:'20px', color:'var(--text)'
      }}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <FaMoon /> : <FaSun />}
    </button>
  )
}

function StarRating({ value=0, onRate, readOnly=false }) {
  const stars = [1,2,3,4,5]
  return (
    <div style={{display:'flex', alignItems:'center'}}>
      {stars.map(s => (
        <span
          key={s}
          onClick={() => { if (!readOnly) onRate(s) }}
          className={`star ${s <= value ? 'filled' : ''}`}
        >
          ★
        </span>
      ))}
    </div>
  )
}

function IdeaCard({ idea, currentUserId, onRate, onViewRatings }) {
  const ratings = idea.ratings || {}
  const values = Object.values(ratings)
  const avg = values.length ? (values.reduce((a,b)=>a+b,0)/values.length).toFixed(1) : '—'
  return (
    <div className="idea">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
        <strong>{idea.title}</strong>
        <div className="small muted">Avg: {avg}</div>
      </div>
      <div style={{marginTop:8}}>{idea.description}</div>
      <div style={{marginTop:10, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8}}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <StarRating value={ratings[currentUserId] || 0} onRate={s=>onRate(idea.id,s)} />
          <div className="small muted">({values.length} votes)</div>
        </div>
        <button className="btn" onClick={()=>onViewRatings(idea)}>View Ratings</button>
      </div>
    </div>
  )
}

export default function App(){
  const [data, setDataState] = useState(null)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [page, setPage] = useState('signin')
  const [ratingsModalIdea, setRatingsModalIdea] = useState(null)
  const [theme, setTheme] = useState('light')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [ideaTitle, setIdeaTitle] = useState('')
  const [ideaDesc, setIdeaDesc] = useState('')
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: '', bio: '', funnyTitle: '', superPower: ''
  })

  // New: Presenter modal state
  const [presenterModalOpen, setPresenterModalOpen] = useState(false)
  const [presenterData, setPresenterData] = useState({ presenter: '', date: '' })

  useEffect(()=>{
    setDataState(loadData())
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light'
    setTheme(savedTheme)
    document.body.classList.toggle('dark', savedTheme === 'dark')
    setPresenterData(loadPresenter())
  },[])

  useEffect(()=>{ if(data) saveData(data) },[data])
  useEffect(()=>{ savePresenter(presenterData) },[presenterData])
  useEffect(()=>{
    localStorage.setItem(THEME_KEY, theme)
    document.body.classList.toggle('dark', theme === 'dark')
  },[theme])

  const currentUser = data?.users.find(u=>u.id===currentUserId) || null
  const setData = (next)=>setDataState(next)

  function signin(){
    const user = data.users.find(u=>u.username===username && u.password===password)
    if(!user) return alert('Invalid credentials')
    setCurrentUserId(user.id)
    setPage('profile')
  }
  function signout(){ setCurrentUserId(null); setPage('signin') }

  function addIdea(){
    if(!ideaTitle.trim()) return alert('Enter a title')
    const newIdea = { id:makeId('i'), title:ideaTitle, description:ideaDesc, ratings:{} }
    setData({...data, users:data.users.map(u=>u.id===currentUserId ? {...u, ideas:[newIdea,...u.ideas]} : u)})
    setIdeaTitle('')
    setIdeaDesc('')
  }

  function rateIdea(id, rating){
    setData({...data, users:data.users.map(u=>({...u, ideas:u.ideas.map(idea=>idea.id===id ? {...idea, ratings:{...idea.ratings, [currentUserId]:rating}} : idea)}))})
  }

  function openEditProfile(){
    setProfileForm({...currentUser.profile})
    setEditProfileOpen(true)
  }

  function saveProfile(){
    setData({
      ...data,
      users: data.users.map(u =>
        u.id === currentUserId ? { ...u, profile: { ...profileForm } } : u
      )
    })
    setEditProfileOpen(false)
  }

  return (
    <div className="app">
      <style>{styles}</style>

      {page==='signin' && (
        <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', width:'100%'}}>
          <div className="card" style={{maxWidth:350, width:'100%', textAlign:'center'}}>
            <h2>Sign in</h2>
            <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
            <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
            <button className="btn" style={{marginTop:10, width:'100%'}} onClick={signin}>Sign In</button>
          </div>
        </div>
      )}

      {page!=='signin' && (
        <div style={{maxWidth:1200, margin:'0 auto'}}>
          <div className="header" style={{marginBottom:16}}>
            <div>
              <h1 style={{margin:0}}>Startup Suggest-O-Matic 🚀</h1>
              <div className="muted">Pitch & rate startup ideas</div>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <button className="btn" onClick={()=>setPresenterModalOpen(true)}>Next Week's Presenter</button>
              <ThemeToggle theme={theme} toggle={()=>setTheme(theme==='light'?'dark':'light')} />
              <div className="muted">Signed in as <strong>{currentUser?.profile?.name}</strong></div>
              <button className="btn" onClick={signout}>Sign out</button>
            </div>
          </div>

          <div className="grid">
            <div style={{display:'grid', gap:12}}>
              <div className="card">
                <h2>Profile</h2>
                <div><strong>{currentUser?.profile?.name}</strong></div>
                <div className="muted">{currentUser?.profile?.bio}</div>
                <div style={{marginTop:4}}><em>{currentUser?.profile?.funnyTitle}</em></div>
                <div style={{marginTop:4}}><small>Superpower: {currentUser?.profile?.superPower}</small></div>
                <button className="btn" style={{marginTop:10}} onClick={openEditProfile}>Edit Profile</button>
              </div>
              <div className="card">
                <h3>Add a Startup Idea</h3>
                <input placeholder="Idea title" value={ideaTitle} onChange={e=>setIdeaTitle(e.target.value)} />
                <textarea placeholder="Description" rows={3} value={ideaDesc} onChange={e=>setIdeaDesc(e.target.value)} />
                <button className="btn" style={{marginTop:10}} onClick={addIdea}>Add Idea</button>
              </div>
            </div>
            <div>
              {data && data.users.flatMap(u=>u.ideas.map(idea=>(
                <IdeaCard key={idea.id} idea={idea} currentUserId={currentUserId} onRate={rateIdea} onViewRatings={setRatingsModalIdea} />
              )))}
            </div>
          </div>
        </div>
      )}

      {ratingsModalIdea && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Ratings for "{ratingsModalIdea.title}"</h3>
            {Object.keys(ratingsModalIdea.ratings||{}).length===0 && <div className="small">No ratings yet</div>}
            {Object.entries(ratingsModalIdea.ratings||{}).map(([uid,val])=>{
              const user = data.users.find(u=>u.id===uid)
              return <div key={uid} className="rating-row"><div>{user?.profile?.name}</div><div>{val} ⭐</div></div>
            })}
            <div style={{textAlign:'right', marginTop:10}}>
              <button className="btn" onClick={()=>setRatingsModalIdea(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {editProfileOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Profile</h3>
            <input
              placeholder="Name"
              value={profileForm.name}
              onChange={e => setProfileForm({...profileForm, name: e.target.value})}
            />
            <textarea
              placeholder="Bio"
              rows={2}
              value={profileForm.bio}
              onChange={e => setProfileForm({...profileForm, bio: e.target.value})}
            />
            <input
              placeholder="Funny Title"
              value={profileForm.funnyTitle}
              onChange={e => setProfileForm({...profileForm, funnyTitle: e.target.value})}
            />
            <input
              placeholder="Super Power"
              value={profileForm.superPower}
              onChange={e => setProfileForm({...profileForm, superPower: e.target.value})}
            />
            <div style={{marginTop:10, display:'flex', justifyContent:'flex-end', gap:8}}>
              <button className="btn" onClick={saveProfile}>Save</button>
              <button className="btn" style={{background:'#888'}} onClick={()=>setEditProfileOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {presenterModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Next Week's Presenter</h3>
            {presenterData.presenter && presenterData.date ? (
              <div style={{marginBottom:10}}>
                <div><strong>Presenter:</strong> {presenterData.presenter}</div>
                <div><strong>Date:</strong> {presenterData.date}</div>
              </div>
            ) : (
              <div className="small muted" style={{marginBottom:10}}>No presenter set yet.</div>
            )}

            {currentUserId === 'u1' && (
              <>
                <input
                  placeholder="Presenter Name"
                  value={presenterData.presenter}
                  onChange={e=>setPresenterData({...presenterData, presenter: e.target.value})}
                />
                <input
                  type="date"
                  value={presenterData.date}
                  onChange={e=>setPresenterData({...presenterData, date: e.target.value})}
                  style={{marginTop:6}}
                />
                <button
                  className="btn"
                  style={{marginTop:10}}
                  onClick={()=>alert('Presenter updated!')}
                >
                  Save
                </button>
              </>
            )}

            <div style={{textAlign:'right', marginTop:10}}>
              <button className="btn" style={{background:'#888'}} onClick={()=>setPresenterModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
