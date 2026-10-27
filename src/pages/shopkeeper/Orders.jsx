import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const demoOrders = [
  {
    id: '#QC-58101102',
    customer: 'Rahul Sharma',
    phone: '9876543210',
    address: 'House 24, Vijay Nagar, Indore - 452010',
    createdAt: '2 min ago',
    status: 'preparing',
    payment: 'COD',
    total: 328,
    items: [
      { name: 'Amul Taaza Milk', variant: '1 L', quantity: 2, price: 56 },
      { name: 'Farm Fresh Bananas', variant: '1 kg', quantity: 1, price: 72 },
      { name: 'Brown Bread', variant: '400 g', quantity: 1, price: 45 },
    ],
  },
  {
    id: '#QC-58101091',
    customer: 'Priya Verma',
    phone: '9826012345',
    address: 'Flat 302, Scheme No. 54, Indore - 452010',
    createdAt: '8 min ago',
    status: 'ready',
    payment: 'UPI',
    total: 185,
    items: [
      { name: 'Farm Eggs', variant: '6 pieces', quantity: 1, price: 55 },
      { name: 'Coca-Cola', variant: '2.25 L', quantity: 1, price: 89 },
    ],
  },
  {
    id: '#QC-58101076',
    customer: 'Ananya Singh',
    phone: '9755012345',
    address: '14 Saket Nagar, Indore - 452018',
    createdAt: '14 min ago',
    status: 'accepted',
    payment: 'COD',
    total: 492,
    items: [
      { name: 'Amul Taaza Milk', variant: '1 L', quantity: 2, price: 56 },
      { name: 'Farm Fresh Bananas', variant: '1 kg', quantity: 2, price: 72 },
      { name: 'Tata Salt', variant: '1 kg', quantity: 1, price: 28 },
      { name: 'Coca-Cola', variant: '750 ml', quantity: 1, price: 40 },
    ],
  },
  {
    id: '#QC-58101051',
    customer: 'Aman Gupta',
    phone: '9987654321',
    address: 'Bengali Square, Indore - 452016',
    createdAt: '22 min ago',
    status: 'delivered',
    payment: 'UPI',
    total: 219,
    items: [
      { name: "Lay's Classic Salted", variant: '52 g', quantity: 2, price: 20 },
      { name: 'Brown Bread', variant: '400 g', quantity: 1, price: 45 },
      { name: 'Fresh Tomatoes', variant: '500 g', quantity: 4, price: 29 },
    ],
  },
  {
    id: '#QC-58101032',
    customer: 'Neha Patel',
    phone: '9812345678',
    address: 'Rau Main Road, Indore - 453331',
    createdAt: '31 min ago',
    status: 'placed',
    payment: 'COD',
    total: 154,
    items: [
      { name: 'Farm Eggs', variant: '6 pieces', quantity: 1, price: 55 },
      { name: 'Tata Salt', variant: '1 kg', quantity: 1, price: 28 },
      { name: 'Fresh Tomatoes', variant: '500 g', quantity: 1, price: 29 },
    ],
  },
]

const statusInfo = {
  placed: {
    label: 'New',
    className: 'new',
  },
  accepted: {
    label: 'Accepted',
    className: 'accepted',
  },
  preparing: {
    label: 'Preparing',
    className: 'preparing',
  },
  ready: {
    label: 'Ready',
    className: 'ready',
  },
  delivered: {
    label: 'Delivered',
    className: 'delivered',
  },
  rejected: {
    label: 'Rejected',
    className: 'rejected',
  },
}

const statusOrder = [
  'placed',
  'accepted',
  'preparing',
  'ready',
  'delivered',
]

