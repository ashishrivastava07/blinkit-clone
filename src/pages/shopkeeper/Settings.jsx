import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../Context/useAuth'

const initialNotifications = {
  newOrders: true,
  lowStock: true,
  orderUpdates: true,
  customerMessages: false,
}

function Settings() {
  const { user } = useAuth()

  const [shopId, setShopId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const [settings, setSettings] = useState({
    shopName: '',
    description: '',
    address: '',
    phone: '',
  })

  const [notifications, setNotifications] = useState(
    initialNotifications,
  )

  const [activeSection, setActiveSection] = useState('store')

  useEffect(() => {
    loadShop()
  }, [user])

  const loadShop = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data: membership, error: membershipError } = await supabase
        .from('shop_members')
        .select('shop_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()

      if (membershipError) {
        throw membershipError
      }

      if (!membership) {
        throw new Error('No shop is associated with your account.')
      }

      setShopId(membership.shop_id)

      const { data: shop, error: shopError } = await supabase
        .from('shops')
        .select('id, name, description, address, phone')
        .eq('id', membership.shop_id)
        .single()

      if (shopError) {
        throw shopError
      }

      setSettings({
        shopName: shop.name || '',
        description: shop.description || '',
        address: shop.address || '',
        phone: shop.phone || '',
      })
    } catch (err) {
      console.error('Failed to load shop:', err)
      setError(err.message || 'Failed to load shop details.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setSettings((current) => ({
      ...current,
      [name]: value,
    }))

    setSaved(false)
    setError('')
  }

  const handleNotificationChange = (name) => {
    setNotifications((current) => ({
      ...current,
      [name]: !current[name],
    }))
  }

  const handleSave = async () => {
    if (!shopId) {
      setError('Shop information is not available.')
      return
    }

    if (!settings.shopName.trim()) {
      setError('Store name is required.')
      return
    }

    setSaving(true)
    setSaved(false)
    setError('')

    try {
      const { error: updateError } = await supabase.rpc(
        'update_shop_details',
        {
          p_shop_id: shopId,
          p_name: settings.shopName.trim(),
          p_description: settings.description.trim(),
          p_address: settings.address.trim(),
          p_phone: settings.phone.trim(),
        },
      )

      if (updateError) {
        throw updateError
      }

      setSaved(true)

      setTimeout(() => {
        setSaved(false)
      }, 3000)
    } catch (err) {
      console.error('Failed to save shop:', err)
      setError(err.message || 'Failed to save shop details.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="shopkeeper-loading">
        <style>{`
          .shopkeeper-loading {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f7f7f7;
            font-family: Arial, Helvetica, sans-serif;
            color: #555;
          }

          .loading-card {
            background: white;
            border: 1px solid #e8e8e8;
            border-radius: 14px;
            padding: 30px 40px;
            text-align: center;
          }

          .loading-icon {
            font-size: 30px;
            margin-bottom: 10px;
          }

          .loading-text {
            margin: 0;
            font-size: 14px;
          }
        `}</style>

        <div className="loading-card">
          <div className="loading-icon">⚙️</div>
          <p className="loading-text">Loading shop settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="shopkeeper-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .shopkeeper-page {
          min-height: 100vh;
          background: #f7f7f7;
          color: #1f1f1f;
          font-family: Arial, Helvetica, sans-serif;
        }

        .shopkeeper-layout {
          min-height: 100vh;
          display: flex;
        }

        .shopkeeper-sidebar {
          width: 250px;
          background: #ffffff;
          border-right: 1px solid #e8e8e8;
          padding: 24px 16px;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          z-index: 10;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 12px 28px;
        }

        .brand-logo {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #0c831f;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 20px;
        }

        .brand-name {
          font-size: 22px;
          font-weight: 800;
          color: #0c831f;
        }

        .sidebar-label {
          padding: 0 12px;
          margin: 0 0 10px;
          color: #999;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.7px;
        }

        .nav-list {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .nav-item {
          width: 100%;
          border: 0;
          background: transparent;
          border-radius: 10px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #555;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          text-align: left;
        }

        .nav-item:hover {
          background: #f4f8f4;
          color: #0c831f;
        }

        .nav-item.active {
          background: #eaf7ec;
          color: #0c831f;
        }

        .nav-icon {
          width: 22px;
          text-align: center;
          font-size: 17px;
        }

        .sidebar-bottom {
          position: absolute;
          left: 16px;
          right: 16px;
          bottom: 22px;
          border-top: 1px solid #eee;
          padding-top: 18px;
        }

        .store-mini {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
        }

        .store-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #eaf7ec;
          color: #0c831f;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .store-mini-text {
          min-width: 0;
        }

        .store-mini-name {
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .store-mini-role {
          margin-top: 3px;
          color: #999;
          font-size: 11px;
        }

        .main-content {
          width: calc(100% - 250px);
          margin-left: 250px;
          padding: 30px 34px 50px;
        }

        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 26px;
        }

        .page-title {
          margin: 0;
          font-size: 28px;
          font-weight: 800;
        }

        .page-subtitle {
          margin: 7px 0 0;
          color: #777;
          font-size: 14px;
        }

        .save-button {
          border: 0;
          background: #0c831f;
          color: white;
          border-radius: 9px;
          padding: 12px 22px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          min-width: 125px;
        }

        .save-button:hover:not(:disabled) {
          background: #096b19;
        }

        .save-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .save-button.saved {
          background: #167c2a;
        }

        .error-message {
          margin-bottom: 20px;
          padding: 13px 15px;
          border: 1px solid #f0caca;
          background: #fff5f5;
          color: #a33;
          border-radius: 9px;
          font-size: 13px;
        }

        .settings-layout {
          display: grid;
          grid-template-columns: 230px minmax(0, 1fr);
          gap: 22px;
          align-items: start;
        }

        .settings-menu {
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 14px;
          padding: 8px;
        }

        .settings-menu-button {
          width: 100%;
          border: 0;
          background: transparent;
          border-radius: 9px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          text-align: left;
          cursor: pointer;
          color: #555;
          font-size: 13px;
          font-weight: 600;
        }

        .settings-menu-button:hover {
          background: #f5f5f5;
        }

        .settings-menu-button.active {
          background: #eaf7ec;
          color: #0c831f;
        }

        .settings-panel {
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 14px;
          padding: 25px;
        }

        .panel-heading {
          margin-bottom: 24px;
        }

        .panel-title {
          margin: 0;
          font-size: 19px;
          font-weight: 800;
        }

        .panel-description {
          margin: 6px 0 0;
          color: #888;
          font-size: 13px;
          line-height: 1.5;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .form-group.full {
          grid-column: 1 / -1;
        }

        .form-label {
          font-size: 12px;
          font-weight: 700;
          color: #444;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          border: 1px solid #ddd;
          border-radius: 9px;
          padding: 11px 12px;
          font-family: inherit;
          font-size: 13px;
          color: #222;
          outline: none;
          background: white;
        }

        .form-input:focus,
        .form-textarea:focus {
          border-color: #0c831f;
          box-shadow: 0 0 0 3px rgba(12, 131, 31, 0.08);
        }

        .form-textarea {
          min-height: 100px;
          resize: vertical;
        }

        .field-help {
          color: #999;
          font-size: 11px;
        }

        .section-divider {
          height: 1px;
          background: #eee;
          margin: 26px 0;
        }

        .notification-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .notification-row {
          padding: 15px 4px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          border-bottom: 1px solid #f0f0f0;
        }

        .notification-row:last-child {
          border-bottom: 0;
        }

        .notification-title {
          margin: 0;
          font-size: 13px;
          font-weight: 700;
        }

        .notification-description {
          margin: 4px 0 0;
          color: #999;
          font-size: 11px;
        }

        .toggle {
          width: 43px;
          height: 24px;
          border: 0;
          padding: 2px;
          border-radius: 20px;
          background: #d5d5d5;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.2s ease;
        }

        .toggle.on {
          background: #0c831f;
        }

        .toggle-knob {
          display: block;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: transform 0.2s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        .toggle.on .toggle-knob {
          transform: translateX(19px);
        }

        .hours-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .info-card {
          padding: 17px;
          border: 1px solid #e5eee5;
          background: #f7faf7;
          border-radius: 11px;
        }

        .info-title {
          margin: 0 0 5px;
          font-size: 13px;
          font-weight: 800;
        }

        .info-text {
          margin: 0;
          color: #888;
          font-size: 12px;
          line-height: 1.5;
        }

        .danger-zone {
          border: 1px solid #f0dada;
          background: #fffafa;
          border-radius: 11px;
          padding: 17px;
        }

        .danger-title {
          margin: 0 0 5px;
          font-size: 14px;
          font-weight: 800;
          color: #a33;
        }

        .danger-text {
          margin: 0;
          color: #888;
          font-size: 12px;
          line-height: 1.5;
        }

        .disabled-button {
          margin-top: 14px;
          border: 1px solid #e5caca;
          background: white;
          color: #a33;
          border-radius: 8px;
          padding: 9px 13px;
          font-size: 12px;
          font-weight: 700;
          cursor: not-allowed;
          opacity: 0.7;
        }

        @media (max-width: 900px) {
          .shopkeeper-sidebar {
            width: 205px;
          }

          .main-content {
            width: calc(100% - 205px);
            margin-left: 205px;
            padding: 25px 20px 40px;
          }

          .settings-layout {
            grid-template-columns: 1fr;
          }

          .settings-menu {
            display: flex;
            overflow-x: auto;
            gap: 5px;
          }

          .settings-menu-button {
            min-width: 150px;
          }
        }

        @media (max-width: 700px) {
          .shopkeeper-sidebar {
            position: static;
            width: 100%;
            min-height: auto;
            padding: 14px;
            border-right: 0;
            border-bottom: 1px solid #e8e8e8;
          }

          .shopkeeper-layout {
            display: block;
          }

          .brand {
            padding-bottom: 15px;
          }

          .nav-list {
            flex-direction: row;
            overflow-x: auto;
          }

          .nav-item {
            min-width: max-content;
          }

          .sidebar-label,
          .sidebar-bottom {
            display: none;
          }

          .main-content {
            width: 100%;
            margin-left: 0;
            padding: 20px 14px 35px;
          }

          .page-header {
            flex-direction: column;
          }

          .save-button {
            width: 100%;
          }

          .form-grid,
          .hours-grid {
            grid-template-columns: 1fr;
          }

          .form-group.full {
            grid-column: auto;
          }

          .settings-panel {
            padding: 18px;
          }
        }
      `}</style>

      <div className="shopkeeper-layout">
        <aside className="shopkeeper-sidebar">
          <div className="brand">
            <div className="brand-logo">B</div>
            <div className="brand-name">blinkit</div>
          </div>

          <div className="sidebar-label">Shop Management</div>

          <nav className="nav-list">
            <button
              className="nav-item"
              onClick={() => {
                window.location.href = '/shopkeeper/dashboard'
              }}
            >
              <span className="nav-icon">▦</span>
              Dashboard
            </button>

            <button
              className="nav-item"
              onClick={() => {
                window.location.href = '/shopkeeper/orders'
              }}
            >
              <span className="nav-icon">▤</span>
              Orders
            </button>

            <button
              className="nav-item"
              onClick={() => {
                window.location.href = '/shopkeeper/products'
              }}
            >
              <span className="nav-icon">▣</span>
              Products
            </button>

            <button
              className="nav-item"
              onClick={() => {
                window.location.href = '/shopkeeper/inventory'
              }}
            >
              <span className="nav-icon">▥</span>
              Inventory
            </button>

            <button
              className="nav-item active"
              onClick={() => setActiveSection('store')}
            >
              <span className="nav-icon">⚙</span>
              Settings
            </button>
          </nav>

          <div className="sidebar-bottom">
            <div className="store-mini">
              <div className="store-avatar">S</div>

              <div className="store-mini-text">
                <div className="store-mini-name">
                  {settings.shopName || 'Shopkeeper'}
                </div>
                <div className="store-mini-role">Store Manager</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="main-content">
          <header className="page-header">
            <div>
              <h1 className="page-title">Settings</h1>
              <p className="page-subtitle">
                Manage your store information, operating hours and
                notifications.
              </p>
            </div>

            <button
              className={`save-button ${saved ? 'saved' : ''}`}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
            </button>
          </header>

          {error && <div className="error-message">{error}</div>}

          <div className="settings-layout">
            <div className="settings-menu">
              <button
                className={`settings-menu-button ${
                  activeSection === 'store' ? 'active' : ''
                }`}
                onClick={() => setActiveSection('store')}
              >
                🏪 Store Information
              </button>

              <button
                className={`settings-menu-button ${
                  activeSection === 'hours' ? 'active' : ''
                }`}
                onClick={() => setActiveSection('hours')}
              >
                🕐 Operating Hours
              </button>

              <button
                className={`settings-menu-button ${
                  activeSection === 'notifications' ? 'active' : ''
                }`}
                onClick={() => setActiveSection('notifications')}
              >
                🔔 Notifications
              </button>

              <button
                className={`settings-menu-button ${
                  activeSection === 'account' ? 'active' : ''
                }`}
                onClick={() => setActiveSection('account')}
              >
                👤 Account
              </button>
            </div>

            <section className="settings-panel">
              {activeSection === 'store' && (
                <>
                  <div className="panel-heading">
                    <h2 className="panel-title">Store Information</h2>
                    <p className="panel-description">
                      These details are loaded directly from your Supabase
                      store record.
                    </p>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label" htmlFor="shopName">
                        Store Name
                      </label>

                      <input
                        id="shopName"
                        name="shopName"
                        className="form-input"
                        value={settings.shopName}
                        onChange={handleChange}
                        placeholder="Enter store name"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="phone">
                        Store Phone
                      </label>

                      <input
                        id="phone"
                        name="phone"
                        className="form-input"
                        value={settings.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div className="form-group full">
                      <label className="form-label" htmlFor="description">
                        Store Description
                      </label>

                      <textarea
                        id="description"
                        name="description"
                        className="form-textarea"
                        value={settings.description}
                        onChange={handleChange}
                        placeholder="Describe your store"
                      />
                    </div>

                    <div className="form-group full">
                      <label className="form-label" htmlFor="address">
                        Store Address
                      </label>

                      <textarea
                        id="address"
                        name="address"
                        className="form-textarea"
                        value={settings.address}
                        onChange={handleChange}
                        placeholder="Enter complete store address"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeSection === 'hours' && (
                <>
                  <div className="panel-heading">
                    <h2 className="panel-title">Operating Hours</h2>
                    <p className="panel-description">
                      Operating-hour storage will be connected to the
                      backend in a later step.
                    </p>
                  </div>

                  <div className="hours-grid">
                    <div className="form-group">
                      <label className="form-label" htmlFor="openingTime">
                        Opening Time
                      </label>

                      <input
                        id="openingTime"
                        type="time"
                        className="form-input"
                        defaultValue="08:00"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="closingTime">
                        Closing Time
                      </label>

                      <input
                        id="closingTime"
                        type="time"
                        className="form-input"
                        defaultValue="22:00"
                      />
                    </div>
                  </div>

                  <div className="section-divider" />

                  <div className="info-card">
                    <h3 className="info-title">
                      Backend integration pending
                    </h3>

                    <p className="info-text">
                      The current database foundation does not include
                      operating-hour columns on the shop record. We'll add
                      this when we finalize the store configuration model.
                    </p>
                  </div>
                </>
              )}

              {activeSection === 'notifications' && (
                <>
                  <div className="panel-heading">
                    <h2 className="panel-title">Notifications</h2>
                    <p className="panel-description">
                      These preferences currently live in the browser. We
                      will connect them to persistent notification settings
                      later.
                    </p>
                  </div>

                  <div className="notification-list">
                    <div className="notification-row">
                      <div>
                        <p className="notification-title">New Orders</p>
                        <p className="notification-description">
                          Get notified whenever a new customer order arrives.
                        </p>
                      </div>

                      <button
                        className={`toggle ${
                          notifications.newOrders ? 'on' : ''
                        }`}
                        onClick={() =>
                          handleNotificationChange('newOrders')
                        }
                      >
                        <span className="toggle-knob" />
                      </button>
                    </div>

                    <div className="notification-row">
                      <div>
                        <p className="notification-title">Low Stock Alerts</p>
                        <p className="notification-description">
                          Receive an alert when product inventory becomes low.
                        </p>
                      </div>

                      <button
                        className={`toggle ${
                          notifications.lowStock ? 'on' : ''
                        }`}
                        onClick={() =>
                          handleNotificationChange('lowStock')
                        }
                      >
                        <span className="toggle-knob" />
                      </button>
                    </div>

                    <div className="notification-row">
                      <div>
                        <p className="notification-title">Order Updates</p>
                        <p className="notification-description">
                          Receive updates when order statuses change.
                        </p>
                      </div>

                      <button
                        className={`toggle ${
                          notifications.orderUpdates ? 'on' : ''
                        }`}
                        onClick={() =>
                          handleNotificationChange('orderUpdates')
                        }
                      >
                        <span className="toggle-knob" />
                      </button>
                    </div>

                    <div className="notification-row">
                      <div>
                        <p className="notification-title">
                          Customer Messages
                        </p>
                        <p className="notification-description">
                          Receive notifications about customer messages.
                        </p>
                      </div>

                      <button
                        className={`toggle ${
                          notifications.customerMessages ? 'on' : ''
                        }`}
                        onClick={() =>
                          handleNotificationChange('customerMessages')
                        }
                      >
                        <span className="toggle-knob" />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeSection === 'account' && (
                <>
                  <div className="panel-heading">
                    <h2 className="panel-title">Account</h2>
                    <p className="panel-description">
                      Information about the account currently managing this
                      store.
                    </p>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Account Email</label>

                      <input
                        className="form-input"
                        value={user?.email || ''}
                        readOnly
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Account Role</label>

                      <input
                        className="form-input"
                        value="Shopkeeper"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="section-divider" />

                  <div className="danger-zone">
                    <h3 className="danger-title">Danger Zone</h3>

                    <p className="danger-text">
                      Store deactivation and account management will be
                      handled through the admin/backend workflow.
                    </p>

                    <button className="disabled-button" disabled>
                      Deactivate Store
                    </button>
                  </div>
                </>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Settings