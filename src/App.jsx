import { useEffect, useMemo, useState } from 'react'

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
    </div>
  )
}

function Input({ label, type = 'text', value, onChange, ...props }) {
  return (
    <label className="block text-sm mb-3">
      <span className="text-gray-700 font-medium">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...props}
      />
    </label>
  )
}

function Textarea({ label, value, onChange, ...props }) {
  return (
    <label className="block text-sm mb-3">
      <span className="text-gray-700 font-medium">{label}</span>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...props}
      />
    </label>
  )
}

function Button({ children, onClick, variant = 'primary', ...props }) {
  const cls = variant === 'primary'
    ? 'bg-blue-600 hover:bg-blue-700'
    : variant === 'secondary'
    ? 'bg-gray-600 hover:bg-gray-700'
    : 'bg-green-600 hover:bg-green-700'
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-white font-semibold transition-colors ${cls}`}
      {...props}
    >
      {children}
    </button>
  )
}

function useBackend() {
  const baseUrl = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])
  const get = async (path) => {
    const r = await fetch(`${baseUrl}${path}`)
    if (!r.ok) throw new Error(await r.text())
    return r.json()
  }
  const post = async (path, body) => {
    const r = await fetch(`${baseUrl}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!r.ok) throw new Error(await r.text())
    return r.json()
  }
  return { baseUrl, get, post }
}

