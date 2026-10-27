import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../Context/useAuth'
import { useNavigate } from 'react-router-dom'

function Profile() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState({
    name: '',
    phone: '',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, phone, status')
        .eq('id', user.id)
        .single()

      if (profileError) {
        throw profileError
      }

      setProfile({
        name: data?.name || '',
        phone: data?.phone || '',
      })
    } catch (err) {
      console.error('Failed to load profile:', err)
      setError(err.message || 'Failed to load profile.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setProfile((current) => ({
      ...current,
      [name]: value,
    }))

    setMessage('')
    setError('')
  }

  const handleSave = async () => {
    if (!user) return

    if (!profile.name.trim()) {
      setError('Please enter your name.')
      return
    }

    setSaving(true)
    setMessage('')
    setError('')

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: profile.name.trim(),
          phone: profile.phone.trim(),
        })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      setMessage('Profile updated successfully.')
    } catch (err) {
      console.error('Failed to update profile:', err)
      setError(err.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    const { error: logoutError } = await signOut()

    if (logoutError) {
      setError(logoutError.message || 'Failed to log out.')
    }
  }

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-box">
          <div className="loading-mark">B</div>
          Loading your account...
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <style>{`
        * { box-sizing: border-box; }

        .profile-page {
          min-height: 100vh;
          background: radial-gradient(circle at 5% 0%, rgba(0,200,83,.09), transparent 27%), radial-gradient(circle at 95% 4%, rgba(255,214,10,.14), transparent 25%), #f7f8f5;
          color: #172018;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
        }

        .profile-loading { min-height: 100vh; display: grid; place-items: center; background: #f7f8f5; }
        .loading-box { min-width: 260px; padding: 28px 32px; border: 1px solid #e1e9e2; border-radius: 18px; background: #fff; box-shadow: 0 14px 38px rgba(24,53,31,.08); text-align: center; color: #5f6d63; font-size: 13px; font-weight: 700; }
        .loading-mark { width: 44px; height: 44px; margin: 0 auto 13px; border-radius: 13px; background: #ffd60a; color: #122016; display: grid; place-items: center; font-size: 24px; font-weight: 950; box-shadow: 0 7px 18px rgba(255,214,10,.25); animation: profilePulse 1.2s ease-in-out infinite; }
        @keyframes profilePulse { 0%,100% { transform: scale(1) rotate(-3deg); } 50% { transform: scale(1.06) rotate(2deg); } }

        .profile-shell { width: min(100%, 1180px); margin: 0 auto; padding: 28px 24px 80px; }
        .profile-topbar { display:flex; align-items:center; justify-content:space-between; gap:18px; margin-bottom:25px; }
        .profile-breadcrumb { display:flex; align-items:center; gap:8px; color:#7c887f; font-size:10px; font-weight:800; }
        .profile-breadcrumb button { border:0; background:transparent; padding:0; color:#087d32; cursor:pointer; font:inherit; }
        .profile-breadcrumb button:hover { text-decoration:underline; }
        .profile-badge { display:inline-flex; align-items:center; gap:7px; padding:8px 11px; border:1px solid #d8eddd; border-radius:999px; background:#f3fff5; color:#087d32; font-size:9px; font-weight:900; }
        .profile-badge-dot { width:7px; height:7px; border-radius:50%; background:#00c853; box-shadow:0 0 0 4px rgba(0,200,83,.1); }

        .profile-header { margin-bottom:23px; }
        .profile-title { margin:0; font-size:clamp(28px,4vw,39px); line-height:1.05; font-weight:950; letter-spacing:-1.5px; }
        .profile-title span { color:#00ad43; }
        .profile-subtitle { max-width:590px; margin:9px 0 0; color:#748078; font-size:12px; line-height:1.6; }

        .profile-grid { display:grid; grid-template-columns:295px minmax(0,1fr); gap:18px; align-items:start; }
        .profile-sidebar, .profile-card, .account-option { background:rgba(255,255,255,.96); border:1px solid #e2e9e3; box-shadow:0 10px 30px rgba(24,53,31,.055); }
        .profile-sidebar { position:sticky; top:94px; overflow:hidden; border-radius:21px; padding:24px; }
        .profile-sidebar::before { content:""; display:block; height:5px; margin:-24px -24px 23px; background:linear-gradient(90deg,#00c853,#a7df36,#ffd60a); }
        .avatar-wrap { position:relative; width:92px; margin:0 auto 16px; }
        .avatar { width:92px; height:92px; border-radius:28px; background:linear-gradient(145deg,#e5f9ea,#c9f0d4); color:#087d32; display:grid; place-items:center; font-size:34px; font-weight:950; box-shadow:inset 0 0 0 1px rgba(0,139,51,.08); transform:rotate(-2deg); }
        .avatar-badge { position:absolute; right:-4px; bottom:-4px; width:28px; height:28px; border:4px solid #fff; border-radius:50%; background:#00c853; display:grid; place-items:center; color:#fff; font-size:11px; font-weight:900; }
        .sidebar-name { margin:0; text-align:center; font-size:19px; font-weight:900; letter-spacing:-.35px; word-break:break-word; }
        .sidebar-email { margin:6px 0 17px; text-align:center; color:#87918a; font-size:10px; line-height:1.45; word-break:break-word; }
        .account-status { display:flex; align-items:center; justify-content:center; gap:7px; padding:10px; border:1px solid #dcefe0; border-radius:11px; background:#f5fff7; color:#087d32; font-size:10px; font-weight:900; }
        .status-dot { width:7px; height:7px; border-radius:50%; background:#00c853; box-shadow:0 0 0 4px rgba(0,200,83,.09); }
        .sidebar-tip { margin-top:15px; padding:12px; border-radius:12px; background:#fff9dc; border:1px solid #f2e6a9; color:#706000; font-size:9px; line-height:1.55; }

        .profile-main { min-width:0; }
        .profile-card { border-radius:21px; padding:25px; animation:profileIn .45s ease both; }
        @keyframes profileIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .card-heading { display:flex; justify-content:space-between; align-items:flex-start; gap:14px; margin-bottom:21px; }
        .card-title { margin:0; font-size:19px; font-weight:900; letter-spacing:-.4px; }
        .card-description { margin:6px 0 0; color:#808b83; font-size:11px; line-height:1.55; }
        .card-icon { width:40px; height:40px; border-radius:12px; background:#effaf2; display:grid; place-items:center; font-size:18px; flex-shrink:0; }

        .message { margin-bottom:17px; padding:11px 13px; border-radius:11px; font-size:10px; font-weight:700; line-height:1.5; }
        .success-message { background:#effbf2; border:1px solid #cfead5; color:#147a2b; }
        .error-message { background:#fff4f4; border:1px solid #f0cccc; color:#a33; }
        .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .form-group { display:flex; flex-direction:column; gap:7px; }
        .form-group.full { grid-column:1 / -1; }
        .form-label { font-size:10px; font-weight:900; color:#4c5950; }
        .form-input { width:100%; min-height:43px; padding:11px 12px; border:1px solid #dce4dd; border-radius:11px; outline:none; font:inherit; font-size:12px; color:#1e2921; background:#fff; transition:.2s ease; }
        .form-input:hover:not(.readonly) { border-color:#b9d9c0; }
        .form-input:focus { border-color:#00b843; box-shadow:0 0 0 3px rgba(0,200,83,.09); }
        .form-input.readonly { background:#f5f7f5; color:#7e8981; cursor:not-allowed; }
        .field-help { color:#99a29c; font-size:9px; line-height:1.45; }
        .actions { display:flex; justify-content:space-between; align-items:center; gap:15px; margin-top:25px; padding-top:20px; border-top:1px solid #edf0ed; }
        .save-button, .logout-button { min-height:42px; border-radius:11px; padding:10px 17px; font-size:10px; font-weight:900; cursor:pointer; transition:.2s ease; }
        .save-button { border:0; background:linear-gradient(135deg,#00c853,#00a83b); color:#fff; box-shadow:0 8px 18px rgba(0,168,59,.19); }
        .save-button:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 11px 23px rgba(0,168,59,.24); }
        .save-button:disabled { opacity:.55; cursor:not-allowed; box-shadow:none; }
        .logout-button { border:1px solid #efd1d1; background:#fff; color:#b13a3a; }
        .logout-button:hover { background:#fff6f6; border-color:#e7bcbc; }

        .account-sections { margin-top:17px; display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
        .account-option { position:relative; min-width:0; padding:17px; border-radius:17px; text-align:left; cursor:pointer; display:flex; align-items:flex-start; gap:12px; transition:.22s ease; font:inherit; }
        .account-option:hover { border-color:#b9dcc1; box-shadow:0 13px 30px rgba(24,70,35,.09); transform:translateY(-2px); }
        .option-icon { width:42px; height:42px; flex-shrink:0; border-radius:12px; background:#f1faf3; display:grid; place-items:center; font-size:19px; }
        .option-content { min-width:0; padding-top:2px; padding-right:20px; }
        .option-title { margin:0 0 5px; color:#1e2921; font-size:12px; font-weight:900; }
        .option-description { margin:0; color:#849087; font-size:9px; line-height:1.55; }
        .option-arrow { position:absolute; top:17px; right:15px; color:#00a83b; font-size:15px; font-weight:900; transition:transform .2s ease; }
        .account-option:hover .option-arrow { transform:translateX(3px); }

        @media (max-width:800px) {
          .profile-grid { grid-template-columns:1fr; }
          .profile-sidebar { position:static; }
          .profile-sidebar { display:grid; grid-template-columns:auto 1fr; column-gap:16px; align-items:center; }
          .profile-sidebar::before { grid-column:1 / -1; }
          .avatar-wrap { grid-row:2 / span 3; margin:0; }
          .sidebar-name, .sidebar-email { text-align:left; }
          .account-status { justify-content:flex-start; width:fit-content; padding:7px 9px; }
          .sidebar-tip { grid-column:1 / -1; }
        }

        @media (max-width:600px) {
          .profile-shell { padding:19px 13px 55px; }
          .profile-topbar { margin-bottom:20px; }
          .profile-badge { padding:7px 9px; }
          .profile-header { margin-bottom:19px; }
          .profile-title { font-size:30px; }
          .profile-subtitle { font-size:11px; }
          .profile-sidebar { display:block; text-align:center; padding:20px; }
          .profile-sidebar::before { margin:-20px -20px 20px; }
          .avatar-wrap { margin:0 auto 15px; }
          .sidebar-name, .sidebar-email { text-align:center; }
          .account-status { justify-content:center; width:auto; }
          .profile-card { padding:18px; border-radius:18px; }
          .form-grid { grid-template-columns:1fr; gap:14px; }
          .form-group.full { grid-column:auto; }
          .actions { flex-direction:column-reverse; align-items:stretch; }
          .save-button, .logout-button { width:100%; }
          .account-sections { grid-template-columns:1fr; }
        }

        @media (prefers-reduced-motion:reduce) {
          .loading-mark, .profile-card, .account-option, .save-button { animation:none !important; transition:none !important; transform:none !important; }
        }
      `}</style>

      <div className="profile-shell">
        <div className="profile-topbar">
          <div className="profile-breadcrumb">
            <button type="button" onClick={() => navigate('/')}>Home</button>
            <span>›</span>
            <span>My Account</span>
          </div>

          <div className="profile-badge">
            <span className="profile-badge-dot" />
            Account secured
          </div>
        </div>

        <header className="profile-header">
          <h1 className="profile-title">My <span>Account</span></h1>

          <p className="profile-subtitle">
            Manage your personal information and keep your Blinkit account up to date.
          </p>
        </header>

        <div className="profile-grid">
          <aside className="profile-sidebar">
            <div className="avatar-wrap">
              <div className="avatar">
                {(profile.name || user?.email || 'U')
                  .charAt(0)
                  .toUpperCase()}
                <span className="avatar-badge">✓</span>
              </div>
            </div>

            <h2 className="sidebar-name">
              {profile.name || 'Customer'}
            </h2>

            <p className="sidebar-email">
              {user?.email || 'No email available'}
            </p>

            <div className="account-status">
              <span className="status-dot" />
              Active Account
            </div>

            <div className="sidebar-tip">
              💚 Your account details are stored securely and used to make your deliveries smoother.
            </div>
          </aside>

          <main className="profile-main">
            <section className="profile-card">
              <div className="card-heading">
                <div>
                  <h2 className="card-title">Personal Information</h2>

                  <p className="card-description">
                    Update the information associated with your Blinkit account.
                  </p>
                </div>

                <div className="card-icon">👤</div>
              </div>

              {message && (
                <div className="message success-message">
                  ✓ {message}
                </div>
              )}

              {error && (
                <div className="message error-message">
                  {error}
                </div>
              )}

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">
                    Full Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    className="form-input"
                    value={profile.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="phone">
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    className="form-input"
                    value={profile.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="form-group full">
                  <label className="form-label" htmlFor="email">
                    Email Address
                  </label>

                  <input
                    id="email"
                    className="form-input readonly"
                    value={user?.email || ''}
                    readOnly
                  />

                  <span className="field-help">
                    Your email is managed through your authentication
                    account.
                  </span>
                </div>
              </div>

              <div className="actions">
                <button
                  className="logout-button"
                  onClick={handleLogout}
                >
                  Log Out
                </button>

                <button
                  className="save-button"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </section>

            <div className="account-sections">
              <button
                type="button"
                className="account-option"
                onClick={() => navigate('/checkout')}
              >
                <div className="option-icon">📍</div>

                <div className="option-content">
                  <h3 className="option-title">Saved Addresses</h3>

                  <p className="option-description">
                    Add and manage your delivery addresses.
                  </p>
                </div>

                <span className="option-arrow">→</span>
              </button>

              <button
                type="button"
                className="account-option"
                onClick={() => navigate('/')}
              >
                <div className="option-icon">📦</div>

                <div className="option-content">
                  <h3 className="option-title">My Orders</h3>

                  <p className="option-description">
                    View your previous and active orders.
                  </p>
                </div>

                <span className="option-arrow">→</span>
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Profile