export default function ShopkeeperOrders() {
  const navigate = useNavigate()

  const [orders, setOrders] = useState(demoOrders)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase()

    return orders.filter((order) => {
      const matchesFilter =
        filter === 'all' || order.status === filter

      const matchesSearch =
        !query ||
        order.id.toLowerCase().includes(query) ||
        order.customer.toLowerCase().includes(query) ||
        order.phone.includes(query)

      return matchesFilter && matchesSearch
    })
  }, [orders, filter, search])

  const counts = useMemo(() => {
    return {
      all: orders.length,
      placed: orders.filter((order) => order.status === 'placed').length,
      accepted: orders.filter((order) => order.status === 'accepted').length,
      preparing: orders.filter((order) => order.status === 'preparing').length,
      ready: orders.filter((order) => order.status === 'ready').length,
    }
  }, [orders])

  function updateOrderStatus(orderId, nextStatus) {
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? { ...order, status: nextStatus }
          : order,
      ),
    )

    setSelectedOrder((current) =>
      current?.id === orderId
        ? { ...current, status: nextStatus }
        : current,
    )
  }

  function acceptOrder(order) {
    updateOrderStatus(order.id, 'accepted')
  }

  function rejectOrder(order) {
    updateOrderStatus(order.id, 'rejected')
  }

  function moveToNextStatus(order) {
    const currentIndex = statusOrder.indexOf(order.status)

    if (
      currentIndex >= 0 &&
      currentIndex < statusOrder.length - 1
    ) {
      updateOrderStatus(
        order.id,
        statusOrder[currentIndex + 1],
      )
    }
  }

  function statusButtonText(status) {
    if (status === 'placed') return 'Accept Order'
    if (status === 'accepted') return 'Start Preparing'
    if (status === 'preparing') return 'Mark Ready'
    if (status === 'ready') return 'Ready for Pickup'
    if (status === 'delivered') return 'Delivered'

    return 'Update'
  }

  function goTo(path) {
    setSidebarOpen(false)
    navigate(path)
  }

  return (
    <div className="shop-orders-page">
      <style>{styles}</style>

      {sidebarOpen && (
        <button
          type="button"
          className="orders-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`orders-sidebar ${
          sidebarOpen ? 'open' : ''
        }`}
      >
        <div className="orders-brand">
          <button
            type="button"
            onClick={() => navigate('/')}
          >
            <span>🛒</span>
            Blinkit
          </button>

          <button
            type="button"
            className="close-sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            ×
          </button>
        </div>

        <div className="orders-shop">
          <div className="orders-avatar">S</div>

          <div>
            <strong>My Grocery Store</strong>
            <small>Shopkeeper account</small>
          </div>
        </div>

        <nav className="orders-nav">
          <span>MENU</span>

          <button
            type="button"
            onClick={() => goTo('/shopkeeper/dashboard')}
          >
            <b>▦</b>
            Dashboard
          </button>

          <button
            type="button"
            className="active"
            onClick={() => goTo('/shopkeeper/orders')}
          >
            <b>🧾</b>
            Orders
            {counts.placed > 0 && (
              <em>{counts.placed}</em>
            )}
          </button>

          <button
            type="button"
            onClick={() => goTo('/shopkeeper/products')}
          >
            <b>🛍️</b>
            Products
          </button>

          <button
            type="button"
            onClick={() => goTo('/shopkeeper/inventory')}
          >
            <b>📦</b>
            Inventory
          </button>

          <button
            type="button"
            onClick={() => goTo('/shopkeeper/settings')}
          >
            <b>⚙️</b>
            Settings
          </button>
        </nav>

        <div className="orders-sidebar-bottom">
          <button
            type="button"
            onClick={() => navigate('/')}
          >
            ← View customer store
          </button>
        </div>
      </aside>

      <div className="orders-content">
        <header className="orders-header">
          <button
            type="button"
            className="open-sidebar"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>

          <div>
            <h1>Orders</h1>
            <p>Manage incoming and active customer orders.</p>
          </div>

          <div className="orders-header-right">
            <button type="button">🔔</button>
            <div>S</div>
          </div>
        </header>

        <main className="orders-main">
          <div className="orders-top">
            <div>
              <h2>Order Management</h2>
              <p>
                Accept, prepare and manage your customer orders.
              </p>
            </div>

            <div className="live-indicator">
              <span />
              Live orders
            </div>
          </div>

          <div className="order-stat-strip">
            <button
              type="button"
              className={filter === 'all' ? 'selected' : ''}
              onClick={() => setFilter('all')}
            >
              <strong>{counts.all}</strong>
              <span>All orders</span>
            </button>

            <button
              type="button"
              className={filter === 'placed' ? 'selected' : ''}
              onClick={() => setFilter('placed')}
            >
              <strong>{counts.placed}</strong>
              <span>New</span>
            </button>

            <button
              type="button"
              className={
                filter === 'accepted' ? 'selected' : ''
              }
              onClick={() => setFilter('accepted')}
            >
              <strong>{counts.accepted}</strong>
              <span>Accepted</span>
            </button>

            <button
              type="button"
              className={
                filter === 'preparing' ? 'selected' : ''
              }
              onClick={() => setFilter('preparing')}
            >
              <strong>{counts.preparing}</strong>
              <span>Preparing</span>
            </button>

            <button
              type="button"
              className={filter === 'ready' ? 'selected' : ''}
              onClick={() => setFilter('ready')}
            >
              <strong>{counts.ready}</strong>
              <span>Ready</span>
            </button>
          </div>

          <div className="orders-toolbar">
            <div className="order-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search by order ID, customer or phone..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value)
              }
            >
              <option value="all">All statuses</option>
              <option value="placed">New</option>
              <option value="accepted">Accepted</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <section className="orders-list">
            {filteredOrders.length === 0 ? (
              <div className="orders-empty">
                <div>🧾</div>
                <h3>No orders found</h3>
                <p>
                  Try changing your search or status filter.
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const status =
                  statusInfo[order.status] ||
                  statusInfo.placed

                return (
                  <article
                    className="order-card"
                    key={order.id}
                  >
                    <div className="order-card-main">
                      <div className="order-card-heading">
                        <div>
                          <div className="order-id-row">
                            <strong>{order.id}</strong>

                            <span
                              className={`status ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </div>

                          <p>
                            {order.customer} · {order.createdAt}
                          </p>
                        </div>

                        <strong className="order-amount">
                          ₹{order.total}
                        </strong>
                      </div>

                      <div className="order-meta">
                        <span>
                          📦 {order.items.length}{' '}
                          {order.items.length === 1
                            ? 'item'
                            : 'items'}
                        </span>

                        <span>
                          💳 {order.payment}
                        </span>

                        <span>
                          📍 {order.address}
                        </span>
                      </div>

                      <div className="order-card-bottom">
                        <div className="order-preview">
                          {order.items
                            .slice(0, 3)
                            .map((item) => (
                              <span key={`${order.id}-${item.name}`}>
                                {item.name} × {item.quantity}
                              </span>
                            ))}

                          {order.items.length > 3 && (
                            <span>
                              +{order.items.length - 3} more
                            </span>
                          )}
                        </div>

                        <div className="order-actions">
                          <button
                            type="button"
                            className="details-button"
                            onClick={() =>
                              setSelectedOrder(order)
                            }
                          >
                            View details
                          </button>

                          {order.status === 'placed' && (
                            <>
                              <button
                                type="button"
                                className="reject-button"
                                onClick={() =>
                                  rejectOrder(order)
                                }
                              >
                                Reject
                              </button>

                              <button
                                type="button"
                                className="primary-order-button"
                                onClick={() =>
                                  acceptOrder(order)
                                }
                              >
                                Accept
                              </button>
                            </>
                          )}

                          {order.status !== 'placed' &&
                            order.status !== 'delivered' &&
                            order.status !== 'rejected' && (
                              <button
                                type="button"
                                className="primary-order-button"
                                onClick={() =>
                                  moveToNextStatus(order)
                                }
                              >
                                {statusButtonText(
                                  order.status,
                                )}
                              </button>
                            )}
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })
            )}
          </section>
        </main>
      </div>

      {selectedOrder && (
        <div className="order-modal-backdrop">
          <div className="order-modal">
            <div className="modal-header">
              <div>
                <div className="modal-order-id">
                  {selectedOrder.id}
                </div>

                <h2>Order details</h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-status">
              <span
                className={`status ${
                  statusInfo[selectedOrder.status]?.className ||
                  ''
                }`}
              >
                {statusInfo[selectedOrder.status]?.label ||
                  selectedOrder.status}
              </span>

              <span>{selectedOrder.createdAt}</span>
            </div>

            <div className="modal-section">
              <h3>Customer</h3>

              <div className="customer-box">
                <strong>{selectedOrder.customer}</strong>
                <span>📞 {selectedOrder.phone}</span>
                <span>📍 {selectedOrder.address}</span>
              </div>
            </div>

            <div className="modal-section">
              <h3>Items</h3>

              <div className="modal-items">
                {selectedOrder.items.map((item) => (
                  <div
                    className="modal-item"
                    key={`${selectedOrder.id}-${item.name}-${item.variant}`}
                  >
                    <div>
                      <strong>{item.name}</strong>
                      <span>
                        {item.variant} × {item.quantity}
                      </span>
                    </div>

                    <strong>
                      ₹{item.price * item.quantity}
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-section">
              <h3>Payment</h3>

              <div className="payment-row">
                <span>Payment method</span>
                <strong>{selectedOrder.payment}</strong>
              </div>

              <div className="payment-row">
                <span>Order total</span>
                <strong>₹{selectedOrder.total}</strong>
              </div>
            </div>

            <div className="modal-actions">
              {selectedOrder.status === 'placed' && (
                <>
                  <button
                    type="button"
                    className="reject-button"
                    onClick={() =>
                      rejectOrder(selectedOrder)
                    }
                  >
                    Reject Order
                  </button>

                  <button
                    type="button"
                    className="primary-order-button"
                    onClick={() =>
                      acceptOrder(selectedOrder)
                    }
                  >
                    Accept Order
                  </button>
                </>
              )}

              {selectedOrder.status !== 'placed' &&
                selectedOrder.status !== 'delivered' &&
                selectedOrder.status !== 'rejected' && (
                  <button
                    type="button"
                    className="primary-order-button"
                    onClick={() =>
                      moveToNextStatus(selectedOrder)
                    }
                  >
                    {statusButtonText(selectedOrder.status)}
                  </button>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .shop-orders-page {
    min-height: 100vh;
    background: #f7f7f7;
    color: #222;
    font-family: Inter, Arial, sans-serif;
  }

  .orders-sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    width: 250px;
    background: #fff;
    border-right: 1px solid #e8e8e8;
    z-index: 100;
    display: flex;
    flex-direction: column;
  }

  .orders-brand {
    height: 72px;
    padding: 0 18px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
  }

  .orders-brand > button:first-child {
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

  .orders-brand > button:first-child span {
    width: 39px;
    height: 39px;
    border-radius: 11px;
    background: #f5d90a;
    display: grid;
    place-items: center;
  }

  .close-sidebar {
    display: none;
    margin-left: auto;
    border: 0;
    background: transparent;
    font-size: 24px;
    cursor: pointer;
  }

  .orders-shop {
    margin: 18px 14px;
    padding: 12px;
    border-radius: 11px;
    background: #f7f7f7;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .orders-avatar {
    width: 38px;
    height: 38px;
    flex-shrink: 0;
    border-radius: 50%;
    background: #111;
    color: #fff;
    display: grid;
    place-items: center;
    font-size: 13px;
    font-weight: 800;
  }

  .orders-shop > div:last-child {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .orders-shop strong {
    font-size: 11px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .orders-shop small {
    color: #888;
    font-size: 9px;
  }

  .orders-nav {
    padding: 0 12px;
  }

  .orders-nav > span {
    display: block;
    margin: 6px 10px 9px;
    color: #aaa;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 1px;
  }

  .orders-nav button {
    width: 100%;
    min-height: 40px;
    margin-bottom: 3px;
    border: 0;
    border-radius: 9px;
    background: transparent;
    color: #666;
    padding: 10px;
    display: flex;
    align-items: center;
    gap: 11px;
    text-align: left;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
  }

  .orders-nav button:hover {
    background: #f5f5f5;
    color: #222;
  }

  .orders-nav button.active {
    background: #111;
    color: #fff;
  }

  .orders-nav b {
    width: 21px;
    text-align: center;
    font-size: 14px;
  }

  .orders-nav em {
    margin-left: auto;
    min-width: 19px;
    height: 19px;
    border-radius: 50%;
    background: #f5d90a;
    color: #111;
    display: grid;
    place-items: center;
    font-size: 9px;
    font-style: normal;
    font-weight: 800;
  }

  .orders-sidebar-bottom {
    margin-top: auto;
    padding: 14px;
  }

  .orders-sidebar-bottom button {
    width: 100%;
    border: 0;
    background: transparent;
    color: #777;
    padding: 8px;
    cursor: pointer;
    font-size: 9px;
  }

  .orders-content {
    width: calc(100% - 250px);
    margin-left: 250px;
    min-width: 0;
  }

  .orders-header {
    height: 72px;
    padding: 0 28px;
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .orders-header h1 {
    margin: 0;
    font-size: 21px;
  }

  .orders-header p {
    margin: 4px 0 0;
    color: #888;
    font-size: 10px;
  }

  .open-sidebar {
    display: none;
    border: 0;
    background: transparent;
    font-size: 22px;
    cursor: pointer;
  }

  .orders-header-right {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .orders-header-right > button {
    width: 35px;
    height: 35px;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
  }

  .orders-header-right > div {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background: #111;
    color: #fff;
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 800;
  }

  .orders-main {
    max-width: 1400px;
    margin: 0 auto;
    padding: 28px;
  }

  .orders-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 20px;
  }

  .orders-top h2 {
    margin: 0;
    font-size: 22px;
  }

  .orders-top p {
    margin: 5px 0 0;
    color: #888;
    font-size: 11px;
  }

  .live-indicator {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 8px 10px;
    border-radius: 7px;
    background: #e8f7ed;
    color: #16823a;
    font-size: 9px;
    font-weight: 700;
  }

  .live-indicator span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #20a04b;
  }

  .order-stat-strip {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 9px;
    margin-bottom: 14px;
  }

  .order-stat-strip button {
    border: 1px solid #e8e8e8;
    border-radius: 11px;
    background: #fff;
    padding: 13px;
    text-align: left;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .order-stat-strip button:hover,
  .order-stat-strip button.selected {
    border-color: #222;
  }

  .order-stat-strip strong {
    font-size: 20px;
  }

  .order-stat-strip span {
    color: #888;
    font-size: 9px;
  }

  .orders-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }

  .order-search {
    flex: 1;
    height: 43px;
    border: 1px solid #e1e1e1;
    border-radius: 9px;
    background: #fff;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
  }

  .order-search span {
    color: #888;
    font-size: 18px;
  }

  .order-search input {
    width: 100%;
    border: 0;
    outline: none;
    background: transparent;
    font-size: 11px;
  }

  .orders-toolbar select {
    height: 43px;
    border: 1px solid #e1e1e1;
    border-radius: 9px;
    background: #fff;
    padding: 0 12px;
    font-size: 10px;
    outline: none;
  }

  .orders-list {
    display: flex;
    flex-direction: column;
    gap: 9px;
  }

  .order-card {
    background: #fff;
    border: 1px solid #e7e7e7;
    border-radius: 13px;
    overflow: hidden;
  }

  .order-card-main {
    padding: 16px;
  }

  .order-card-heading {
    display: flex;
    justify-content: space-between;
    gap: 15px;
  }

  .order-id-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .order-id-row > strong {
    font-size: 12px;
  }

  .order-card-heading p {
    margin: 6px 0 0;
    color: #888;
    font-size: 9px;
  }

  .order-amount {
    font-size: 15px;
  }

  .status {
    display: inline-flex;
    padding: 5px 7px;
    border-radius: 5px;
    font-size: 8px;
    font-weight: 800;
  }

  .status.new {
    background: #fff4dc;
    color: #946500;
  }

  .status.accepted {
    background: #eef3ff;
    color: #315ca8;
  }

  .status.preparing {
    background: #fff4dc;
    color: #946500;
  }

  .status.ready {
    background: #e8f7ed;
    color: #16823a;
  }

  .status.delivered {
    background: #f0f0f0;
    color: #555;
  }

  .status.rejected {
    background: #fdeaea;
    color: #b00020;
  }

  .order-meta {
    margin-top: 13px;
    padding: 10px;
    border-radius: 8px;
    background: #f8f8f8;
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
  }

  .order-meta span {
    color: #666;
    font-size: 9px;
  }

  .order-card-bottom {
    margin-top: 13px;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
  }

  .order-preview {
    min-width: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .order-preview span {
    padding: 5px 7px;
    border-radius: 5px;
    background: #f4f4f4;
    color: #666;
    font-size: 8px;
  }

  .order-actions {
    display: flex;
    align-items: center;
    gap: 7px;
    flex-shrink: 0;
  }

  .order-actions button,
  .modal-actions button {
    height: 32px;
    border-radius: 7px;
    padding: 0 10px;
    border: 0;
    cursor: pointer;
    font-size: 9px;
    font-weight: 800;
  }

  .details-button {
    background: #f2f2f2;
    color: #333;
  }

  .primary-order-button {
    background: #111;
    color: #fff;
  }

  .reject-button {
    background: #fdeaea;
    color: #b00020;
  }

  .orders-empty {
    background: #fff;
    border: 1px solid #e7e7e7;
    border-radius: 14px;
    padding: 70px 20px;
    text-align: center;
  }

  .orders-empty > div {
    font-size: 45px;
  }

  .orders-empty h3 {
    margin: 12px 0 5px;
    font-size: 16px;
  }

  .orders-empty p {
    margin: 0;
    color: #888;
    font-size: 10px;
  }

  .order-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: rgba(0, 0, 0, .45);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .order-modal {
    width: 100%;
    max-width: 570px;
    max-height: 90vh;
    overflow-y: auto;
    background: #fff;
    border-radius: 16px;
    padding: 22px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, .2);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    gap: 15px;
  }

  .modal-order-id {
    color: #777;
    font-size: 10px;
    font-weight: 700;
  }

  .modal-header h2 {
    margin: 5px 0 0;
    font-size: 20px;
  }

  .modal-header > button {
    width: 32px;
    height: 32px;
    border: 0;
    background: #f2f2f2;
    border-radius: 7px;
    font-size: 20px;
    cursor: pointer;
  }

  .modal-status {
    margin-top: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .modal-status > span:last-child {
    color: #888;
    font-size: 9px;
  }

  .modal-section {
    margin-top: 22px;
  }

  .modal-section h3 {
    margin: 0 0 10px;
    font-size: 12px;
  }

  .customer-box {
    padding: 12px;
    border-radius: 9px;
    background: #f7f7f7;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .customer-box strong {
    font-size: 11px;
  }

  .customer-box span {
    color: #666;
    font-size: 9px;
  }

  .modal-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .modal-item {
    padding: 10px;
    border: 1px solid #eee;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    gap: 15px;
  }

  .modal-item > div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .modal-item strong {
    font-size: 10px;
  }

  .modal-item span {
    color: #888;
    font-size: 9px;
  }

  .payment-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
    font-size: 10px;
  }

  .payment-row span {
    color: #777;
  }

  .modal-actions {
    margin-top: 22px;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .orders-overlay {
    display: none;
  }

  @media (max-width: 1050px) {
    .order-stat-strip {
      grid-template-columns: repeat(3, 1fr);
    }

    .order-stat-strip button:nth-child(4),
    .order-stat-strip button:nth-child(5) {
      display: none;
    }
  }

  @media (max-width: 760px) {
    .orders-sidebar {
      transform: translateX(-100%);
      transition: transform .2s ease;
    }

    .orders-sidebar.open {
      transform: translateX(0);
    }

    .close-sidebar {
      display: block;
    }

    .orders-overlay {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 90;
      border: 0;
      background: rgba(0, 0, 0, .35);
    }

    .orders-content {
      width: 100%;
      margin-left: 0;
    }

    .open-sidebar {
      display: block;
    }

    .orders-header {
      padding: 0 16px;
    }

    .orders-main {
      padding: 20px 14px 60px;
    }

    .order-card-bottom {
      align-items: flex-start;
      flex-direction: column;
    }

    .order-actions {
      width: 100%;
    }

    .order-actions button {
      flex: 1;
    }
  }

  @media (max-width: 520px) {
    .orders-header p {
      display: none;
    }

    .orders-header-right > button {
      display: none;
    }

    .orders-top {
      align-items: flex-start;
    }

    .orders-top h2 {
      font-size: 18px;
    }

    .order-stat-strip {
      grid-template-columns: repeat(2, 1fr);
    }

    .orders-toolbar {
      flex-direction: column;
    }

    .order-search,
    .orders-toolbar select {
      width: 100%;
    }

    .order-card-main {
      padding: 13px;
    }

    .order-card-heading {
      align-items: flex-start;
    }

    .order-id-row {
      flex-wrap: wrap;
    }

    .order-meta {
      flex-direction: column;
      gap: 7px;
    }

    .order-actions {
      flex-wrap: wrap;
    }

    .order-actions button {
      flex: 1 1 auto;
    }

    .order-modal-backdrop {
      padding: 10px;
    }

    .order-modal {
      padding: 17px;
    }
  }
`