import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const initialInventory = [
  {
    id: 'v1',
    product: 'Amul Taaza Milk',
    variant: '500 ml',
    category: 'Dairy',
    stock: 18,
    threshold: 5,
    unit: 'pack',
    price: 29,
  },
  {
    id: 'v2',
    product: 'Amul Taaza Milk',
    variant: '1 L',
    category: 'Dairy',
    stock: 12,
    threshold: 5,
    unit: 'pack',
    price: 56,
  },
  {
    id: 'v3',
    product: 'Farm Fresh Bananas',
    variant: '500 g',
    category: 'Fruits',
    stock: 20,
    threshold: 5,
    unit: 'pack',
    price: 38,
  },
  {
    id: 'v4',
    product: 'Farm Fresh Bananas',
    variant: '1 kg',
    category: 'Fruits',
    stock: 9,
    threshold: 5,
    unit: 'pack',
    price: 72,
  },
  {
    id: 'v5',
    product: 'Brown Bread',
    variant: '400 g',
    category: 'Bakery',
    stock: 7,
    threshold: 5,
    unit: 'pack',
    price: 45,
  },
  {
    id: 'v6',
    product: 'Farm Eggs',
    variant: '6 pieces',
    category: 'Dairy',
    stock: 14,
    threshold: 5,
    unit: 'pack',
    price: 55,
  },
  {
    id: 'v7',
    product: 'Farm Eggs',
    variant: '12 pieces',
    category: 'Dairy',
    stock: 0,
    threshold: 5,
    unit: 'pack',
    price: 105,
  },
  {
    id: 'v8',
    product: "Lay's Classic Salted",
    variant: '52 g',
    category: 'Snacks',
    stock: 25,
    threshold: 5,
    unit: 'pack',
    price: 20,
  },
  {
    id: 'v9',
    product: 'Tata Salt',
    variant: '1 kg',
    category: 'Essentials',
    stock: 16,
    threshold: 5,
    unit: 'pack',
    price: 28,
  },
  {
    id: 'v10',
    product: 'Coca-Cola',
    variant: '750 ml',
    category: 'Beverages',
    stock: 11,
    threshold: 5,
    unit: 'bottle',
    price: 40,
  },
  {
    id: 'v11',
    product: 'Coca-Cola',
    variant: '2.25 L',
    category: 'Beverages',
    stock: 5,
    threshold: 5,
    unit: 'bottle',
    price: 89,
  },
  {
    id: 'v12',
    product: 'Fresh Tomatoes',
    variant: '500 g',
    category: 'Vegetables',
    stock: 4,
    threshold: 5,
    unit: 'pack',
    price: 29,
  },
  {
    id: 'v13',
    product: 'Fresh Tomatoes',
    variant: '1 kg',
    category: 'Vegetables',
    stock: 0,
    threshold: 5,
    unit: 'pack',
    price: 55,
  },
]

const categories = [
  'All',
  'Dairy',
  'Fruits',
  'Vegetables',
  'Snacks',
  'Beverages',
  'Bakery',
  'Essentials',
]

