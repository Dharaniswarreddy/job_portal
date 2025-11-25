/*
Job Application Portal - Single-file React App
Filename: JobApplicationPortal.jsx

Instructions:
1. Create a new React app (recommended: Vite):
   npm create vite@latest job-portal -- --template react
   cd job-portal
   npm install

2. Replace src/main.jsx with the default and create src/App.jsx with the contents of this file.
   Or paste this file as src/App.jsx and then in src/main.jsx import App from './App.jsx'.

3. Optional: run a mock API with json-server:
   npm install -g json-server
   Create db.json with { "applications": [] }
   Run: json-server --watch db.json --port 4000

   To enable sending data to the mock API, set `USE_JSON_SERVER = true` in the code and update JSON_SERVER_URL.
   The project by default stores data in localStorage so no backend is required.

What this file contains (all features requested):
- /apply page: form with name, email, phone, experience (years), resume upload
- Form validation: required fields, email & phone simple checks
- File upload: resume read as Data URL and stored in localStorage (or sent to mock API)
- Submit to mock API (commented and optional) or localStorage
- /applications page: lists submitted applications
- Search by name and filter by experience (min years)
- Basic styling and UX hints

Note: this single-file app uses React Router. If your project template doesn't include React Router, install it:
  npm install react-router-dom

*/

import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom'

// Toggle to send data to json-server (if you run it). Default false -> localStorage only.
const USE_JSON_SERVER = false
const JSON_SERVER_URL = 'http://localhost:4000/applications'

/* Utility functions */
const uid = () => '_' + Math.random().toString(36).substr(2, 9)

function saveToLocalStorage(apps) {
  localStorage.setItem('job_applications', JSON.stringify(apps))
}
function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem('job_applications')
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

/* App Component -- sets up routes and layout */
export default function App() {
  return (
    <Router>
      <div style={styles.container}>
        <Header />
        <main style={styles.main}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/apply" element={<ApplyForm />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

function Header() {
  return (
    <header style={styles.header}>
      <h1 style={{ margin: 0 }}>Job Application Portal</h1>
      <nav>
        <Link style={styles.link} to="/apply">Apply</Link>
        <Link style={styles.link} to="/applications">Applications</Link>
      </nav>
    </header>
  )
}

function Home() {
  return (
    <div>
      <h2>Welcome</h2>
      <p>This mini project demonstrates: forms, validation, file upload, API calls (optional), routing, listing, search.</p>
      <p>
        Use the <Link to="/apply">Apply</Link> page to submit an application. View submissions on <Link to="/applications">Applications</Link>.
      </p>
    </div>
  )
}

/* ApplyForm component */
function ApplyForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', experience: '', resumeDataUrl: '', resumeName: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function validate(values) {
    const e = {}
    if (!values.name.trim()) e.name = 'Name is required'
    if (!values.email.trim()) e.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(values.email)) e.email = 'Email looks invalid'
    if (!values.phone.trim()) e.phone = 'Phone is required'
    else if (!/^[0-9]{7,15}$/.test(values.phone.replace(/\D/g, ''))) e.phone = 'Phone should be 7-15 digits'
    if (values.experience === '' || values.experience === null) e.experience = 'Experience is required'
    if (!values.resumeDataUrl) e.resume = 'Resume upload is required'
    return e
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setForm(prev => ({ ...prev, resumeDataUrl: reader.result, resumeName: file.name }))
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const v = validate(form)
    setErrors(v)
    if (Object.keys(v).length) return
    setSubmitting(true)

    const newApp = {
      id: uid(),
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      experience: Number(form.experience),
      resumeName: form.resumeName,
      resumeDataUrl: form.resumeDataUrl,
      appliedAt: new Date().toISOString(),
    }

    try {
      if (USE_JSON_SERVER) {
        // send to json-server
        const res = await fetch(JSON_SERVER_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newApp),
        })
        if (!res.ok) throw new Error('Failed to send to JSON server')
      } else {
        // store locally
        const list = loadFromLocalStorage()
        list.unshift(newApp)
        saveToLocalStorage(list)
      }

      // success - clear form and navigate to list
      setForm({ name: '', email: '', phone: '', experience: '', resumeDataUrl: '', resumeName: '' })
      navigate('/applications')
    } catch (err) {
      alert('Submission failed: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={styles.card}>
      <h2>Apply for Job</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div style={styles.field}>
          <label>Name *</label>
          <input name="name" value={form.name} onChange={handleChange} />
          {errors.name && <div style={styles.error}>{errors.name}</div>}
        </div>

        <div style={styles.field}>
          <label>Email *</label>
          <input name="email" value={form.email} onChange={handleChange} />
          {errors.email && <div style={styles.error}>{errors.email}</div>}
        </div>

        <div style={styles.field}>
          <label>Phone *</label>
          <input name="phone" value={form.phone} onChange={handleChange} />
          {errors.phone && <div style={styles.error}>{errors.phone}</div>}
        </div>

        <div style={styles.field}>
          <label>Experience (years) *</label>
          <input type="number" min="0" name="experience" value={form.experience} onChange={handleChange} />
          {errors.experience && <div style={styles.error}>{errors.experience}</div>}
        </div>

        <div style={styles.field}>
          <label>Resume (PDF / DOC) *</label>
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleFile} />
          {form.resumeName && <small>Uploaded: {form.resumeName}</small>}
          {errors.resume && <div style={styles.error}>{errors.resume}</div>}
        </div>

        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={submitting} style={styles.button}>
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          <small>Tip: Data stored in localStorage. To use json-server set USE_JSON_SERVER = true and run json-server as documented above.</small>
        </div>
      </form>
    </div>
  )
}

