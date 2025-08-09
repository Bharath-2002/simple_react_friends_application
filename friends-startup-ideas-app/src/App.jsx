// Single-file React app (App.jsx)
// Updated: added "View All Ratings" popup/modal for each idea.

import React, { useEffect, useState } from 'react'

// --- Seed data ---
const SEED_DATA = {
  users: [
    {
      id: 'u1',
      username: 'bharath',
      password: '1234',
      profile: {
        name: 'Bharath S',
        bio: 'Aspiring startup billionaire 💸',
        funnyTitle: 'Chief Snack Officer',
        superPower: 'Can debug with eyes closed'
      },
      ideas: [
        {
          id: 'i1',
          title: 'Smart Fridge that Orders Snacks',
          description: 'Fridge detects snacks running low and orders instantly.',
          ratings: { u1: 5, u2: 4 }
        }
      ]
    },
    {
      id: 'u2',
      username: 'rahul',
      password: 'abcd',
      profile: {
        name: 'Rahul R',
        bio: 'Techie & meme enthusiast',
        funnyTitle: 'Meme Distribution Head',
        superPower: 'Invents problems to solve'
      },
      ideas: []
    }
  ]
}

const STORAGE_KEY = 'friends_startup_data_v1'

function makeId(prefix = 'id'){
  return prefix + '_' + Math.random().toString(36).slice(2,9)
}

function loadData(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch(e) {
    console.error('Failed reading localStorage seed, falling back to default', e)
  }
  return JSON.parse(JSON.stringify(SEED_DATA))
}

function saveData(data){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch(e) { console.error(e) }
}

// --- Styles (embedded so no external CSS file required) ---
const styles = `
  :root{ --accent:#ff6b6b; --muted:#666; --card:#fff; }
  *{ box-sizing: border-box; }
  body{ font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }
  .app { padding: 18px; min-height: 100vh; background: linear-gradient(135deg,#fff7f2 0%, #ffffff 40%); }
  .header{ display:flex; justify-content:space-between; align-items:center; gap:12px; }
  .card{ background:var(--card); padding:16px; border-radius:14px; box-shadow: 0 6px 20px rgba(10,10,10,0.06); }
  .btn{ background:var(--accent); color:#fff; padding:8px 12px; border-radius:10px; border:none; cursor:pointer; }
  .muted{ color:var(--muted); font-size:13px; }
  .grid{ display:grid; gap:16px; grid-template-columns: 1fr; }
  @media(min-width:900px){ .grid{ grid-template-columns: 320px 1fr; } }
  .idea{ padding:12px; border-radius:12px; background:#fff; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
  .star{ font-size:20px; margin-right:6px; background:none; border:none; cursor:pointer; }
  .star.filled{ color: #f6c84c; }
  .small{ font-size:13px; }
  input, textarea{ width:100%; padding:8px; border-radius:8px; border:1px solid #e6e6e6; }
  /* modal styles */
  .modal-overlay{ position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(2,6,23,0.45); z-index:50; }
  .modal{ background:var(--card); padding:18px; border-radius:12px; width:90%; max-width:520px; box-shadow:0 12px 40px rgba(2,6,23,0.3); }
  .rating-row{ display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid rgba(0,0,0,0.04); }
`