export default function ShopkeeperInventory() {
  const navigate = useNavigate()

  const [inventory, setInventory] = useState(initialInventory)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [stockFilter, setStockFilter] = useState('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [quantity, setQuantity] = useState('')

  const counts = useMemo(() => {
    const total = inventory.length

    const outOfStock = inventory.filter(
      (item) => item.stock === 0,
    ).length

    const lowStock = inventory.filter(
      (item) =>
        item.stock > 0 && item.stock <= item.threshold,
    ).length

    const healthy = inventory.filter(
      (item) => item.stock > item.threshold,
    ).length

    return {
      total,
      outOfStock,
      lowStock,
      healthy,
    }
  }, [inventory])

  const filteredInventory = useMemo(() => {
    const query = search.trim().toLowerCase()

    return inventory.filter((item) => {
      const matchesSearch =
        !query ||
        item.product.toLowerCase().includes(query) ||
        item.variant.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)

      const matchesCategory =
        category === 'All' || item.category === category

      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'out' && item.stock === 0) ||
        (stockFilter === 'low' &&
          item.stock > 0 &&
          item.stock <= item.threshold) ||
        (stockFilter === 'healthy' &&
          item.stock > item.threshold)

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStock
      )
    })
  }, [inventory, search, category, stockFilter])

  function getStockStatus(item) {
    if (item.stock === 0) {
      return {
        label: 'Out of stock',
        className: 'out',
      }
    }

    if (item.stock <= item.threshold) {
      return {
        label: 'Low stock',
        className: 'low',
      }
    }

    return {
      label: 'Healthy',
      className: 'healthy',
    }
  }

  function openUpdate(item) {
    setEditingItem(item)
    setQuantity(String(item.stock))
  }

  function closeUpdate() {
    setEditingItem(null)
    setQuantity('')
  }

  function saveQuantity(event) {
    event.preventDefault()

    const nextStock = Math.max(
      0,
      Number.parseInt(quantity, 10) || 0,
    )

    setInventory((current) =>
      current.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              stock: nextStock,
            }
          : item,
      ),
    )

    closeUpdate()
  }

  function changeStock(itemId, amount) {
    setInventory((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              stock: Math.max(0, item.stock + amount),
            }
          : item,
      ),
    )
  }

  function goTo(path) {
    setSidebarOpen(false)
    navigate(path)
  }

  return (
    <div className="inventory-page">
      <style>{styles}</style>

      {sidebarOpen && (
        <button
          type="button"
          className="inventory-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`inventory-sidebar ${
          sidebarOpen ? 'open' : ''
        }`}
      >
        <div className="inventory-brand">
          <button
            type="button"
            onClick={() => navigate('/')}
          >
            <span>🛒</span>
            Blinkit
          </button>

          <button
            type="button"
            className="close-inventory-sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            ×
          </button>
        </div>

        <div className="inventory-shop">
          <div className="inventory-avatar">S</div>

          <div>
            <strong>My Grocery Store</strong>
            <small>Shopkeeper account</small>
          </div>
        </div>

        <nav className="inventory-nav">
          <span>MENU</span>

          <button
            type="button"
            onClick={() =>
              goTo('/shopkeeper/dashboard')
            }
          >
            <b>▦</b>
            Dashboard
          </button>

          <button
            type="button"
            onClick={() =>
              goTo('/shopkeeper/orders')
            }
          >
            <b>🧾</b>
            Orders
          </button>

          <button
            type="button"
            onClick={() =>
              goTo('/shopkeeper/products')
            }
          >
            <b>🛍️</b>
            Products
          </button>

          <button
            type="button"
            className="active"
            onClick={() =>
              goTo('/shopkeeper/inventory')
            }
          >
            <b>📦</b>
            Inventory
          </button>

          <button
            type="button"
            onClick={() =>
              goTo('/shopkeeper/settings')
            }
          >
            <b>⚙️</b>
            Settings
          </button>
        </nav>

        <div className="inventory-sidebar-bottom">
          <button
            type="button"
            onClick={() => navigate('/')}
          >
            ← View customer store
          </button>
        </div>
      </aside>

      <div className="inventory-content">
        <header className="inventory-header">
          <button
            type="button"
            className="open-inventory-sidebar"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>

          <div>
            <h1>Inventory</h1>
            <p>Monitor and update your store stock.</p>
          </div>

          <div className="inventory-header-right">
            <button type="button">🔔</button>
            <div>S</div>
          </div>
        </header>

        <main className="inventory-main">
          <div className="inventory-top">
            <div>
              <h2>Inventory Management</h2>
              <p>
                Keep your stock levels accurate and avoid
                stockouts.
              </p>
            </div>

            <button
              type="button"
              className="products-link"
              onClick={() =>
                navigate('/shopkeeper/products')
              }
            >
              Manage products →
            </button>
          </div>

          <section className="inventory-stats">
            <button
              type="button"
              className={
                stockFilter === 'all' ? 'selected' : ''
              }
              onClick={() => setStockFilter('all')}
            >
              <span className="inventory-stat-icon">
                📦
              </span>

              <div>
                <strong>{counts.total}</strong>
                <small>Total variants</small>
              </div>
            </button>

            <button
              type="button"
              className={
                stockFilter === 'healthy' ? 'selected' : ''
              }
              onClick={() => setStockFilter('healthy')}
            >
              <span className="inventory-stat-icon healthy-icon">
                ✓
              </span>

              <div>
                <strong>{counts.healthy}</strong>
                <small>Healthy stock</small>
              </div>
            </button>

            <button
              type="button"
              className={
                stockFilter === 'low' ? 'selected' : ''
              }
              onClick={() => setStockFilter('low')}
            >
              <span className="inventory-stat-icon low-icon">
                !
              </span>

              <div>
                <strong>{counts.lowStock}</strong>
                <small>Low stock</small>
              </div>
            </button>

            <button
              type="button"
              className={
                stockFilter === 'out' ? 'selected' : ''
              }
              onClick={() => setStockFilter('out')}
            >
              <span className="inventory-stat-icon out-icon">
                ×
              </span>

              <div>
                <strong>{counts.outOfStock}</strong>
                <small>Out of stock</small>
              </div>
            </button>
          </section>

          <div className="inventory-toolbar">
            <div className="inventory-search">
              <span>⌕</span>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search product or variant..."
              />
            </div>

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === 'All'
                    ? 'All categories'
                    : item}
                </option>
              ))}
            </select>
          </div>

          <section className="inventory-table-card">
            <div className="inventory-table-heading">
              <div>
                <h3>Stock Overview</h3>
                <p>
                  Showing {filteredInventory.length} of{' '}
                  {inventory.length} variants
                </p>
              </div>

              <span className="inventory-sync">
                ● Inventory system active
              </span>
            </div>

            <div className="inventory-table-wrapper">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Threshold</th>
                    <th>Status</th>
                    <th>Update</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredInventory.map((item) => {
                    const status = getStockStatus(item)

                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="inventory-product">
                            <div className="inventory-product-icon">
                              {item.category ===
                              'Dairy'
                                ? item.product
                                    .toLowerCase()
                                    .includes('egg')
                                  ? '🥚'
                                  : '🥛'
                                : item.category ===
                                    'Fruits'
                                  ? '🍌'
                                  : item.category ===
                                      'Vegetables'
                                    ? '🍅'
                                    : item.category ===
                                        'Bakery'
                                      ? '🍞'
                                      : item.category ===
                                          'Beverages'
                                        ? '🥤'
                                        : item.category ===
                                            'Snacks'
                                          ? '🥔'
                                          : '🧂'}
                            </div>

                            <div>
                              <strong>
                                {item.product}
                              </strong>
                              <span>{item.variant}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="category-pill">
                            {item.category}
                          </span>
                        </td>

                        <td>
                          <strong>₹{item.price}</strong>
                        </td>

                        <td>
                          <div className="stock-control">
                            <button
                              type="button"
                              onClick={() =>
                                changeStock(item.id, -1)
                              }
                              disabled={item.stock === 0}
                            >
                              −
                            </button>

                            <strong>
                              {item.stock}
                            </strong>

                            <button
                              type="button"
                              onClick={() =>
                                changeStock(item.id, 1)
                              }
                            >
                              +
                            </button>
                          </div>
                        </td>

                        <td>
                          <span className="threshold">
                            {item.threshold}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`stock-status ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="update-stock-button"
                            onClick={() =>
                              openUpdate(item)
                            }
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {filteredInventory.length === 0 && (
                <div className="inventory-empty">
                  <div>📦</div>
                  <h3>No inventory found</h3>
                  <p>
                    Try another search, category or stock
                    filter.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="inventory-alert">
            <div className="alert-icon">⚠️</div>

            <div>
              <strong>
                {counts.outOfStock + counts.lowStock}{' '}
                variants need attention
              </strong>

              <p>
                {counts.outOfStock} out of stock and{' '}
                {counts.lowStock} running low. Update your
                inventory to avoid missed orders.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStockFilter('out')}
            >
              View out-of-stock
            </button>
          </section>
        </main>
      </div>

      {editingItem && (
        <div className="inventory-modal-backdrop">
          <form
            className="inventory-modal"
            onSubmit={saveQuantity}
          >
            <div className="inventory-modal-header">
              <div>
                <span>INVENTORY UPDATE</span>
                <h2>Update Stock</h2>
              </div>

              <button
                type="button"
                onClick={closeUpdate}
              >
                ×
              </button>
            </div>

            <div className="selected-inventory-product">
              <div className="inventory-product-icon large">
                {editingItem.category === 'Dairy'
                  ? editingItem.product
                      .toLowerCase()
                      .includes('egg')
                    ? '🥚'
                    : '🥛'
                  : editingItem.category === 'Fruits'
                    ? '🍌'
                    : editingItem.category ===
                        'Vegetables'
                      ? '🍅'
                      : editingItem.category === 'Bakery'
                        ? '🍞'
                        : editingItem.category ===
                            'Beverages'
                          ? '🥤'
                          : editingItem.category ===
                              'Snacks'
                            ? '🥔'
                            : '🧂'}
              </div>

              <div>
                <strong>{editingItem.product}</strong>
                <span>{editingItem.variant}</span>
              </div>
            </div>

            <label className="quantity-field">
              Available quantity
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(event) =>
                  setQuantity(event.target.value)
                }
                autoFocus
              />
            </label>

            <div className="quick-quantity-buttons">
              {[0, 5, 10, 20, 50].map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() =>
                    setQuantity(String(value))
                  }
                >
                  {value}
                </button>
              ))}
            </div>

            <div className="inventory-modal-footer">
              <button
                type="button"
                className="cancel-inventory"
                onClick={closeUpdate}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-inventory"
              >
                Save Stock
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .inventory-page {
    min-height: 100vh;
    background: #f7f7f7;
    color: #222;
    font-family: Inter, Arial, sans-serif;
  }

  .inventory-sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    width: 250px;
    background: #fff;
    border-right: 1px solid #e8e8e8;
    z-index: 100;
    display: flex;
    flex-direction: column;
  }

  .inventory-brand {
    height: 72px;
    padding: 0 18px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
  }

  .inventory-brand > button:first-child {
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

  .inventory-brand > button:first-child span {
    width: 39px;
    height: 39px;
    border-radius: 11px;
    background: #f5d90a;
    display: grid;
    place-items: center;
  }

  .close-inventory-sidebar {
    display: none;
    margin-left: auto;
    border: 0;
    background: transparent;
    font-size: 24px;
    cursor: pointer;
  }

  .inventory-shop {
    margin: 18px 14px;
    padding: 12px;
    border-radius: 11px;
    background: #f7f7f7;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .inventory-avatar {
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

  .inventory-shop > div:last-child {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .inventory-shop strong {
    font-size: 11px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .inventory-shop small {
    color: #888;
    font-size: 9px;
  }

  .inventory-nav {
    padding: 0 12px;
  }

  .inventory-nav > span {
    display: block;
    margin: 6px 10px 9px;
    color: #aaa;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 1px;
  }

  .inventory-nav button {
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

  .inventory-nav button:hover {
    background: #f5f5f5;
    color: #222;
  }

  .inventory-nav button.active {
    background: #111;
    color: #fff;
  }

  .inventory-nav b {
    width: 21px;
    text-align: center;
    font-size: 14px;
  }

  .inventory-sidebar-bottom {
    margin-top: auto;
    padding: 14px;
  }

  .inventory-sidebar-bottom button {
    width: 100%;
    border: 0;
    background: transparent;
    color: #777;
    padding: 8px;
    cursor: pointer;
    font-size: 9px;
  }

  .inventory-content {
    width: calc(100% - 250px);
    margin-left: 250px;
    min-width: 0;
  }

  .inventory-header {
    height: 72px;
    padding: 0 28px;
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .inventory-header h1 {
    margin: 0;
    font-size: 21px;
  }

  .inventory-header p {
    margin: 4px 0 0;
    color: #888;
    font-size: 10px;
  }

  .open-inventory-sidebar {
    display: none;
    border: 0;
    background: transparent;
    font-size: 22px;
    cursor: pointer;
  }

  .inventory-header-right {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .inventory-header-right > button {
    width: 35px;
    height: 35px;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
  }

  .inventory-header-right > div {
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

  .inventory-main {
    max-width: 1400px;
    margin: 0 auto;
    padding: 28px;
  }

  .inventory-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
  }

  .inventory-top h2 {
    margin: 0;
    font-size: 22px;
  }

  .inventory-top p {
    margin: 5px 0 0;
    color: #888;
    font-size: 11px;
  }

  .products-link {
    border: 0;
    background: transparent;
    cursor: pointer;
    font-size: 10px;
    font-weight: 800;
  }

  .inventory-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-bottom: 14px;
  }

  .inventory-stats button {
    border: 1px solid #e7e7e7;
    border-radius: 12px;
    background: #fff;
    padding: 14px;
    display: flex;
    align-items: center;
    gap: 11px;
    text-align: left;
    cursor: pointer;
  }

  .inventory-stats button:hover,
  .inventory-stats button.selected {
    border-color: #222;
  }

  .inventory-stat-icon {
    width: 38px;
    height: 38px;
    border-radius: 9px;
    background: #f2f2f2;
    display: grid;
    place-items: center;
    font-size: 15px;
    font-weight: 900;
  }

  .healthy-icon {
    background: #e8f7ed;
    color: #16823a;
  }

  .low-icon {
    background: #fff4dc;
    color: #946500;
  }

  .out-icon {
    background: #fdeaea;
    color: #b00020;
  }

  .inventory-stats div {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .inventory-stats strong {
    font-size: 20px;
  }

  .inventory-stats small {
    color: #888;
    font-size: 9px;
  }

  .inventory-toolbar {
    display: flex;
    gap: 10px;
    margin-bottom: 14px;
  }

  .inventory-search {
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

  .inventory-search span {
    color: #888;
    font-size: 18px;
  }

  .inventory-search input {
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    font-size: 11px;
  }

  .inventory-toolbar select {
    width: 170px;
    height: 43px;
    border: 1px solid #e1e1e1;
    border-radius: 9px;
    background: #fff;
    padding: 0 12px;
    font-size: 10px;
    outline: none;
  }

  .inventory-table-card {
    background: #fff;
    border: 1px solid #e7e7e7;
    border-radius: 14px;
    overflow: hidden;
  }

  .inventory-table-heading {
    padding: 17px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
  }

  .inventory-table-heading h3 {
    margin: 0;
    font-size: 14px;
  }

  .inventory-table-heading p {
    margin: 4px 0 0;
    color: #888;
    font-size: 9px;
  }

  .inventory-sync {
    color: #16823a;
    font-size: 8px;
    font-weight: 700;
  }

  .inventory-table-wrapper {
    overflow-x: auto;
  }

  .inventory-table {
    width: 100%;
    min-width: 850px;
    border-collapse: collapse;
  }

  .inventory-table th {
    padding: 10px 12px;
    background: #fafafa;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
    text-align: left;
    color: #999;
    font-size: 8px;
    font-weight: 700;
  }

  .inventory-table td {
    padding: 12px;
    border-bottom: 1px solid #f1f1f1;
    color: #555;
    font-size: 9px;
  }

  .inventory-product {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 180px;
  }

  .inventory-product-icon {
    width: 39px;
    height: 39px;
    border-radius: 8px;
    background: #f5f5f5;
    display: grid;
    place-items: center;
    font-size: 19px;
    flex-shrink: 0;
  }

  .inventory-product-icon.large {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }

  .inventory-product > div:last-child {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .inventory-product strong {
    color: #222;
    font-size: 10px;
  }

  .inventory-product span {
    color: #888;
    font-size: 8px;
  }

  .category-pill {
    padding: 5px 7px;
    border-radius: 5px;
    background: #f4f4f4;
    color: #666;
    font-size: 8px;
  }

  .threshold {
    color: #888;
  }

  .stock-control {
    width: 88px;
    height: 29px;
    border: 1px solid #ddd;
    border-radius: 6px;
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  .stock-control button {
    width: 28px;
    height: 100%;
    border: 0;
    background: #f7f7f7;
    cursor: pointer;
    font-size: 14px;
  }

  .stock-control button:disabled {
    opacity: .35;
    cursor: not-allowed;
  }

  .stock-control strong {
    flex: 1;
    text-align: center;
    font-size: 9px;
  }

  .stock-status {
    display: inline-block;
    padding: 5px 7px;
    border-radius: 5px;
    font-size: 8px;
    font-weight: 800;
  }

  .stock-status.healthy {
    background: #e8f7ed;
    color: #16823a;
  }

  .stock-status.low {
    background: #fff4dc;
    color: #946500;
  }

  .stock-status.out {
    background: #fdeaea;
    color: #b00020;
  }

  .update-stock-button {
    border: 1px solid #ddd;
    background: #fff;
    border-radius: 6px;
    padding: 6px 9px;
    cursor: pointer;
    font-size: 8px;
    font-weight: 700;
  }

  .inventory-empty {
    padding: 65px 20px;
    text-align: center;
  }

  .inventory-empty > div {
    font-size: 42px;
  }

  .inventory-empty h3 {
    margin: 10px 0 5px;
    font-size: 15px;
  }

  .inventory-empty p {
    margin: 0;
    color: #888;
    font-size: 9px;
  }

  .inventory-alert {
    margin-top: 14px;
    padding: 14px;
    border: 1px solid #f0dfad;
    border-radius: 12px;
    background: #fffaf0;
    display: flex;
    align-items: center;
    gap: 11px;
  }

  .alert-icon {
    font-size: 20px;
  }

  .inventory-alert div:nth-child(2) {
    flex: 1;
  }

  .inventory-alert strong {
    font-size: 10px;
  }

  .inventory-alert p {
    margin: 4px 0 0;
    color: #806f3e;
    font-size: 8px;
  }

  .inventory-alert > button {
    border: 0;
    background: transparent;
    cursor: pointer;
    font-size: 9px;
    font-weight: 800;
  }

  .inventory-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: rgba(0, 0, 0, .45);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .inventory-modal {
    width: 100%;
    max-width: 450px;
    background: #fff;
    border-radius: 15px;
    padding: 21px;
  }

  .inventory-modal-header {
    display: flex;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 20px;
  }

  .inventory-modal-header span {
    color: #999;
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 1px;
  }

  .inventory-modal-header h2 {
    margin: 5px 0 0;
    font-size: 19px;
  }

  .inventory-modal-header > button {
    width: 31px;
    height: 31px;
    border: 0;
    border-radius: 7px;
    background: #f2f2f2;
    font-size: 20px;
    cursor: pointer;
  }

  .selected-inventory-product {
    padding: 13px;
    border-radius: 9px;
    background: #f7f7f7;
    display: flex;
    align-items: center;
    gap: 11px;
  }

  .selected-inventory-product > div:last-child {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .selected-inventory-product strong {
    font-size: 11px;
  }

  .selected-inventory-product span {
    color: #888;
    font-size: 9px;
  }

  .quantity-field {
    display: flex;
    flex-direction: column;
    gap: 7px;
    margin-top: 18px;
    color: #555;
    font-size: 9px;
    font-weight: 700;
  }

  .quantity-field input {
    width: 100%;
    height: 42px;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 0 11px;
    outline: none;
    font-size: 13px;
  }

  .quick-quantity-buttons {
    display: flex;
    gap: 7px;
    margin-top: 10px;
  }

  .quick-quantity-buttons button {
    flex: 1;
    border: 1px solid #ddd;
    background: #fff;
    border-radius: 6px;
    padding: 7px;
    cursor: pointer;
    font-size: 8px;
  }

  .inventory-modal-footer {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .inventory-modal-footer button {
    height: 36px;
    border-radius: 7px;
    padding: 0 13px;
    cursor: pointer;
    font-size: 9px;
    font-weight: 800;
  }

  .cancel-inventory {
    border: 1px solid #ddd;
    background: #fff;
  }

  .save-inventory {
    border: 0;
    background: #111;
    color: #fff;
  }

  .inventory-overlay {
    display: none;
  }

  @media (max-width: 1050px) {
    .inventory-stats {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 760px) {
    .inventory-sidebar {
      transform: translateX(-100%);
      transition: transform .2s ease;
    }

    .inventory-sidebar.open {
      transform: translateX(0);
    }

    .close-inventory-sidebar {
      display: block;
    }

    .inventory-overlay {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 90;
      border: 0;
      background: rgba(0, 0, 0, .35);
    }

    .inventory-content {
      width: 100%;
      margin-left: 0;
    }

    .open-inventory-sidebar {
      display: block;
    }

    .inventory-header {
      padding: 0 16px;
    }

    .inventory-main {
      padding: 20px 14px 60px;
    }

    .inventory-top {
      align-items: flex-start;
    }

    .inventory-alert {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .inventory-alert > button {
      margin-left: 31px;
    }
  }

  @media (max-width: 520px) {
    .inventory-header p {
      display: none;
    }

    .inventory-header-right > button {
      display: none;
    }

    .inventory-stats {
      grid-template-columns: 1fr 1fr;
    }

    .inventory-toolbar {
      flex-direction: column;
    }

    .inventory-toolbar select {
      width: 100%;
    }

    .inventory-top {
      flex-direction: column;
    }

    .products-link {
      align-self: flex-start;
    }

    .quick-quantity-buttons button {
      padding: 6px 3px;
    }
  }
`