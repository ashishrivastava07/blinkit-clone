import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const initialProducts = [
  {
    id: 'p1',
    name: 'Amul Taaza Milk',
    category: 'Dairy',
    emoji: '🥛',
    description: 'Fresh toned milk',
    active: true,
    variants: [
      { id: 'v1', name: '500 ml', price: 29, mrp: 32, stock: 18 },
      { id: 'v2', name: '1 L', price: 56, mrp: 64, stock: 12 },
    ],
  },
  {
    id: 'p2',
    name: 'Farm Fresh Bananas',
    category: 'Fruits',
    emoji: '🍌',
    description: 'Fresh ripe bananas',
    active: true,
    variants: [
      { id: 'v3', name: '500 g', price: 38, mrp: 45, stock: 20 },
      { id: 'v4', name: '1 kg', price: 72, mrp: 90, stock: 9 },
    ],
  },
  {
    id: 'p3',
    name: 'Brown Bread',
    category: 'Bakery',
    emoji: '🍞',
    description: 'Fresh whole wheat bread',
    active: true,
    variants: [
      { id: 'v5', name: '400 g', price: 45, mrp: 50, stock: 7 },
    ],
  },
  {
    id: 'p4',
    name: 'Farm Eggs',
    category: 'Dairy',
    emoji: '🥚',
    description: 'Fresh farm eggs',
    active: true,
    variants: [
      { id: 'v6', name: '6 pieces', price: 55, mrp: 65, stock: 14 },
      { id: 'v7', name: '12 pieces', price: 105, mrp: 130, stock: 0 },
    ],
  },
  {
    id: 'p5',
    name: "Lay's Classic Salted",
    category: 'Snacks',
    emoji: '🥔',
    description: 'Classic salted potato chips',
    active: true,
    variants: [
      { id: 'v8', name: '52 g', price: 20, mrp: 20, stock: 25 },
    ],
  },
  {
    id: 'p6',
    name: 'Tata Salt',
    category: 'Essentials',
    emoji: '🧂',
    description: 'Iodized edible salt',
    active: true,
    variants: [
      { id: 'v9', name: '1 kg', price: 28, mrp: 30, stock: 16 },
    ],
  },
  {
    id: 'p7',
    name: 'Coca-Cola',
    category: 'Beverages',
    emoji: '🥤',
    description: 'Refreshing soft drink',
    active: true,
    variants: [
      { id: 'v10', name: '750 ml', price: 40, mrp: 45, stock: 11 },
      { id: 'v11', name: '2.25 L', price: 89, mrp: 95, stock: 5 },
    ],
  },
  {
    id: 'p8',
    name: 'Fresh Tomatoes',
    category: 'Vegetables',
    emoji: '🍅',
    description: 'Fresh red tomatoes',
    active: true,
    variants: [
      { id: 'v12', name: '500 g', price: 29, mrp: 38, stock: 4 },
      { id: 'v13', name: '1 kg', price: 55, mrp: 76, stock: 0 },
    ],
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

export default function ShopkeeperProducts() {
  const navigate = useNavigate()

  const [products, setProducts] = useState(initialProducts)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [activeFilter, setActiveFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [form, setForm] = useState({
    name: '',
    category: 'Dairy',
    description: '',
    emoji: '🛍️',
    variant: '',
    price: '',
    mrp: '',
    stock: '',
  })

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)

      const matchesCategory =
        category === 'All' || product.category === category

      const matchesActive =
        activeFilter === 'all' ||
        (activeFilter === 'active' && product.active) ||
        (activeFilter === 'inactive' && !product.active)

      return (
        matchesSearch &&
        matchesCategory &&
        matchesActive
      )
    })
  }, [products, search, category, activeFilter])

  const productCounts = useMemo(
    () => ({
      all: products.length,
      active: products.filter((product) => product.active)
        .length,
      inactive: products.filter((product) => !product.active)
        .length,
    }),
    [products],
  )

  function openAddModal() {
    setEditingProduct(null)

    setForm({
      name: '',
      category: 'Dairy',
      description: '',
      emoji: '🛍️',
      variant: '',
      price: '',
      mrp: '',
      stock: '',
    })

    setShowModal(true)
  }

  function openEditModal(product) {
    const firstVariant = product.variants[0]

    setEditingProduct(product)

    setForm({
      name: product.name,
      category: product.category,
      description: product.description,
      emoji: product.emoji,
      variant: firstVariant?.name || '',
      price: firstVariant?.price || '',
      mrp: firstVariant?.mrp || '',
      stock: firstVariant?.stock || '',
    })

    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingProduct(null)
  }

  function handleFormChange(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function saveProduct(event) {
    event.preventDefault()

    if (!form.name.trim() || !form.variant.trim()) {
      return
    }

    const price = Number(form.price) || 0
    const mrp = Number(form.mrp) || price
    const stock = Number(form.stock) || 0

    if (editingProduct) {
      setProducts((current) =>
        current.map((product) => {
          if (product.id !== editingProduct.id) {
            return product
          }

          return {
            ...product,
            name: form.name.trim(),
            category: form.category,
            description: form.description.trim(),
            emoji: form.emoji || '🛍️',
            variants: product.variants.map(
              (variant, index) =>
                index === 0
                  ? {
                      ...variant,
                      name: form.variant.trim(),
                      price,
                      mrp,
                      stock,
                    }
                  : variant,
            ),
          }
        }),
      )
    } else {
      const newProduct = {
        id: `p-${Date.now()}`,
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim(),
        emoji: form.emoji || '🛍️',
        active: true,
        variants: [
          {
            id: `v-${Date.now()}`,
            name: form.variant.trim(),
            price,
            mrp,
            stock,
          },
        ],
      }

      setProducts((current) => [newProduct, ...current])
    }

    closeModal()
  }

  function toggleProduct(productId) {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? { ...product, active: !product.active }
          : product,
      ),
    )
  }

  function deleteProduct(productId) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this product?',
    )

    if (!confirmed) return

    setProducts((current) =>
      current.filter((product) => product.id !== productId),
    )
  }

  function goTo(path) {
    setSidebarOpen(false)
    navigate(path)
  }

  return (
    <div className="shop-products-page">
      <style>{styles}</style>

      {sidebarOpen && (
        <button
          type="button"
          className="products-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`products-sidebar ${
          sidebarOpen ? 'open' : ''
        }`}
      >
        <div className="products-brand">
          <button
            type="button"
            onClick={() => navigate('/')}
          >
            <span>🛒</span>
            Blinkit
          </button>

          <button
            type="button"
            className="close-products-sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            ×
          </button>
        </div>

        <div className="products-shop">
          <div className="products-avatar">S</div>

          <div>
            <strong>My Grocery Store</strong>
            <small>Shopkeeper account</small>
          </div>
        </div>

        <nav className="products-nav">
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
            onClick={() => goTo('/shopkeeper/orders')}
          >
            <b>🧾</b>
            Orders
          </button>

          <button
            type="button"
            className="active"
            onClick={() =>
              goTo('/shopkeeper/products')
            }
          >
            <b>🛍️</b>
            Products
          </button>

          <button
            type="button"
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

        <div className="products-sidebar-bottom">
          <button
            type="button"
            onClick={() => navigate('/')}
          >
            ← View customer store
          </button>
        </div>
      </aside>

      <div className="products-content">
        <header className="products-header">
          <button
            type="button"
            className="open-products-sidebar"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>

          <div>
            <h1>Products</h1>
            <p>Manage your store catalogue and pricing.</p>
          </div>

          <div className="products-header-right">
            <button type="button">🔔</button>
            <div>S</div>
          </div>
        </header>

        <main className="products-main">
          <div className="products-page-top">
            <div>
              <h2>Product Catalogue</h2>
              <p>
                Add, edit and manage products available in
                your store.
              </p>
            </div>

            <button
              type="button"
              className="add-product-button"
              onClick={openAddModal}
            >
              + Add Product
            </button>
          </div>

          <div className="product-stat-strip">
            <button
              type="button"
              className={
                activeFilter === 'all' ? 'selected' : ''
              }
              onClick={() => setActiveFilter('all')}
            >
              <strong>{productCounts.all}</strong>
              <span>All products</span>
            </button>

            <button
              type="button"
              className={
                activeFilter === 'active' ? 'selected' : ''
              }
              onClick={() => setActiveFilter('active')}
            >
              <strong>{productCounts.active}</strong>
              <span>Active</span>
            </button>

            <button
              type="button"
              className={
                activeFilter === 'inactive'
                  ? 'selected'
                  : ''
              }
              onClick={() => setActiveFilter('inactive')}
            >
              <strong>{productCounts.inactive}</strong>
              <span>Inactive</span>
            </button>
          </div>

          <div className="products-toolbar">
            <div className="product-search">
              <span>⌕</span>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search products..."
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

          <section className="products-grid">
            {filteredProducts.length === 0 ? (
              <div className="products-empty">
                <div>🛍️</div>
                <h3>No products found</h3>
                <p>
                  Try another search or add a new product.
                </p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const firstVariant = product.variants[0]

                const totalStock = product.variants.reduce(
                  (total, variant) =>
                    total + Number(variant.stock || 0),
                  0,
                )

                const hasStock = totalStock > 0

                return (
                  <article
                    className="product-card"
                    key={product.id}
                  >
                    <div className="product-card-top">
                      <div className="product-image">
                        {product.emoji}
                      </div>

                      <div className="product-card-actions">
                        <button
                          type="button"
                          title="Edit product"
                          onClick={() =>
                            openEditModal(product)
                          }
                        >
                          ✏️
                        </button>

                        <button
                          type="button"
                          title="Delete product"
                          onClick={() =>
                            deleteProduct(product.id)
                          }
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="product-card-info">
                      <div className="product-name-row">
                        <h3>{product.name}</h3>

                        <span
                          className={
                            product.active
                              ? 'active-badge'
                              : 'inactive-badge'
                          }
                        >
                          {product.active
                            ? 'Active'
                            : 'Inactive'}
                        </span>
                      </div>

                      <p className="product-category">
                        {product.category}
                      </p>

                      <p className="product-description">
                        {product.description}
                      </p>
                    </div>

                    <div className="variant-list">
                      {product.variants.map((variant) => (
                        <div
                          className="variant-row"
                          key={variant.id}
                        >
                          <div>
                            <strong>{variant.name}</strong>
                            <span>
                              Stock:{' '}
                              <b
                                className={
                                  variant.stock === 0
                                    ? 'out-stock'
                                    : variant.stock <= 5
                                      ? 'low-stock'
                                      : ''
                                }
                              >
                                {variant.stock}
                              </b>
                            </span>
                          </div>

                          <div>
                            <strong>
                              ₹{variant.price}
                            </strong>

                            {variant.mrp >
                              variant.price && (
                              <del>₹{variant.mrp}</del>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="product-card-footer">
                      <div>
                        <span>
                          {product.variants.length}{' '}
                          {product.variants.length === 1
                            ? 'variant'
                            : 'variants'}
                        </span>

                        <span
                          className={
                            hasStock
                              ? 'stock-ok'
                              : 'stock-empty'
                          }
                        >
                          {hasStock
                            ? `${totalStock} units in stock`
                            : 'Out of stock'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          toggleProduct(product.id)
                        }
                      >
                        {product.active
                          ? 'Disable'
                          : 'Enable'}
                      </button>
                    </div>

                    {firstVariant &&
                      firstVariant.mrp >
                        firstVariant.price && (
                        <div className="discount-badge">
                          {Math.round(
                            ((firstVariant.mrp -
                              firstVariant.price) /
                              firstVariant.mrp) *
                              100,
                          )}
                          % OFF
                        </div>
                      )}
                  </article>
                )
              })
            )}
          </section>
        </main>
      </div>

      {showModal && (
        <div className="product-modal-backdrop">
          <form
            className="product-modal"
            onSubmit={saveProduct}
          >
            <div className="product-modal-header">
              <div>
                <span>
                  {editingProduct
                    ? 'PRODUCT CATALOGUE'
                    : 'NEW PRODUCT'}
                </span>

                <h2>
                  {editingProduct
                    ? 'Edit Product'
                    : 'Add Product'}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <div className="form-grid">
              <label>
                Product name
                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Amul Taaza Milk"
                  required
                />
              </label>

              <label>
                Category
                <select
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                >
                  {categories
                    .filter((item) => item !== 'All')
                    .map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                </select>
              </label>

              <label className="full-field">
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="Short product description"
                  rows="3"
                />
              </label>

              <label>
                Product icon
                <input
                  name="emoji"
                  value={form.emoji}
                  onChange={handleFormChange}
                  placeholder="🥛"
                />
              </label>

              <label>
                Variant
                <input
                  name="variant"
                  value={form.variant}
                  onChange={handleFormChange}
                  placeholder="e.g. 1 L"
                  required
                />
              </label>

              <label>
                Selling price
                <div className="price-input">
                  <span>₹</span>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={handleFormChange}
                    placeholder="56"
                  />
                </div>
              </label>

              <label>
                MRP
                <div className="price-input">
                  <span>₹</span>
                  <input
                    name="mrp"
                    type="number"
                    min="0"
                    value={form.mrp}
                    onChange={handleFormChange}
                    placeholder="64"
                  />
                </div>
              </label>

              <label>
                Opening stock
                <input
                  name="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={handleFormChange}
                  placeholder="20"
                />
              </label>
            </div>

            <div className="modal-note">
              <span>ℹ️</span>
              <p>
                You can add additional variants and manage
                inventory separately later.
              </p>
            </div>

            <div className="product-modal-footer">
              <button
                type="button"
                className="cancel-button"
                onClick={closeModal}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-product-button"
              >
                {editingProduct
                  ? 'Save Changes'
                  : 'Add Product'}
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

  .shop-products-page {
    min-height: 100vh;
    background: #f7f7f7;
    color: #222;
    font-family: Inter, Arial, sans-serif;
  }

  .products-sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    width: 250px;
    background: #fff;
    border-right: 1px solid #e8e8e8;
    z-index: 100;
    display: flex;
    flex-direction: column;
  }

  .products-brand {
    height: 72px;
    padding: 0 18px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
  }

  .products-brand > button:first-child {
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

  .products-brand > button:first-child span {
    width: 39px;
    height: 39px;
    border-radius: 11px;
    background: #f5d90a;
    display: grid;
    place-items: center;
  }

  .close-products-sidebar {
    display: none;
    margin-left: auto;
    border: 0;
    background: transparent;
    font-size: 24px;
    cursor: pointer;
  }

  .products-shop {
    margin: 18px 14px;
    padding: 12px;
    border-radius: 11px;
    background: #f7f7f7;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .products-avatar {
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

  .products-shop > div:last-child {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .products-shop strong {
    font-size: 11px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .products-shop small {
    color: #888;
    font-size: 9px;
  }

  .products-nav {
    padding: 0 12px;
  }

  .products-nav > span {
    display: block;
    margin: 6px 10px 9px;
    color: #aaa;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 1px;
  }

  .products-nav button {
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

  .products-nav button:hover {
    background: #f5f5f5;
    color: #222;
  }

  .products-nav button.active {
    background: #111;
    color: #fff;
  }

  .products-nav b {
    width: 21px;
    text-align: center;
    font-size: 14px;
  }

  .products-sidebar-bottom {
    margin-top: auto;
    padding: 14px;
  }

  .products-sidebar-bottom button {
    width: 100%;
    border: 0;
    background: transparent;
    color: #777;
    padding: 8px;
    cursor: pointer;
    font-size: 9px;
  }

  .products-content {
    width: calc(100% - 250px);
    margin-left: 250px;
    min-width: 0;
  }

  .products-header {
    height: 72px;
    padding: 0 28px;
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .products-header h1 {
    margin: 0;
    font-size: 21px;
  }

  .products-header p {
    margin: 4px 0 0;
    color: #888;
    font-size: 10px;
  }

  .open-products-sidebar {
    display: none;
    border: 0;
    background: transparent;
    font-size: 22px;
    cursor: pointer;
  }

  .products-header-right {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .products-header-right > button {
    width: 35px;
    height: 35px;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
  }

  .products-header-right > div {
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

  .products-main {
    max-width: 1400px;
    margin: 0 auto;
    padding: 28px;
  }

  .products-page-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 20px;
  }

  .products-page-top h2 {
    margin: 0;
    font-size: 22px;
  }

  .products-page-top p {
    margin: 5px 0 0;
    color: #888;
    font-size: 11px;
  }

  .add-product-button {
    height: 39px;
    padding: 0 15px;
    border: 0;
    border-radius: 8px;
    background: #111;
    color: #fff;
    cursor: pointer;
    font-size: 10px;
    font-weight: 800;
  }

  .product-stat-strip {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 14px;
  }

  .product-stat-strip button {
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

  .product-stat-strip button.selected,
  .product-stat-strip button:hover {
    border-color: #222;
  }

  .product-stat-strip strong {
    font-size: 20px;
  }

  .product-stat-strip span {
    color: #888;
    font-size: 9px;
  }

  .products-toolbar {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
  }

  .product-search {
    flex: 1;
    height: 43px;
    border: 1px solid #e1e1e1;
    border-radius: 9px;
    background: #fff;
    padding: 0 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .product-search span {
    color: #888;
    font-size: 18px;
  }

  .product-search input {
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    font-size: 11px;
  }

  .products-toolbar select {
    width: 170px;
    height: 43px;
    border: 1px solid #e1e1e1;
    border-radius: 9px;
    background: #fff;
    padding: 0 12px;
    font-size: 10px;
    outline: none;
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 13px;
  }

  .product-card {
    position: relative;
    background: #fff;
    border: 1px solid #e7e7e7;
    border-radius: 14px;
    padding: 15px;
    overflow: hidden;
  }

  .product-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }

  .product-image {
    width: 65px;
    height: 65px;
    border-radius: 12px;
    background: #f5f5f5;
    display: grid;
    place-items: center;
    font-size: 34px;
  }

  .product-card-actions {
    display: flex;
    gap: 4px;
  }

  .product-card-actions button {
    width: 29px;
    height: 29px;
    border: 0;
    border-radius: 7px;
    background: #f4f4f4;
    cursor: pointer;
    font-size: 12px;
  }

  .product-card-info {
    margin-top: 13px;
  }

  .product-name-row {
    display: flex;
    align-items: flex-start;
    gap: 7px;
  }

  .product-name-row h3 {
    margin: 0;
    flex: 1;
    font-size: 13px;
    line-height: 1.35;
  }

  .active-badge,
  .inactive-badge {
    flex-shrink: 0;
    padding: 4px 6px;
    border-radius: 5px;
    font-size: 7px;
    font-weight: 800;
  }

  .active-badge {
    background: #e8f7ed;
    color: #16823a;
  }

  .inactive-badge {
    background: #f0f0f0;
    color: #777;
  }

  .product-category {
    margin: 5px 0 0;
    color: #777;
    font-size: 9px;
  }

  .product-description {
    margin: 6px 0 0;
    color: #999;
    font-size: 9px;
    line-height: 1.4;
  }

  .variant-list {
    margin-top: 13px;
    border-top: 1px solid #f0f0f0;
  }

  .variant-row {
    padding: 9px 0;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .variant-row > div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .variant-row > div:last-child {
    text-align: right;
  }

  .variant-row strong {
    font-size: 10px;
  }

  .variant-row span {
    color: #999;
    font-size: 8px;
  }

  .variant-row b {
    color: #444;
  }

  .variant-row b.low-stock {
    color: #b06c00;
  }

  .variant-row b.out-stock {
    color: #b00020;
  }

  .variant-row del {
    color: #aaa;
    font-size: 8px;
  }

  .product-card-footer {
    margin-top: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .product-card-footer > div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .product-card-footer span {
    color: #999;
    font-size: 8px;
  }

  .product-card-footer .stock-ok {
    color: #16823a;
  }

  .product-card-footer .stock-empty {
    color: #b00020;
  }

  .product-card-footer button {
    border: 1px solid #ddd;
    background: #fff;
    border-radius: 6px;
    padding: 6px 8px;
    cursor: pointer;
    font-size: 8px;
    font-weight: 700;
  }

  .discount-badge {
    position: absolute;
    top: 15px;
    left: 15px;
    padding: 4px 6px;
    border-radius: 5px;
    background: #111;
    color: #fff;
    font-size: 7px;
    font-weight: 800;
  }

  .products-empty {
    grid-column: 1 / -1;
    padding: 70px 20px;
    border: 1px solid #e7e7e7;
    border-radius: 14px;
    background: #fff;
    text-align: center;
  }

  .products-empty > div {
    font-size: 45px;
  }

  .products-empty h3 {
    margin: 12px 0 5px;
    font-size: 16px;
  }

  .products-empty p {
    margin: 0;
    color: #888;
    font-size: 10px;
  }

  .product-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: rgba(0, 0, 0, .45);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .product-modal {
    width: 100%;
    max-width: 650px;
    max-height: 90vh;
    overflow-y: auto;
    background: #fff;
    border-radius: 16px;
    padding: 22px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, .2);
  }

  .product-modal-header {
    display: flex;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 20px;
  }

  .product-modal-header > div > span {
    color: #999;
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 1px;
  }

  .product-modal-header h2 {
    margin: 5px 0 0;
    font-size: 20px;
  }

  .product-modal-header > button {
    width: 32px;
    height: 32px;
    border: 0;
    border-radius: 7px;
    background: #f2f2f2;
    font-size: 20px;
    cursor: pointer;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .form-grid label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    color: #555;
    font-size: 9px;
    font-weight: 700;
  }

  .form-grid input,
  .form-grid select,
  .form-grid textarea {
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fff;
    padding: 10px;
    outline: none;
    font-family: inherit;
    font-size: 10px;
    font-weight: 400;
  }

  .form-grid input:focus,
  .form-grid select:focus,
  .form-grid textarea:focus {
    border-color: #555;
  }

  .full-field {
    grid-column: 1 / -1;
  }

  .price-input {
    display: flex;
    align-items: center;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
  }

  .price-input span {
    padding-left: 10px;
    color: #777;
  }

  .price-input input {
    border: 0;
    border-radius: 0;
  }

  .modal-note {
    margin-top: 15px;
    padding: 10px;
    border-radius: 8px;
    background: #f7f7f7;
    display: flex;
    gap: 8px;
    align-items: flex-start;
  }

  .modal-note p {
    margin: 0;
    color: #777;
    font-size: 9px;
    line-height: 1.4;
  }

  .product-modal-footer {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .product-modal-footer button {
    height: 36px;
    border-radius: 7px;
    padding: 0 13px;
    cursor: pointer;
    font-size: 9px;
    font-weight: 800;
  }

  .cancel-button {
    border: 1px solid #ddd;
    background: #fff;
  }

  .save-product-button {
    border: 0;
    background: #111;
    color: #fff;
  }

  .products-overlay {
    display: none;
  }

  @media (max-width: 1150px) {
    .products-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 760px) {
    .products-sidebar {
      transform: translateX(-100%);
      transition: transform .2s ease;
    }

    .products-sidebar.open {
      transform: translateX(0);
    }

    .close-products-sidebar {
      display: block;
    }

    .products-overlay {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 90;
      border: 0;
      background: rgba(0, 0, 0, .35);
    }

    .products-content {
      width: 100%;
      margin-left: 0;
    }

    .open-products-sidebar {
      display: block;
    }

    .products-header {
      padding: 0 16px;
    }

    .products-main {
      padding: 20px 14px 60px;
    }

    .products-page-top {
      align-items: flex-start;
    }

    .products-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 520px) {
    .products-header p {
      display: none;
    }

    .products-header-right > button {
      display: none;
    }

    .products-page-top {
      flex-direction: column;
    }

    .add-product-button {
      width: 100%;
    }

    .products-toolbar {
      flex-direction: column;
    }

    .products-toolbar select {
      width: 100%;
    }

    .form-grid {
      grid-template-columns: 1fr;
    }

    .full-field {
      grid-column: auto;
    }

    .product-modal-backdrop {
      padding: 10px;
    }

    .product-modal {
      padding: 17px;
    }
  }
`