function Departments() {
  const api = useBackend()
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const load = async () => {
    setLoading(true)
    try { setItems(await api.get('/api/departments')) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  const create = async () => {
    if (!name.trim()) return
    await api.post('/api/departments', { name, description: desc })
    setName(''); setDesc(''); load()
  }
  return (
    <div>
      <SectionHeader title="Departments" subtitle="Create and manage departments" />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border">
          <Input label="Name" value={name} onChange={setName} placeholder="e.g. Engineering" />
          <Textarea label="Description" value={desc} onChange={setDesc} rows={3} placeholder="Optional" />
          <Button onClick={create}>Add Department</Button>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">All Departments</h3>
            {loading && <span className="text-xs text-gray-500">Loading...</span>}
          </div>
          <ul className="divide-y">
            {items.map(d => (
              <li key={d.id} className="py-2">
                <p className="font-medium text-gray-800">{d.name}</p>
                {d.description && <p className="text-sm text-gray-500">{d.description}</p>}
              </li>
            ))}
            {items.length === 0 && !loading && <p className="text-sm text-gray-500">No departments yet.</p>}
          </ul>
        </div>
      </div>
    </div>
  )
}

function Employees() {
  const api = useBackend()
  const [items, setItems] = useState([])
  const [deps, setDeps] = useState([])
  const [first, setFirst] = useState('')
  const [last, setLast] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const load = async () => {
    const [emps, ds] = await Promise.all([api.get('/api/employees'), api.get('/api/departments')])
    setItems(emps); setDeps(ds)
  }
  useEffect(() => { load() }, [])
  const create = async () => {
    if (!first.trim() || !last.trim() || !email.trim()) return
    await api.post('/api/employees', { first_name: first, last_name: last, email, phone: phone || undefined, department_id: departmentId || undefined, role: role || undefined })
    setFirst(''); setLast(''); setEmail(''); setPhone(''); setRole(''); setDepartmentId(''); load()
  }
  return (
    <div>
      <SectionHeader title="Employees" subtitle="Add team members and view roster" />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" value={first} onChange={setFirst} />
            <Input label="Last name" value={last} onChange={setLast} />
          </div>
          <Input label="Email" type="email" value={email} onChange={setEmail} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Phone" value={phone} onChange={setPhone} />
            <Input label="Role" value={role} onChange={setRole} />
          </div>
          <label className="block text-sm mb-3">
            <span className="text-gray-700 font-medium">Department</span>
            <select value={departmentId} onChange={e => setDepartmentId(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Unassigned</option>
              {deps.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </label>
          <Button onClick={create}>Add Employee</Button>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-semibold text-gray-700 mb-3">Roster</h3>
          <ul className="divide-y">
            {items.map(emp => (
              <li key={emp.id} className="py-2">
                <p className="font-medium text-gray-800">{emp.first_name} {emp.last_name} <span className="text-gray-500 text-sm">{emp.role ? `· ${emp.role}` : ''}</span></p>
                <p className="text-sm text-gray-500">{emp.email}{emp.phone ? ` · ${emp.phone}` : ''}</p>
                {emp.department_id && (
                  <p className="text-xs text-gray-500">Dept: {deps.find(d => d.id === emp.department_id)?.name || emp.department_id}</p>
                )}
              </li>
            ))}
            {items.length === 0 && <p className="text-sm text-gray-500">No employees yet.</p>}
          </ul>
        </div>
      </div>
    </div>
  )
}

function Leaves() {
  const api = useBackend()
  const [items, setItems] = useState([])
  const [emps, setEmps] = useState([])
  const [employeeId, setEmployeeId] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [reason, setReason] = useState('')
  const load = async () => {
    const [leaves, employees] = await Promise.all([api.get('/api/leaves'), api.get('/api/employees')])
    setItems(leaves); setEmps(employees)
  }
  useEffect(() => { load() }, [])
  const create = async () => {
    if (!employeeId || !start || !end) return
    await api.post('/api/leaves', { employee_id: employeeId, start_date: start, end_date: end, reason: reason || undefined })
    setEmployeeId(''); setStart(''); setEnd(''); setReason(''); load()
  }
  return (
    <div>
      <SectionHeader title="Leave Requests" subtitle="Submit and track time off" />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border">
          <label className="block text-sm mb-3">
            <span className="text-gray-700 font-medium">Employee</span>
            <select value={employeeId} onChange={e => setEmployeeId(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select employee</option>
              {emps.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start date" type="date" value={start} onChange={setStart} />
            <Input label="End date" type="date" value={end} onChange={setEnd} />
          </div>
          <Textarea label="Reason" value={reason} onChange={setReason} rows={3} />
          <Button onClick={create}>Submit Leave</Button>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-semibold text-gray-700 mb-3">All Requests</h3>
          <ul className="divide-y">
            {items.map(l => {
              const emp = emps.find(e => e.id === l.employee_id)
              return (
                <li key={l.id} className="py-2">
                  <p className="font-medium text-gray-800">{emp ? `${emp.first_name} ${emp.last_name}` : l.employee_id}</p>
                  <p className="text-sm text-gray-500">{l.start_date} → {l.end_date}</p>
                  {l.reason && <p className="text-sm text-gray-500">{l.reason}</p>}
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${l.status === 'approved' ? 'bg-green-100 text-green-700' : l.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{l.status || 'pending'}</span>
                </li>
              )
            })}
            {items.length === 0 && <p className="text-sm text-gray-500">No leave requests yet.</p>}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState('employees')
  const { baseUrl } = useBackend()
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-blue-700">HRMS</h1>
            <p className="text-xs text-gray-500">Backend: {baseUrl}</p>
          </div>
          <nav className="flex gap-2">
            <Button variant={tab === 'employees' ? 'primary' : 'secondary'} onClick={() => setTab('employees')}>Employees</Button>
            <Button variant={tab === 'departments' ? 'primary' : 'secondary'} onClick={() => setTab('departments')}>Departments</Button>
            <Button variant={tab === 'leaves' ? 'primary' : 'secondary'} onClick={() => setTab('leaves')}>Leaves</Button>
            <a href="/test" className="ml-2 inline-flex items-center justify-center px-4 py-2 rounded-md text-white font-semibold bg-green-600 hover:bg-green-700">Check Backend</a>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {tab === 'employees' && <Employees />}
        {tab === 'departments' && <Departments />}
        {tab === 'leaves' && <Leaves />}
      </main>

      <footer className="py-6 text-center text-xs text-gray-500">Simple HR Management • Demo</footer>
    </div>
  )
}