/* Applications list and search/filter */
function Applications() {
  const [apps, setApps] = useState([])
  const [query, setQuery] = useState('')
  const [minExp, setMinExp] = useState('')
  const [loading, setLoading] = useState(false)
  const location = useLocation()

  useEffect(() => {
    fetchApps()
  }, [location.key])

  async function fetchApps() {
    setLoading(true)
    try {
      if (USE_JSON_SERVER) {
        const res = await fetch(JSON_SERVER_URL + '?_sort=appliedAt&_order=desc')
        const data = await res.json()
        setApps(Array.isArray(data) ? data : [])
      } else {
        const data = loadFromLocalStorage()
        setApps(data)
      }
    } catch (err) {
      alert('Failed to load applications: ' + err.message)
      setApps([])
    } finally {
      setLoading(false)
    }
  }

  function handleDelete(id) {
    if (!confirm('Delete this application?')) return
    const newList = apps.filter(a => a.id !== id)
    setApps(newList)
    if (USE_JSON_SERVER) {
      fetch(`${JSON_SERVER_URL}/${id}`, { method: 'DELETE' }).catch(() => alert('Failed to delete on server'))
    } else {
      saveToLocalStorage(newList)
    }
  }

  function downloadResume(a) {
    if (!a.resumeDataUrl) return alert('No resume saved')
    const link = document.createElement('a')
    link.href = a.resumeDataUrl
    link.download = a.resumeName || 'resume'
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const filtered = apps.filter(a => {
    const matchesName = a.name.toLowerCase().includes(query.toLowerCase())
    const matchesExp = minExp === '' || Number(a.experience) >= Number(minExp)
    return matchesName && matchesExp
  })

  return (
    <div style={styles.card}>
      <h2>Submitted Applications</h2>
      <div style={styles.controls}>
        <input placeholder="Search by name" value={query} onChange={e => setQuery(e.target.value)} />
        <input type="number" min="0" placeholder="Min experience" value={minExp} onChange={e => setMinExp(e.target.value)} style={{ width: 140 }} />
        <button onClick={() => { setQuery(''); setMinExp('') }} style={styles.smallButton}>Clear</button>
        <button onClick={() => exportCSV(filtered)} style={styles.smallButton}>Export CSV</button>
      </div>

      {loading ? <p>Loading...</p> : (
        <div>
          <p style={{ marginTop: 8 }}>{filtered.length} result(s)</p>
          <ul style={styles.list}>
            {filtered.map(a => (
              <li key={a.id} style={styles.listItem}>
                <div>
                  <strong>{a.name}</strong> — {a.email} — {a.phone}
                  <div>Experience: {a.experience} year(s)</div>
                  <div>Applied: {new Date(a.appliedAt).toLocaleString()}</div>
                </div>
                <div style={styles.itemActions}>
                  <button onClick={() => downloadResume(a)} style={styles.smallButton}>Download Resume</button>
                  <button onClick={() => handleDelete(a.id)} style={{ ...styles.smallButton, background: '#ffdddd' }}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function exportCSV(list) {
  if (!list.length) return alert('No data to export')
  const header = ['id', 'name', 'email', 'phone', 'experience', 'resumeName', 'appliedAt']
  const rows = list.map(a => header.map(h => JSON.stringify(a[h] ?? '')).join(','))
  const csv = [header.join(',')].concat(rows).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'applications.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function NotFound() {
  return (
    <div>
      <h2>404 — Not found</h2>
      <p>Try <Link to="/apply">Apply</Link>.</p>
    </div>
  )
}

/* Basic inline styles for clarity */
const styles = {
  container: { fontFamily: 'Inter, Roboto, system-ui, -apple-system, "Segoe UI"', minHeight: '100vh', background: '#f5f7fa' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', background: '#1f2937', color: '#fff' },
  link: { color: '#cfe8ff', marginLeft: 12, textDecoration: 'none' },
  main: { padding: 24, maxWidth: 900, margin: '24px auto' },
  card: { background: '#0f7880ff', padding: 18, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  field: { marginBottom: 12, display: 'flex', flexDirection: 'column' },
  error: { color: '#b91c1c', marginTop: 6 },
  button: { padding: '10px 14px', borderRadius: 6, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer' },
  smallButton: { padding: '6px 8px', marginLeft: 8, borderRadius: 6, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' },
  controls: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 },
  list: { listStyle: 'none', padding: 0, marginTop: 12 },
  listItem: { display: 'flex', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid #eee' },
  itemActions: { display: 'flex', flexDirection: 'column', gap: 6 }
}

/* Render to DOM if this file used as main entry */
if (typeof document !== 'undefined') {
  try {
    const root = document.getElementById('root')
    if (root) {
      createRoot(root).render(<App />)
    }
  } catch (e) {
    console.warn('Not mounting automatically — possibly being imported by another module.')
  }
}