// --- Components ---
function StarRating({ value = 0, onRate, readOnly = false }){
  const stars = [1,2,3,4,5]
  return (
    <div style={{display:'flex', alignItems:'center'}} aria-label={`rating ${value} of 5`}>
      {stars.map(s => (
        <button
          key={s}
          onClick={() => { if (!readOnly && typeof onRate === 'function') onRate(s) }}
          className={`star ${s <= value ? 'filled' : ''}`}
          aria-pressed={s <= value}
          title={`${s} star`}
          style={{ background: 'transparent', border: 'none' }}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function IdeaCard({ idea, currentUserId, onRate, onViewRatings }){
  const ratings = idea.ratings || {}
  const values = Object.values(ratings)
  const avg = values.length ? (values.reduce((a,b)=>a+b,0)/values.length).toFixed(1) : '—'

  return (
    <div className="idea">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
        <div style={{fontWeight:700}}>{idea.title}</div>
        <div className="small muted">Avg: {avg}</div>
      </div>
      <div style={{marginTop:8, color:'#333'}}>{idea.description}</div>
      <div style={{marginTop:10, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <StarRating value={ratings[currentUserId] || 0} onRate={(s)=>onRate(idea.id, s)} readOnly={false} />
          <div className="small muted">({values.length} votes)</div>
        </div>
        <div>
          <button className="btn" onClick={() => onViewRatings && onViewRatings(idea)}>View Ratings</button>
        </div>
      </div>
    </div>
  )
}

function SignIn({ onSignIn, error }){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  return (
    <div style={{display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh'}}>
      <div className="card" style={{maxWidth:420, width:'100%'}}>
        <h2>Welcome — Sign in</h2>
        <div className="muted" style={{marginTop:6}}>Use the provided credentials (stored locally). This demo runs entirely in your browser.</div>
        <div style={{marginTop:12, display:'grid', gap:8}}>
          <input placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} />
          <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="btn" onClick={()=>onSignIn(username, password)}>Sign in</button>
          {error && <div style={{color:'crimson'}}>{error}</div>}
        </div>
      </div>
    </div>
  )
}

function ProfileEditor({ profile, onSave }){
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(profile)
  useEffect(()=> setForm(profile), [profile])
  function submit(){ onSave(form); setOpen(false) }
  return (
    <div style={{marginTop:12}}>
      <button className="btn" onClick={()=>setOpen(true)} style={{background:'transparent', border:'1px solid #eee', color:'#333'}}>Edit profile</button>
      {open && (
        <div style={{marginTop:10, display:'grid', gap:8}}>
          <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
          <input value={form.funnyTitle} onChange={e=>setForm({...form, funnyTitle:e.target.value})} />
          <input value={form.superPower} onChange={e=>setForm({...form, superPower:e.target.value})} />
          <textarea rows={3} value={form.bio} onChange={e=>setForm({...form, bio:e.target.value})} />
          <div style={{display:'flex', gap:8}}>
            <button className="btn" onClick={submit}>Save</button>
            <button onClick={()=>{ setForm(profile); setOpen(false) }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

function IdeaForm({ onAdd }){
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  return (
    <div style={{display:'grid', gap:8}}>
      <input placeholder="Idea title" value={title} onChange={e=>setTitle(e.target.value)} />
      <textarea rows={3} placeholder="Short description" value={description} onChange={e=>setDescription(e.target.value)} />
      <div>
        <button className="btn" onClick={()=>{ if(!title) return; onAdd(title, description); setTitle(''); setDescription('') }}>Add Idea</button>
      </div>
    </div>
  )
}

function IdeasFeed({ data, currentUserId, onRate, onViewRatings }){
  const ideas = []
  data.users.forEach(u => {
    (u.ideas || []).forEach(idea => ideas.push({...idea, owner: { id: u.id, name: u.profile.name }}))
  })
  const avg = x => { const v = Object.values(x.ratings || {}); return v.length ? v.reduce((s,n)=>s+n,0)/v.length : 0 }
  ideas.sort((a,b)=> avg(b) - avg(a) )

  return (
    <div style={{display:'grid', gap:12}}>
      {ideas.map(idea => (
        <div key={idea.id} style={{display:'grid', gridTemplateColumns:'1fr auto', gap:12, alignItems:'center'}}>
          <IdeaCard idea={idea} currentUserId={currentUserId} onRate={onRate} onViewRatings={onViewRatings} />
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:13, color:'#333'}}><strong>By:</strong> {idea.owner.name}</div>
            <div className="muted" style={{marginTop:6}}>Idea ID: <span style={{fontSize:11, color:'#999'}}>{idea.id}</span></div>
          </div>
        </div>
      ))}
    </div>
  )
}

// --- Main app ---
export default function App(){
  const [data, setDataState] = useState(null)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [page, setPage] = useState('signin')
  const [signinError, setSigninError] = useState('')
  const [ratingsModalIdea, setRatingsModalIdea] = useState(null)

  useEffect(()=>{
    const d = loadData()
    setDataState(d)
  }, [])

  useEffect(()=>{ if (data) saveData(data) }, [data])

  if (!data) return (
    <div style={{padding:20}}>Loading…</div>
  )

  const currentUser = data.users.find(u => u.id === currentUserId) || null

  function setData(next){ setDataState(next) }

  function signin(username, password){
    const user = data.users.find(u => u.username === username && u.password === password)
    if (!user) { setSigninError('Invalid credentials'); return }
    setCurrentUserId(user.id)
    setPage('profile')
    setSigninError('')
  }

  function signout(){ setCurrentUserId(null); setPage('signin') }

  function updateProfile(updates){
    const users = data.users.map(u => u.id === currentUserId ? {...u, profile: {...u.profile, ...updates}} : u)
    const newData = {...data, users}
    setData(newData)
  }

  function addIdea(title, description){
    const newIdea = { id: makeId('i'), title, description, ratings: {} }
    const users = data.users.map(u => u.id === currentUserId ? {...u, ideas: [newIdea, ...u.ideas]} : u)
    const newData = {...data, users}
    setData(newData)
  }

  function rateIdea(ideaId, rating){
    const users = data.users.map(u => {
      const ideas = (u.ideas || []).map(idea => {
        if (idea.id !== ideaId) return idea
        const newRatings = {...(idea.ratings || {}), [currentUserId]: rating}
        return {...idea, ratings: newRatings}
      })
      return {...u, ideas}
    })
    const newData = {...data, users}
    setData(newData)
  }

  function openRatingsModal(idea){
    setRatingsModalIdea(idea)
  }
  function closeRatingsModal(){ setRatingsModalIdea(null) }

  return (
    <div className="app">
      <style>{styles}</style>

      {page === 'signin' && (
        <div style={{maxWidth:900, margin:'0 auto'}}>
          <SignIn onSignIn={signin} error={signinError} />
        </div>
      )}

      {page !== 'signin' && (
        <div style={{maxWidth:1200, margin:'0 auto'}}>
          <div className="header" style={{marginBottom:16}}>
            <div>
              <h1 style={{margin:0}}>Startup Suggest-O-Matic 🚀</h1>
              <div className="muted">A tiny playground for your friends to pitch and rate ideas</div>
            </div>
            <div style={{display:'flex', gap:12, alignItems:'center'}}>
              <div className="muted">Signed in as <strong>{currentUser?.profile?.name}</strong></div>
              <button className="btn" onClick={signout}>Sign out</button>
            </div>
          </div>

          <div className="grid">
            <div style={{display:'grid', gap:12}}>
              <div className="card">
                <h2 style={{marginTop:0}}>Profile</h2>
                <div className="muted">{currentUser?.profile?.bio}</div>
                <div style={{marginTop:8, fontSize:13}}>
                  <div><strong>Funny Title:</strong> {currentUser?.profile?.funnyTitle}</div>
                  <div><strong>Super Power:</strong> {currentUser?.profile?.superPower}</div>
                </div>
                <ProfileEditor profile={currentUser?.profile} onSave={updateProfile} />
              </div>

              <div className="card">
                <h3 style={{marginTop:0}}>Add a Startup Idea</h3>
                <IdeaForm onAdd={addIdea} />
              </div>
            </div>

            <div>
              <div className="card" style={{marginBottom:12}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <h3 style={{margin:0}}>All Ideas</h3>
                  <div className="muted small">Rate your friends' ideas — be kind 🙃</div>
                </div>
              </div>

              <IdeasFeed data={data} currentUserId={currentUserId} onRate={rateIdea} onViewRatings={openRatingsModal} />
            </div>

          </div>
        </div>
      )}

      {/* Ratings modal */}
      {ratingsModalIdea && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 style={{marginTop:0}}>Ratings for "{ratingsModalIdea.title}"</h3>
            <div style={{marginTop:12}}>
              {Object.keys(ratingsModalIdea.ratings || {}).length === 0 && <div className="small">No ratings yet</div>}
              {Object.entries(ratingsModalIdea.ratings || {}).map(([uid, val]) => {
                const user = data.users.find(u => u.id === uid)
                return (
                  <div key={uid} className="rating-row">
                    <div>{user?.profile?.name || user?.username || 'Unknown'}</div>
                    <div>{val} ⭐</div>
                  </div>
                )
              })}
            </div>
            <div style={{display:'flex', justifyContent:'flex-end', marginTop:12}}>
              <button className="btn" onClick={closeRatingsModal}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

// End of file
