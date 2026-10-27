import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../Context/useAuth'

const EMPTY_FORM = {
  label: 'Home',
  recipient_name: '',
  phone: '',
  address_line_1: '',
  address_line_2: '',
  landmark: '',
  city: '',
  state: '',
  postal_code: '',
}

function Addresses() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (user?.id) {
      loadAddresses()
    } else {
      setLoading(false)
    }
  }, [user?.id])

  async function loadAddresses() {
    setLoading(true)
    setError('')

    const { data, error: fetchError } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message || 'Unable to load your addresses.')
      setAddresses([])
    } else {
      setAddresses(data || [])
    }

    setLoading(false)
  }

  function openAddForm() {
    setEditingId(null)
    setForm({
      ...EMPTY_FORM,
      recipient_name: '',
      phone: '',
    })
    setMessage('')
    setError('')
    setShowForm(true)
  }

  function openEditForm(address) {
    setEditingId(address.id)
    setForm({
      label: address.label || 'Home',
      recipient_name: address.recipient_name || '',
      phone: address.phone || '',
      address_line_1: address.address_line_1 || '',
      address_line_2: address.address_line_2 || '',
      landmark: address.landmark || '',
      city: address.city || '',
      state: address.state || '',
      postal_code: address.postal_code || '',
    })
    setMessage('')
    setError('')
    setShowForm(true)
  }

  function closeForm() {
    if (saving) return
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function saveAddress(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    const requiredFields = [
      ['recipient_name', 'recipient name'],
      ['phone', 'phone number'],
      ['address_line_1', 'address'],
      ['city', 'city'],
      ['state', 'state'],
      ['postal_code', 'PIN code'],
    ]

    const missing = requiredFields.find(
      ([key]) => !String(form[key] || '').trim(),
    )

    if (missing) {
      setError(`Please enter your ${missing[1]}.`)
      return
    }

    if (!/^\d{10}$/.test(form.phone.trim())) {
      setError('Please enter a valid 10-digit phone number.')
      return
    }

    if (!/^\d{6}$/.test(form.postal_code.trim())) {
      setError('Please enter a valid 6-digit PIN code.')
      return
    }

    setSaving(true)

    const payload = {
      user_id: user.id,
      label: form.label.trim() || 'Home',
      recipient_name: form.recipient_name.trim(),
      phone: form.phone.trim(),
      address_line_1: form.address_line_1.trim(),
      address_line_2: form.address_line_2.trim() || null,
      landmark: form.landmark.trim() || null,
      city: form.city.trim(),
      state: form.state.trim(),
      postal_code: form.postal_code.trim(),
    }

    let result

    if (editingId) {
      result = await supabase
        .from('addresses')
        .update(payload)
        .eq('id', editingId)
        .eq('user_id', user.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from('addresses')
        .insert(payload)
        .select()
        .single()
    }

    if (result.error) {
      setError(result.error.message || 'Unable to save this address.')
      setSaving(false)
      return
    }

    const savedAddress = result.data

    setAddresses((current) => {
      if (editingId) {
        return current.map((item) =>
          item.id === editingId ? savedAddress : item,
        )
      }

      return [savedAddress, ...current]
    })

    setSaving(false)
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setMessage(editingId ? 'Address updated successfully.' : 'Address saved successfully.')
  }

  async function deleteAddress(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this saved address?',
    )

    if (!confirmed) return

    setDeletingId(id)
    setError('')
    setMessage('')

    const { error: deleteError } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      setError(deleteError.message || 'Unable to delete this address.')
      setDeletingId(null)
      return
    }

    setAddresses((current) => current.filter((item) => item.id !== id))
    setDeletingId(null)
    setMessage('Address deleted.')
  }

  const addressCountText = useMemo(() => {
    if (addresses.length === 0) return 'No saved addresses'
    return `${addresses.length} saved ${addresses.length === 1 ? 'address' : 'addresses'}`
  }, [addresses.length])

  if (!user) {
    return (
      <div className="address-page">
        <div className="address-empty">
          <div className="empty-icon">🔐</div>
          <h2>Sign in to manage addresses</h2>
          <p>Your saved delivery addresses will appear here.</p>
          <button className="primary-button" onClick={() => navigate('/login')}>
            Sign in
          </button>
        </div>
        <style>{styles}</style>
      </div>
    )
  }

  return (
    <div className="address-page">
      <header className="address-header">
        <div className="header-inner">
          <button className="brand" onClick={() => navigate('/')}>
            <span className="brand-mark">B</span>
            <span className="brand-name">blinkit</span>
          </button>

          <div className="header-title">
            <span className="eyebrow">YOUR ACCOUNT</span>
            <h1>Saved addresses</h1>
          </div>

          <button className="back-button" onClick={() => navigate('/profile')}>
            <span>←</span>
            <span>Profile</span>
          </button>
        </div>
      </header>

      <main className="address-main">
        <section className="page-intro">
          <div>
            <div className="intro-kicker">
              <span>📍</span>
              DELIVERY LOCATIONS
            </div>
            <h2>Where should we deliver?</h2>
            <p>
              Save your frequently used addresses for a faster checkout next
              time.
            </p>
          </div>

          <button className="add-button" onClick={openAddForm}>
            <span>+</span>
            Add new address
          </button>
        </section>

        {message && <div className="success-message">✓ {message}</div>}
        {error && <div className="error-message">! {error}</div>}

        <div className="address-content">
          <section className="address-list-card">
            <div className="section-heading">
              <div>
                <h3>Your addresses</h3>
                <span>{addressCountText}</span>
              </div>
              <div className="location-dot">⌖</div>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="spinner" />
                <p>Loading your addresses...</p>
              </div>
            ) : addresses.length === 0 ? (
              <div className="empty-addresses">
                <div className="empty-illustration">
                  <span>📍</span>
                  <i />
                  <i />
                  <i />
                </div>
                <h3>No saved addresses yet</h3>
                <p>
                  Add your home, work or any other delivery location to make
                  ordering quicker.
                </p>
                <button className="primary-button" onClick={openAddForm}>
                  <span>+</span>
                  Add your first address
                </button>
              </div>
            ) : (
              <div className="address-grid">
                {addresses.map((address, index) => (
                  <article className="address-card" key={address.id}>
                    <div className="address-card-top">
                      <div className="address-label">
                        <span className={`label-icon label-${(index % 3) + 1}`}>
                          {address.label?.toLowerCase() === 'work'
                            ? '💼'
                            : address.label?.toLowerCase() === 'other'
                              ? '📌'
                              : '🏠'}
                        </span>
                        <div>
                          <strong>{address.label || 'Home'}</strong>
                          {index === 0 && (
                            <span className="saved-badge">SAVED</span>
                          )}
                        </div>
                      </div>

                      <div className="card-actions">
                        <button
                          className="icon-button"
                          onClick={() => openEditForm(address)}
                          aria-label="Edit address"
                          title="Edit address"
                        >
                          ✎
                        </button>
                        <button
                          className="icon-button delete"
                          onClick={() => deleteAddress(address.id)}
                          disabled={deletingId === address.id}
                          aria-label="Delete address"
                          title="Delete address"
                        >
                          {deletingId === address.id ? '…' : '⌫'}
                        </button>
                      </div>
                    </div>

                    <div className="address-details">
                      <strong>{address.recipient_name}</strong>
                      <p>
                        {address.address_line_1}
                        {address.address_line_2
                          ? `, ${address.address_line_2}`
                          : ''}
                        {address.landmark ? `, ${address.landmark}` : ''}
                        {address.city ? `, ${address.city}` : ''}
                        {address.state ? `, ${address.state}` : ''}
                        {address.postal_code
                          ? ` - ${address.postal_code}`
                          : ''}
                      </p>
                      <span className="phone-line">☎ {address.phone}</span>
                    </div>

                    <div className="address-card-footer">
                      <span>Ready for checkout</span>
                      <span className="footer-check">✓</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="address-side">
            <div className="side-card delivery-card">
              <div className="side-icon">⚡</div>
              <h3>Faster checkout</h3>
              <p>
                Your saved addresses are ready whenever you place your next
                order.
              </p>
            </div>

            <div className="side-card privacy-card">
              <div className="side-icon">🔒</div>
              <div>
                <h3>Your details stay private</h3>
                <p>
                  Address information is used only to process and deliver your
                  orders.
                </p>
              </div>
            </div>

            <button className="continue-button" onClick={() => navigate('/')}>
              Continue shopping
              <span>→</span>
            </button>
          </aside>
        </div>
      </main>

      {showForm && (
        <div className="modal-backdrop" onMouseDown={closeForm}>
          <div
            className="address-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="modal-kicker">
                  {editingId ? 'UPDATE LOCATION' : 'NEW LOCATION'}
                </span>
                <h2>{editingId ? 'Edit address' : 'Add new address'}</h2>
              </div>
              <button className="modal-close" onClick={closeForm}>
                ×
              </button>
            </div>

            <form onSubmit={saveAddress}>
              <div className="label-selector">
                {['Home', 'Work', 'Other'].map((label) => (
                  <button
                    key={label}
                    type="button"
                    className={form.label === label ? 'selected' : ''}
                    onClick={() =>
                      setForm((current) => ({ ...current, label }))
                    }
                  >
                    <span>
                      {label === 'Home'
                        ? '🏠'
                        : label === 'Work'
                          ? '💼'
                          : '📌'}
                    </span>
                    {label}
                  </button>
                ))}
              </div>

              <div className="form-grid">
                <label>
                  <span>Recipient name *</span>
                  <input
                    name="recipient_name"
                    value={form.recipient_name}
                    onChange={updateField}
                    placeholder="e.g. Ashi Shrivastava"
                    autoComplete="name"
                  />
                </label>

                <label>
                  <span>Phone number *</span>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={updateField}
                    placeholder="10-digit mobile number"
                    inputMode="numeric"
                    maxLength={10}
                    autoComplete="tel"
                  />
                </label>

                <label className="full">
                  <span>Address *</span>
                  <input
                    name="address_line_1"
                    value={form.address_line_1}
                    onChange={updateField}
                    placeholder="House / flat / building and street"
                    autoComplete="street-address"
                  />
                </label>

                <label className="full">
                  <span>Apartment, floor, etc. <em>optional</em></span>
                  <input
                    name="address_line_2"
                    value={form.address_line_2}
                    onChange={updateField}
                    placeholder="Apartment, floor, block"
                  />
                </label>

                <label className="full">
                  <span>Landmark <em>optional</em></span>
                  <input
                    name="landmark"
                    value={form.landmark}
                    onChange={updateField}
                    placeholder="Near a landmark"
                  />
                </label>

                <label>
                  <span>City *</span>
                  <input
                    name="city"
                    value={form.city}
                    onChange={updateField}
                    placeholder="City"
                    autoComplete="address-level2"
                  />
                </label>

                <label>
                  <span>State *</span>
                  <input
                    name="state"
                    value={form.state}
                    onChange={updateField}
                    placeholder="State"
                    autoComplete="address-level1"
                  />
                </label>

                <label>
                  <span>PIN code *</span>
                  <input
                    name="postal_code"
                    value={form.postal_code}
                    onChange={updateField}
                    placeholder="6-digit PIN"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="postal-code"
                  />
                </label>
              </div>

              {error && <div className="form-error">! {error}</div>}

              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button className="primary-button" type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update address' : 'Save address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{styles}</style>
    </div>
  )
}

const styles = `
  * { box-sizing: border-box; }

  .address-page {
    min-height: 100vh;
    background:
      radial-gradient(circle at 10% 0%, rgba(38, 255, 138, .10), transparent 28%),
      radial-gradient(circle at 90% 8%, rgba(255, 214, 64, .12), transparent 25%),
      #f7f8f4;
    color: #17321f;
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .address-header {
    position: sticky;
    top: 0;
    z-index: 20;
    background: rgba(255,255,255,.94);
    border-bottom: 1px solid #e8ece7;
    backdrop-filter: blur(16px);
  }

  .header-inner {
    width: min(1180px, calc(100% - 32px));
    min-height: 78px;
    margin: auto;
    display: flex;
    align-items: center;
    gap: 28px;
  }

  .brand {
    border: 0;
    background: none;
    display: flex;
    align-items: center;
    gap: 9px;
    cursor: pointer;
    padding: 0;
  }

  .brand-mark {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    background: #0c9f4f;
    color: white;
    display: grid;
    place-items: center;
    font-size: 22px;
    font-weight: 900;
    box-shadow: 0 8px 20px rgba(12,159,79,.22);
  }

  .brand-name {
    color: #0b9d4c;
    font-size: 25px;
    font-weight: 900;
    letter-spacing: -1.5px;
  }

  .header-title {
    flex: 1;
    padding-left: 6px;
  }

  .eyebrow, .modal-kicker {
    display: block;
    color: #849188;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.2px;
  }

  .header-title h1 {
    margin: 2px 0 0;
    font-size: 22px;
    letter-spacing: -.6px;
  }

  .back-button {
    border: 1px solid #dfe6df;
    background: white;
    color: #263b2c;
    padding: 10px 14px;
    border-radius: 12px;
    font-weight: 750;
    cursor: pointer;
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .back-button:hover { border-color: #0ca653; color: #078d46; }

  .address-main {
    width: min(1180px, calc(100% - 32px));
    margin: auto;
    padding: 42px 0 70px;
  }

  .page-intro {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 30px;
    margin-bottom: 28px;
  }

  .intro-kicker {
    color: #0b9d4c;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 1px;
    display: flex;
    gap: 7px;
    align-items: center;
    margin-bottom: 8px;
  }

  .page-intro h2 {
    font-size: clamp(28px, 4vw, 42px);
    margin: 0;
    letter-spacing: -1.6px;
    line-height: 1.05;
  }

  .page-intro p {
    color: #718077;
    margin: 10px 0 0;
    max-width: 620px;
    line-height: 1.55;
  }

  button { font: inherit; }

  .add-button, .primary-button {
    border: 0;
    background: #0b9f4d;
    color: white;
    border-radius: 14px;
    padding: 13px 18px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 10px 24px rgba(11,159,77,.18);
    transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
  }

  .add-button {
    display: flex;
    gap: 8px;
    align-items: center;
    white-space: nowrap;
  }

  .add-button span { font-size: 22px; line-height: 12px; }

  .add-button:hover, .primary-button:hover {
    background: #078d45;
    transform: translateY(-2px);
    box-shadow: 0 14px 28px rgba(11,159,77,.25);
  }

  .success-message, .error-message {
    border-radius: 12px;
    padding: 12px 15px;
    margin-bottom: 18px;
    font-size: 13px;
    font-weight: 700;
  }

  .success-message { background: #eafaf0; color: #087a3d; border: 1px solid #c9efd8; }
  .error-message { background: #fff0ef; color: #b33b32; border: 1px solid #f3ceca; }

  .address-content {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: 22px;
    align-items: start;
  }

  .address-list-card, .side-card {
    background: rgba(255,255,255,.9);
    border: 1px solid #e7ebe6;
    border-radius: 22px;
    box-shadow: 0 12px 36px rgba(24,50,31,.06);
  }

  .address-list-card { padding: 25px; }

  .section-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .section-heading h3 { margin: 0 0 3px; font-size: 18px; }
  .section-heading span { color: #8a968e; font-size: 12px; }
  .location-dot {
    width: 38px; height: 38px; border-radius: 12px;
    background: #e9faef; color: #079649;
    display: grid; place-items: center; font-size: 20px;
  }

  .address-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0,1fr));
    gap: 15px;
  }

  .address-card {
    background: #fff;
    border: 1px solid #e6ebe6;
    border-radius: 18px;
    overflow: hidden;
    transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease;
  }

  .address-card:hover {
    transform: translateY(-3px);
    border-color: #b9e5c9;
    box-shadow: 0 14px 30px rgba(17,70,38,.09);
  }

  .address-card-top {
    padding: 17px 17px 13px;
    display: flex;
    justify-content: space-between;
    align-items: start;
  }

  .address-label { display: flex; gap: 10px; align-items: center; }
  .label-icon {
    width: 38px; height: 38px; border-radius: 12px;
    display: grid; place-items: center; font-size: 18px;
  }
  .label-1 { background: #e9f9ef; }
  .label-2 { background: #fff4d9; }
  .label-3 { background: #f1eaff; }

  .address-label strong { display: block; font-size: 14px; }
  .saved-badge {
    display: inline-block !important;
    margin-top: 4px;
    color: #078f46 !important;
    font-size: 8px !important;
    font-weight: 900 !important;
    letter-spacing: .7px;
  }

  .card-actions { display: flex; gap: 5px; }
  .icon-button {
    width: 32px; height: 32px; border-radius: 9px;
    border: 1px solid #e6ebe7; background: white; color: #5d6c63;
    cursor: pointer; display: grid; place-items: center;
  }
  .icon-button:hover { color: #078f46; border-color: #b8dfc7; background: #f4fff7; }
  .icon-button.delete:hover { color: #c13d35; border-color: #f0c8c4; background: #fff5f4; }
  .icon-button:disabled { opacity: .5; cursor: wait; }

  .address-details {
    padding: 0 17px 16px;
    min-height: 116px;
  }
  .address-details > strong { font-size: 13px; }
  .address-details p {
    margin: 6px 0 10px;
    color: #69776e;
    font-size: 12px;
    line-height: 1.55;
  }
  .phone-line { color: #526159; font-size: 11px; font-weight: 700; }

  .address-card-footer {
    border-top: 1px solid #eef1ee;
    padding: 11px 17px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #7c8981;
    font-size: 10px;
    font-weight: 700;
  }
  .footer-check { color: #0b9f4d; font-size: 15px; }

  .address-side { display: grid; gap: 14px; }
  .side-card { padding: 19px; }
  .side-icon {
    width: 42px; height: 42px; border-radius: 13px;
    display: grid; place-items: center; font-size: 21px;
    background: #effaf2; margin-bottom: 13px;
  }
  .side-card h3 { margin: 0 0 6px; font-size: 15px; }
  .side-card p { margin: 0; color: #78857c; font-size: 12px; line-height: 1.55; }

  .privacy-card { display: flex; gap: 13px; align-items: start; }
  .privacy-card .side-icon { flex: 0 0 auto; margin: 0; background: #fff7df; }

  .continue-button {
    border: 1px solid #dce5de; background: white; color: #173a24;
    border-radius: 15px; padding: 14px 16px; cursor: pointer;
    display: flex; justify-content: space-between; align-items: center;
    font-weight: 800;
  }
  .continue-button:hover { border-color: #9fd4af; color: #078f46; }

  .loading-state {
    min-height: 260px; display: grid; place-items: center; align-content: center;
    color: #849087; font-size: 13px; gap: 12px;
  }
  .spinner {
    width: 30px; height: 30px; border-radius: 50%;
    border: 3px solid #dff1e5; border-top-color: #0b9f4d;
    animation: spin .8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .empty-addresses {
    min-height: 360px; display: grid; place-items: center; align-content: center;
    text-align: center; padding: 30px;
  }
  .empty-illustration {
    width: 92px; height: 92px; border-radius: 30px;
    background: #eafaf0; position: relative; display: grid; place-items: center;
    margin-bottom: 18px;
  }
  .empty-illustration > span { font-size: 39px; position: relative; z-index: 2; }
  .empty-illustration i {
    position: absolute; width: 8px; height: 8px; border-radius: 50%;
    background: #ffd95b;
  }
  .empty-illustration i:nth-child(2) { top: 12px; right: 16px; }
  .empty-illustration i:nth-child(3) { bottom: 18px; left: 13px; background: #ff8ca3; }
  .empty-illustration i:nth-child(4) { bottom: 12px; right: 18px; background: #8f8cff; }
  .empty-addresses h3 { margin: 0; font-size: 18px; }
  .empty-addresses p { color: #7b877f; max-width: 430px; font-size: 13px; line-height: 1.6; }
  .empty-addresses .primary-button { margin-top: 5px; }

  .address-empty {
    min-height: 100vh; display: grid; place-items: center; align-content: center;
    text-align: center; padding: 30px;
  }
  .empty-icon { font-size: 50px; margin-bottom: 10px; }
  .address-empty h2 { margin: 0; }
  .address-empty p { color: #758178; margin: 8px 0 20px; }

  .modal-backdrop {
    position: fixed; inset: 0; z-index: 100;
    background: rgba(12, 28, 17, .55);
    backdrop-filter: blur(6px);
    padding: 20px;
    display: grid; place-items: center;
    animation: fadeIn .18s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .address-modal {
    width: min(650px, 100%);
    max-height: min(90vh, 760px);
    overflow: auto;
    background: white;
    border-radius: 25px;
    box-shadow: 0 30px 80px rgba(0,0,0,.24);
    animation: modalIn .22s ease;
  }
  @keyframes modalIn {
    from { opacity: 0; transform: translateY(12px) scale(.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .modal-header {
    padding: 23px 25px 18px;
    display: flex; justify-content: space-between; align-items: start;
    border-bottom: 1px solid #edf0ed;
  }
  .modal-header h2 { margin: 3px 0 0; font-size: 23px; letter-spacing: -.7px; }
  .modal-close {
    width: 35px; height: 35px; border-radius: 10px;
    border: 1px solid #e4e9e4; background: white; font-size: 23px;
    color: #617067; cursor: pointer;
  }

  .address-modal form { padding: 20px 25px 25px; }

  .label-selector {
    display: grid; grid-template-columns: repeat(3,1fr); gap: 8px;
    margin-bottom: 18px;
  }
  .label-selector button {
    border: 1px solid #e0e7e1; background: #fafcfb; border-radius: 12px;
    padding: 10px; cursor: pointer; color: #5e6d64; font-weight: 750;
  }
  .label-selector button span { margin-right: 6px; }
  .label-selector button.selected {
    border-color: #70c993; background: #ebfaf0; color: #078f46;
  }

  .form-grid {
    display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 13px;
  }
  .form-grid label { display: block; }
  .form-grid label.full { grid-column: 1 / -1; }
  .form-grid label > span {
    display: block; color: #435249; font-size: 11px; font-weight: 800;
    margin: 0 0 6px;
  }
  .form-grid em { color: #9ba49e; font-style: normal; font-weight: 500; }
  .form-grid input {
    width: 100%; border: 1px solid #dfe6df; background: #fbfcfb;
    border-radius: 11px; padding: 12px 13px; outline: none;
    color: #20362a; font-size: 13px;
  }
  .form-grid input:focus {
    border-color: #6ac58c; box-shadow: 0 0 0 3px rgba(11,159,77,.08);
    background: white;
  }

  .form-error {
    margin-top: 14px; background: #fff0ef; color: #b33b32;
    border: 1px solid #f3ceca; border-radius: 10px; padding: 10px 12px;
    font-size: 12px; font-weight: 700;
  }

  .modal-footer {
    display: flex; justify-content: flex-end; gap: 9px;
    margin-top: 20px; padding-top: 17px; border-top: 1px solid #edf0ed;
  }
  .secondary-button {
    border: 1px solid #dce4de; background: white; color: #5e6d64;
    border-radius: 12px; padding: 12px 17px; font-weight: 750; cursor: pointer;
  }
  .secondary-button:hover { background: #f7faf7; }
  .primary-button:disabled, .secondary-button:disabled { opacity: .6; cursor: not-allowed; transform: none; }

  @media (max-width: 900px) {
    .address-content { grid-template-columns: 1fr; }
    .address-side { grid-template-columns: repeat(2,minmax(0,1fr)); }
    .continue-button { grid-column: 1 / -1; }
  }

  @media (max-width: 680px) {
    .header-inner { width: min(100% - 22px, 1180px); min-height: 68px; gap: 12px; }
    .brand-name { display: none; }
    .header-title h1 { font-size: 18px; }
    .back-button { padding: 9px 11px; }
    .back-button span:last-child { display: none; }
    .address-main { width: min(100% - 22px, 1180px); padding-top: 28px; }
    .page-intro { display: block; }
    .page-intro h2 { font-size: 30px; }
    .add-button { margin-top: 18px; width: 100%; justify-content: center; }
    .address-list-card { padding: 16px; border-radius: 18px; }
    .address-grid { grid-template-columns: 1fr; }
    .address-side { grid-template-columns: 1fr; }
    .continue-button { grid-column: auto; }
    .form-grid { grid-template-columns: 1fr; }
    .form-grid label.full { grid-column: auto; }
    .address-modal { border-radius: 20px; }
    .modal-header, .address-modal form { padding-left: 17px; padding-right: 17px; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .01ms !important;
    }
  }
`

export default Addresses
