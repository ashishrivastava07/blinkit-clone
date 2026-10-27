import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const recentOrders = [
  {
    id: '#QC-58101102',
    customer: 'Rahul Sharma',
    items: 4,
    amount: 328,
    status: 'Preparing',
    time: '2 min ago',
  },
  {
    id: '#QC-58101091',
    customer: 'Priya Verma',
    items: 2,
    amount: 185,
    status: 'Ready',
    time: '8 min ago',
  },
  {
    id: '#QC-58101076',
    customer: 'Ananya Singh',
    items: 6,
    amount: 492,
    status: 'Accepted',
    time: '14 min ago',
  },
  {
    id: '#QC-58101051',
    customer: 'Aman Gupta',
    items: 3,
    amount: 219,
    status: 'Delivered',
    time: '22 min ago',
  },
]

const lowStockProducts = [
  {
    name: 'Fresh Tomatoes',
    variant: '500 g',
    stock: 4,
    category: 'Vegetables',
  },
  {
    name: 'Brown Bread',
    variant: '400 g',
    stock: 7,
    category: 'Bakery',
  },
  {
    name: 'Farm Eggs',
    variant: '6 pieces',
    stock: 14,
    category: 'Dairy',
  },
]

const navigationItems = [
  {
    label: 'Dashboard',
    icon: '▦',
    path: '/shopkeeper/dashboard',
  },
  {
    label: 'Orders',
    icon: '🧾',
    path: '/shopkeeper/orders',
  },
  {
    label: 'Products',
    icon: '🛍️',
    path: '/shopkeeper/products',
  },
  {
    label: 'Inventory',
    icon: '📦',
    path: '/shopkeeper/inventory',
  },
  {
    label: 'Settings',
    icon: '⚙️',
    path: '/shopkeeper/settings',
  },
]

export default function ShopkeeperDashboard() {
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [shopStatus, setShopStatus] = useState(true)

  const stats = [
    {
      title: "Today's Sales",
      value: '₹12,480',
      change: '+12.5%',
      icon: '₹',
      positive: true,
    },
    {
      title: "Today's Orders",
      value: '84',
      change: '+8.2%',
      icon: '🧾',
      positive: true,
    },
    {
      title: 'Pending Orders',
      value: '7',
      change: 'Needs attention',
      icon: '⏳',
      positive: false,
    },
    {
      title: 'Low Stock Items',
      value: '3',
      change: 'Restock needed',
      icon: '📦',
      positive: false,
    },
  ]

  function goTo(path) {
    setSidebarOpen(false)
    navigate(path)
  }

  return (
    <div className="shopkeeper-page">
      <style>{styles}</style>

      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          type="button"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`shopkeeper-sidebar ${
          sidebarOpen ? 'open' : ''
        }`}
      >
        <div className="sidebar-brand">
          <button
            type="button"
            className="brand-button"
            onClick={() => navigate('/')}
          >
            <span className="brand-icon">🛒</span>
            <span>Blinkit</span>
          </button>

          <button
            type="button"
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
          >
            ×
          </button>
        </div>

        <div className="shop-profile">
          <div className="shop-avatar">S</div>

          <div>
            <strong>My Grocery Store</strong>
            <small>Shopkeeper account</small>
          </div>
        </div>

        <nav className="sidebar-navigation">
          <span className="nav-heading">MENU</span>

          {navigationItems.map((item) => (
            <button
              key={item.path}
              type="button"
              className={`sidebar-link ${
                item.path === '/shopkeeper/dashboard'
                  ? 'active'
                  : ''
              }`}
              onClick={() => goTo(item.path)}
            >
              <span className="sidebar-link-icon">
                {item.icon}
              </span>

              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="shop-status-card">
            <div className="status-top">
              <span
                className={`status-dot ${
                  shopStatus ? 'online' : 'offline'
                }`}
              />

              <strong>
                {shopStatus ? 'Shop is Open' : 'Shop is Closed'}
              </strong>
            </div>

            <p>
              {shopStatus
                ? 'Customers can place orders.'
                : 'Customers cannot place orders.'}
            </p>

            <button
              type="button"
              onClick={() => setShopStatus((value) => !value)}
            >
              {shopStatus ? 'Close shop' : 'Open shop'}
            </button>
          </div>

          <button
            type="button"
            className="back-to-store"
            onClick={() => navigate('/')}
          >
            ← View customer store
          </button>
        </div>
      </aside>

      <div className="shopkeeper-content">
        <header className="shopkeeper-header">
          <button
            type="button"
            className="mobile-menu"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>

          <div>
            <h1>Dashboard</h1>
            <p>Here's what's happening with your store today.</p>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="notification-button"
              title="Notifications"
            >
              🔔
              <span />
            </button>

            <div className="header-avatar">S</div>
          </div>
        </header>

        <main className="dashboard-main">
          <div className="welcome-row">
            <div>
              <h2>Good morning 👋</h2>
              <p>Here's your store overview for today.</p>
            </div>

            <div
              className={`open-status ${
                shopStatus ? 'open' : 'closed'
              }`}
            >
              <span
                className={`status-dot ${
                  shopStatus ? 'online' : 'offline'
                }`}
              />

              {shopStatus ? 'Store Open' : 'Store Closed'}
            </div>
          </div>

          <section className="stats-grid">
            {stats.map((stat) => (
              <article className="stat-card" key={stat.title}>
                <div className="stat-top">
                  <div className="stat-icon">{stat.icon}</div>

                  <span
                    className={`stat-change ${
                      stat.positive ? 'positive' : 'attention'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>

                <div className="stat-value">{stat.value}</div>

                <div className="stat-title">{stat.title}</div>
              </article>
            ))}
          </section>

          <section className="dashboard-grid">
            <div className="orders-panel panel">
              <div className="panel-header">
                <div>
                  <h2>Recent Orders</h2>
                  <p>Latest orders received by your store</p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate('/shopkeeper/orders')
                  }
                >
                  View all →
                </button>
              </div>

              <div className="orders-table-wrapper">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Time</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <strong>{order.id}</strong>
                        </td>

                        <td>{order.customer}</td>

                        <td>{order.items}</td>

                        <td>
                          <strong>₹{order.amount}</strong>
                        </td>

                        <td>
                          <span
                            className={`order-status ${order.status
                              .toLowerCase()
                              .replace(' ', '-')}`}
                          >
                            {order.status}
                          </span>
                        </td>

                        <td className="order-time">
                          {order.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="stock-panel panel">
              <div className="panel-header">
                <div>
                  <h2>Low Stock</h2>
                  <p>Products that need restocking</p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate('/shopkeeper/inventory')
                  }
                >
                  Manage →
                </button>
              </div>

              <div className="stock-list">
                {lowStockProducts.map((product) => (
                  <div
                    className="stock-item"
                    key={`${product.name}-${product.variant}`}
                  >
                    <div className="stock-product-icon">
                      {product.category === 'Vegetables'
                        ? '🍅'
                        : product.category === 'Bakery'
                          ? '🍞'
                          : '🥚'}
                    </div>

                    <div className="stock-product-info">
                      <strong>{product.name}</strong>
                      <span>
                        {product.variant} · {product.category}
                      </span>
                    </div>

                    <div className="stock-number">
                      <strong>{product.stock}</strong>
                      <span>left</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="restock-button"
                onClick={() =>
                  navigate('/shopkeeper/inventory')
                }
              >
                + Update inventory
              </button>
            </div>
          </section>

          <section className="quick-actions-panel panel">
            <div className="panel-header">
              <div>
                <h2>Quick Actions</h2>
                <p>Frequently used store management actions</p>
              </div>
            </div>

            <div className="quick-actions">
              <button
                type="button"
                onClick={() =>
                  navigate('/shopkeeper/products')
                }
              >
                <span>➕</span>
                <div>
                  <strong>Add Product</strong>
                  <small>Add a new item to your catalogue</small>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate('/shopkeeper/inventory')
                }
              >
                <span>📦</span>
                <div>
                  <strong>Update Inventory</strong>
                  <small>Manage stock quantities</small>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate('/shopkeeper/orders')
                }
              >
                <span>🧾</span>
                <div>
                  <strong>Process Orders</strong>
                  <small>Accept and prepare orders</small>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate('/shopkeeper/settings')
                }
              >
                <span>⚙️</span>
                <div>
                  <strong>Store Settings</strong>
                  <small>Update store information</small>
                </div>
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .shopkeeper-page {
    min-height: 100vh;
    background: #f7f7f7;
    color: #222;
    font-family: Inter, Arial, sans-serif;
    display: flex;
  }

  .shopkeeper-sidebar {
    width: 250px;
    min-height: 100vh;
    background: #fff;
    border-right: 1px solid #e8e8e8;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    z-index: 100;
  }

  .sidebar-brand {
    height: 72px;
    padding: 0 18px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
  }

  .brand-button {
    border: 0;
    background: transparent;
    padding: 0;
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 21px;
    font-weight: 800;
    cursor: pointer;
  }

  .brand-icon {
    width: 39px;
    height: 39px;
    border-radius: 11px;
    display: grid;
    place-items: center;
    background: #f5d90a;
    font-size: 21px;
  }

  .mobile-close {
    display: none;
    margin-left: auto;
    border: 0;
    background: transparent;
    font-size: 25px;
    cursor: pointer;
  }

  .shop-profile {
    margin: 18px 14px;
    padding: 12px;
    background: #f7f7f7;
    border-radius: 11px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .shop-avatar,
  .header-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: #111;
    color: #fff;
    font-weight: 800;
    font-size: 14px;
    flex-shrink: 0;
  }

  .shop-profile div:last-child {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .shop-profile strong {
    font-size: 11px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .shop-profile small {
    color: #888;
    font-size: 9px;
  }

  .sidebar-navigation {
    padding: 0 12px;
  }

  .nav-heading {
    display: block;
    margin: 5px 10px 8px;
    color: #aaa;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 1px;
  }

  .sidebar-link {
    width: 100%;
    border: 0;
    background: transparent;
    border-radius: 9px;
    padding: 11px 10px;
    margin-bottom: 3px;
    display: flex;
    align-items: center;
    gap: 11px;
    color: #666;
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }

  .sidebar-link:hover {
    background: #f5f5f5;
    color: #222;
  }

  .sidebar-link.active {
    background: #111;
    color: #fff;
  }

  .sidebar-link-icon {
    width: 21px;
    text-align: center;
    font-size: 15px;
  }

  .sidebar-bottom {
    margin-top: auto;
    padding: 14px;
  }

  .shop-status-card {
    padding: 12px;
    border: 1px solid #e8e8e8;
    border-radius: 11px;
  }

  .status-top {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
    background: #bbb;
    flex-shrink: 0;
  }

  .status-dot.online {
    background: #20a04b;
  }

  .status-dot.offline {
    background: #c62828;
  }

  .status-top strong {
    font-size: 10px;
  }

  .shop-status-card p {
    margin: 7px 0;
    color: #888;
    font-size: 9px;
    line-height: 1.4;
  }

  .shop-status-card button {
    border: 0;
    background: #f1f1f1;
    border-radius: 6px;
    padding: 7px 9px;
    cursor: pointer;
    font-size: 9px;
    font-weight: 700;
  }

  .back-to-store {
    width: 100%;
    border: 0;
    background: transparent;
    margin-top: 12px;
    padding: 7px;
    color: #777;
    cursor: pointer;
    font-size: 9px;
  }

  .shopkeeper-content {
    width: calc(100% - 250px);
    margin-left: 250px;
    min-width: 0;
  }

  .shopkeeper-header {
    height: 72px;
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    padding: 0 28px;
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .shopkeeper-header h1 {
    margin: 0;
    font-size: 21px;
    letter-spacing: -.5px;
  }

  .shopkeeper-header p {
    margin: 4px 0 0;
    color: #888;
    font-size: 10px;
  }

  .header-actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 13px;
  }

  .notification-button {
    position: relative;
    width: 35px;
    height: 35px;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
  }

  .notification-button span {
    position: absolute;
    right: 6px;
    top: 5px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #c62828;
  }

  .mobile-menu {
    display: none;
    border: 0;
    background: transparent;
    font-size: 22px;
    cursor: pointer;
  }

  .dashboard-main {
    max-width: 1400px;
    margin: 0 auto;
    padding: 28px;
  }

  .welcome-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 20px;
  }

  .welcome-row h2 {
    margin: 0;
    font-size: 22px;
  }

  .welcome-row p {
    margin: 5px 0 0;
    color: #888;
    font-size: 11px;
  }

  .open-status {
    padding: 9px 12px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 10px;
    font-weight: 700;
  }

  .open-status.open {
    background: #e8f7ed;
    color: #16823a;
  }

  .open-status.closed {
    background: #fdeaea;
    color: #b00020;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 13px;
    margin-bottom: 18px;
  }

  .stat-card {
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 13px;
    padding: 17px;
  }

  .stat-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stat-icon {
    width: 36px;
    height: 36px;
    border-radius: 9px;
    background: #f5f5f5;
    display: grid;
    place-items: center;
    font-size: 16px;
    font-weight: 800;
  }

  .stat-change {
    padding: 5px 7px;
    border-radius: 5px;
    font-size: 8px;
    font-weight: 700;
  }

  .stat-change.positive {
    background: #e8f7ed;
    color: #16823a;
  }

  .stat-change.attention {
    background: #fff4dc;
    color: #946500;
  }

  .stat-value {
    margin-top: 17px;
    font-size: 25px;
    font-weight: 800;
    letter-spacing: -.5px;
  }

  .stat-title {
    margin-top: 3px;
    color: #777;
    font-size: 10px;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.65fr) minmax(300px, .75fr);
    gap: 18px;
    margin-bottom: 18px;
  }

  .panel {
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 14px;
    padding: 18px;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 15px;
    margin-bottom: 17px;
  }

  .panel-header h2 {
    margin: 0;
    font-size: 15px;
  }

  .panel-header p {
    margin: 4px 0 0;
    color: #888;
    font-size: 9px;
  }

  .panel-header button {
    border: 0;
    background: transparent;
    color: #333;
    cursor: pointer;
    font-size: 10px;
    font-weight: 800;
  }

  .orders-table-wrapper {
    overflow-x: auto;
  }

  .orders-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 650px;
  }

  .orders-table th {
    text-align: left;
    padding: 9px 7px;
    border-bottom: 1px solid #eee;
    color: #999;
    font-size: 8px;
    font-weight: 700;
  }

  .orders-table td {
    padding: 12px 7px;
    border-bottom: 1px solid #f2f2f2;
    color: #555;
    font-size: 9px;
  }

  .orders-table td strong {
    color: #222;
  }

  .order-status {
    display: inline-block;
    padding: 5px 7px;
    border-radius: 5px;
    background: #f3f3f3;
    color: #555;
    font-size: 8px;
    font-weight: 700;
  }

  .order-status.preparing {
    background: #fff4dc;
    color: #946500;
  }

  .order-status.ready {
    background: #e8f7ed;
    color: #16823a;
  }

  .order-status.accepted {
    background: #eef3ff;
    color: #315ca8;
  }

  .order-status.delivered {
    background: #f0f0f0;
    color: #555;
  }

  .order-time {
    color: #999 !important;
    white-space: nowrap;
  }

  .stock-list {
    display: flex;
    flex-direction: column;
  }

  .stock-item {
    padding: 11px 0;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .stock-product-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: #f6f6f6;
    display: grid;
    place-items: center;
    font-size: 20px;
    flex-shrink: 0;
  }

  .stock-product-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stock-product-info strong {
    font-size: 10px;
  }

  .stock-product-info span {
    color: #888;
    font-size: 8px;
  }

  .stock-number {
    text-align: right;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .stock-number strong {
    color: #b00020;
    font-size: 14px;
  }

  .stock-number span {
    color: #999;
    font-size: 8px;
  }

  .restock-button {
    width: 100%;
    margin-top: 14px;
    height: 36px;
    border: 1px solid #ddd;
    background: #fff;
    border-radius: 7px;
    cursor: pointer;
    font-size: 10px;
    font-weight: 800;
  }

  .restock-button:hover {
    background: #f7f7f7;
  }

  .quick-actions-panel {
    margin-bottom: 20px;
  }

  .quick-actions {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  .quick-actions button {
    border: 1px solid #e8e8e8;
    background: #fff;
    border-radius: 10px;
    padding: 13px;
    display: flex;
    align-items: center;
    gap: 10px;
    text-align: left;
    cursor: pointer;
  }

  .quick-actions button:hover {
    background: #f8f8f8;
  }

  .quick-actions button > span {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background: #f5f5f5;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .quick-actions button div {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .quick-actions strong {
    font-size: 10px;
  }

  .quick-actions small {
    color: #888;
    font-size: 8px;
    line-height: 1.3;
  }

  .sidebar-overlay {
    display: none;
  }

  @media (max-width: 1100px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .dashboard-grid {
      grid-template-columns: 1fr;
    }

    .quick-actions {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 760px) {
    .shopkeeper-sidebar {
      transform: translateX(-100%);
      transition: transform .2s ease;
    }

    .shopkeeper-sidebar.open {
      transform: translateX(0);
    }

    .mobile-close {
      display: block;
    }

    .sidebar-overlay {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 90;
      border: 0;
      background: rgba(0,0,0,.35);
    }

    .shopkeeper-content {
      width: 100%;
      margin-left: 0;
    }

    .mobile-menu {
      display: block;
    }

    .shopkeeper-header {
      padding: 0 16px;
    }

    .dashboard-main {
      padding: 20px 14px;
    }

    .welcome-row {
      align-items: flex-start;
    }

    .stats-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 500px) {
    .shopkeeper-header p {
      display: none;
    }

    .header-avatar {
      width: 32px;
      height: 32px;
    }

    .notification-button {
      width: 32px;
      height: 32px;
    }

    .stats-grid {
      gap: 8px;
    }

    .stat-card {
      padding: 12px;
    }

    .stat-value {
      font-size: 21px;
    }

    .quick-actions {
      grid-template-columns: 1fr;
    }

    .open-status {
      font-size: 8px;
      padding: 7px 9px;
    }
  }
`