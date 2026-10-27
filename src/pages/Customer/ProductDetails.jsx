import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const PRODUCTS = [
  {
    id: 'milk',
    name: 'Amul Taaza Milk',
    category: 'Dairy',
    emoji: '🥛',
    description:
      'Fresh and nutritious toned milk, perfect for tea, coffee, breakfast and everyday use.',
    details:
      'Amul Taaza is a popular toned milk suitable for everyday consumption. Keep refrigerated and consume after opening.',
    variants: [
      { id: 'milk-500', label: '500 ml', price: 29, mrp: 32, stock: 18 },
      { id: 'milk-1l', label: '1 L', price: 56, mrp: 64, stock: 12 },
    ],
  },
  {
    id: 'banana',
    name: 'Farm Fresh Bananas',
    category: 'Fruits',
    emoji: '🍌',
    description:
      'Fresh, naturally sweet bananas that are perfect for breakfast and snacks.',
    details:
      'Fresh bananas selected for everyday consumption. Store at room temperature and consume when ripe.',
    variants: [
      { id: 'banana-500', label: '500 g', price: 38, mrp: 45, stock: 20 },
      { id: 'banana-1kg', label: '1 kg', price: 72, mrp: 90, stock: 9 },
    ],
  },
  {
    id: 'bread',
    name: 'Brown Bread',
    category: 'Bakery',
    emoji: '🍞',
    description:
      'Soft and wholesome brown bread for breakfast, sandwiches and snacks.',
    details:
      'Freshly packed brown bread made for everyday meals. Store in a cool and dry place.',
    variants: [
      { id: 'bread-400', label: '400 g', price: 45, mrp: 50, stock: 7 },
    ],
  },
  {
    id: 'eggs',
    name: 'Farm Eggs',
    category: 'Dairy',
    emoji: '🥚',
    description:
      'Fresh farm eggs for breakfast, baking and everyday cooking.',
    details:
      'Fresh eggs suitable for boiling, cooking and baking. Keep refrigerated for best quality.',
    variants: [
      { id: 'eggs-6', label: '6 pieces', price: 55, mrp: 65, stock: 14 },
      { id: 'eggs-12', label: '12 pieces', price: 105, mrp: 130, stock: 0 },
    ],
  },
  {
    id: 'lays',
    name: "Lay's Classic Salted",
    category: 'Snacks',
    emoji: '🥔',
    description:
      'Classic salted potato chips with a crispy and delicious taste.',
    details:
      'Crispy potato chips with a classic salted flavour. Store in a cool and dry place.',
    variants: [
      { id: 'lays-52', label: '52 g', price: 20, mrp: 20, stock: 25 },
    ],
  },
  {
    id: 'salt',
    name: 'Tata Salt',
    category: 'Essentials',
    emoji: '🧂',
    description:
      'Iodised salt for everyday cooking and food preparation.',
    details:
      'Tata Salt is an iodised edible salt suitable for everyday cooking.',
    variants: [
      { id: 'salt-1kg', label: '1 kg', price: 28, mrp: 30, stock: 16 },
    ],
  },
  {
    id: 'coke',
    name: 'Coca-Cola',
    category: 'Beverages',
    emoji: '🥤',
    description:
      'Refreshing sparkling soft drink, perfect with meals and snacks.',
    details:
      'A chilled refreshing beverage suitable for meals, parties and everyday occasions.',
    variants: [
      { id: 'coke-750', label: '750 ml', price: 40, mrp: 45, stock: 11 },
      { id: 'coke-2250', label: '2.25 L', price: 89, mrp: 95, stock: 5 },
    ],
  },
  {
    id: 'tomato',
    name: 'Fresh Tomatoes',
    category: 'Vegetables',
    emoji: '🍅',
    description:
      'Fresh red tomatoes for cooking, salads, sauces and everyday meals.',
    details:
      'Fresh tomatoes suitable for cooking and salads. Store in a cool place and wash before use.',
    variants: [
      { id: 'tomato-500', label: '500 g', price: 29, mrp: 38, stock: 4 },
      { id: 'tomato-1kg', label: '1 kg', price: 55, mrp: 76, stock: 0 },
    ],
  },
]

function getCart() {
  try {
    const saved = localStorage.getItem('quickcart')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveCart(cart) {
  localStorage.setItem('quickcart', JSON.stringify(cart))
  window.dispatchEvent(new Event('cartUpdated'))
}

export default function ProductDetails() {
  const navigate = useNavigate()
  const { productId } = useParams()

  const product = PRODUCTS.find((item) => item.id === productId)

  const [selectedVariantId, setSelectedVariantId] = useState(
    product?.variants.find((variant) => variant.stock > 0)?.id ||
      product?.variants[0]?.id ||
      '',
  )
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const selectedVariant = useMemo(
    () => product?.variants.find((variant) => variant.id === selectedVariantId),
    [product, selectedVariantId],
  )

  if (!product) {
    return (
      <div className="pd-page">
        <style>{styles}</style>
        <div className="pd-not-found">
          <div className="pd-not-found-card">
            <div className="pd-not-found-icon">🔎</div>
            <span className="pd-not-found-label">PRODUCT NOT FOUND</span>
            <h2>We couldn't find that product</h2>
            <p>The product may have been removed or the link may be outdated.</p>
            <button type="button" onClick={() => navigate('/')}>
              ← Back to shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  const discount =
    selectedVariant && selectedVariant.mrp > selectedVariant.price
      ? Math.round(
          ((selectedVariant.mrp - selectedVariant.price) /
            selectedVariant.mrp) *
            100,
        )
      : 0

  const totalPrice = selectedVariant ? selectedVariant.price * quantity : 0
  const isOutOfStock = !selectedVariant || selectedVariant.stock <= 0

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1))
    setAdded(false)
  }

  function increaseQuantity() {
    if (!selectedVariant) return

    setQuantity((current) =>
      Math.min(selectedVariant.stock, current + 1),
    )
    setAdded(false)
  }

  function selectVariant(variantId) {
    const nextVariant = product.variants.find(
      (variant) => variant.id === variantId,
    )

    if (!nextVariant) return

    setSelectedVariantId(variantId)
    setQuantity(1)
    setAdded(false)
  }

  function addToCart() {
    if (isOutOfStock) return

    const currentCart = getCart()
    const existingIndex = currentCart.findIndex(
      (item) => item.variantId === selectedVariant.id,
    )

    let updatedCart

    if (existingIndex >= 0) {
      updatedCart = currentCart.map((item, index) =>
        index === existingIndex
          ? {
              ...item,
              quantity: Math.min(
                item.quantity + quantity,
                selectedVariant.stock,
              ),
            }
          : item,
      )
    } else {
      updatedCart = [
        ...currentCart,
        {
          productId: product.id,
          variantId: selectedVariant.id,
          name: product.name,
          category: product.category,
          emoji: product.emoji,
          variant: selectedVariant.label,
          price: selectedVariant.price,
          mrp: selectedVariant.mrp,
          quantity,
        },
      ]
    }

    saveCart(updatedCart)
    setAdded(true)

    window.setTimeout(() => {
      setAdded(false)
    }, 1800)
  }

  return (
    <div className="pd-page">
      <style>{styles}</style>

      <header className="pd-header">
        <div className="pd-header-inner">
          <button
            className="pd-logo"
            type="button"
            onClick={() => navigate('/')}
          >
            <span className="pd-logo-icon">🛒</span>
            <span className="pd-logo-name">blinkit</span>
          </button>

          <button
            className="pd-back-button"
            type="button"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <button
            className="pd-cart-button"
            type="button"
            onClick={() => navigate('/cart')}
          >
            <span>🛒</span>
            <span>Cart</span>
          </button>
        </div>
      </header>

      <main className="pd-main">
        <button
          className="pd-mobile-back"
          type="button"
          onClick={() => navigate(-1)}
        >
          ← Back to shopping
        </button>

        <div className="pd-breadcrumb">
          <button type="button" onClick={() => navigate('/')}>
            Home
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={() => {
              navigate('/')
            }}
          >
            {product.category}
          </button>
          <span>/</span>
          <strong>{product.name}</strong>
        </div>

        <section className="pd-product">
          <div className="pd-image-area">
            <div className="pd-image-glow" />

            <div className="pd-image">
              <div className="pd-image-top">
                <span className="pd-fresh-badge">✓ Fresh choice</span>
                {discount > 0 && (
                  <span className="pd-discount">{discount}% OFF</span>
                )}
              </div>

              <span className="pd-product-emoji">{product.emoji}</span>

              <div className="pd-image-bottom">
                <span>⚡ Fast delivery</span>
                <span>💚 Everyday essential</span>
              </div>
            </div>
          </div>

          <div className="pd-content">
            <div className="pd-category-row">
              <span className="pd-category">{product.category}</span>
              <span className="pd-rating">★ 4.8 · Popular</span>
            </div>

            <h1>{product.name}</h1>

            <p className="pd-description">{product.description}</p>

            <div className="pd-delivery">
              <div className="pd-delivery-icon">⚡</div>
              <div>
                <strong>Delivery in 10 minutes</strong>
                <span>Fast delivery to your doorstep</span>
              </div>
              <span className="pd-delivery-check">✓</span>
            </div>

            <div className="pd-divider" />

            <div className="pd-section">
              <div className="pd-section-title-row">
                <div>
                  <h3>Select size</h3>
                  <p>Choose the quantity you want</p>
                </div>
              </div>

              <div className="pd-variants">
                {product.variants.map((variant) => {
                  const isSelected = selectedVariantId === variant.id
                  const variantDiscount =
                    variant.mrp > variant.price
                      ? Math.round(
                          ((variant.mrp - variant.price) / variant.mrp) * 100,
                        )
                      : 0

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={variant.stock <= 0}
                      className={`pd-variant ${
                        isSelected ? 'selected' : ''
                      }`}
                      onClick={() => selectVariant(variant.id)}
                    >
                      <span className="pd-variant-check">
                        {isSelected ? '✓' : ''}
                      </span>

                      <strong>{variant.label}</strong>

                      <div>
                        <b>₹{variant.price}</b>
                        {variant.mrp > variant.price && (
                          <del>₹{variant.mrp}</del>
                        )}
                      </div>

                      {variant.stock <= 0 ? (
                        <small>Out of stock</small>
                      ) : variantDiscount > 0 ? (
                        <em>{variantDiscount}% off</em>
                      ) : (
                        <em className="pd-stock-hint">
                          {variant.stock} left
                        </em>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {selectedVariant && (
              <>
                <div className="pd-price-row">
                  <div>
                    <span className="pd-current-price">
                      ₹{selectedVariant.price}
                    </span>

                    {selectedVariant.mrp > selectedVariant.price && (
                      <span className="pd-mrp">₹{selectedVariant.mrp}</span>
                    )}
                  </div>

                  {discount > 0 && (
                    <span className="pd-save">
                      You save ₹
                      {selectedVariant.mrp - selectedVariant.price}
                    </span>
                  )}
                </div>

                <div className="pd-buy-row">
                  <div className="pd-quantity">
                    <button
                      type="button"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>

                    <span>{quantity}</span>

                    <button
                      type="button"
                      onClick={increaseQuantity}
                      disabled={
                        isOutOfStock ||
                        quantity >= selectedVariant.stock
                      }
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    className={`pd-add ${added ? 'added' : ''}`}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={addToCart}
                  >
                    <span>
                      {added ? '✓ Added to cart' : 'Add to cart'}
                    </span>
                    {!added && <strong>₹{totalPrice}</strong>}
                  </button>
                </div>

                <div className="pd-stock-row">
                  <span
                    className={isOutOfStock ? 'out' : ''}
                  >
                    <i />
                    {isOutOfStock
                      ? 'Currently unavailable'
                      : `${selectedVariant.stock} units available`}
                  </span>

                  {!isOutOfStock && (
                    <span>Maximum {selectedVariant.stock} per order</span>
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        <section className="pd-information">
          <div className="pd-information-heading">
            <div>
              <span className="pd-eyebrow">PRODUCT DETAILS</span>
              <h2>Everything you need to know</h2>
            </div>
            <div className="pd-info-icon">✦</div>
          </div>

          <p>{product.details}</p>

          <div className="pd-info-grid">
            <div>
              <span>Category</span>
              <strong>{product.category}</strong>
            </div>

            <div>
              <span>Delivery</span>
              <strong>10 minutes</strong>
            </div>

            <div>
              <span>Availability</span>
              <strong className={isOutOfStock ? 'text-out' : ''}>
                {isOutOfStock ? 'Out of stock' : 'In stock'}
              </strong>
            </div>

            <div>
              <span>Shopping</span>
              <strong>Easy checkout</strong>
            </div>
          </div>
        </section>

        <section className="pd-benefits">
          <div>
            <span>⚡</span>
            <strong>Fast delivery</strong>
            <small>Get essentials quickly</small>
          </div>
          <div>
            <span>🔒</span>
            <strong>Secure checkout</strong>
            <small>Safe & simple payments</small>
          </div>
          <div>
            <span>🛒</span>
            <strong>Easy shopping</strong>
            <small>Add more items anytime</small>
          </div>
        </section>
      </main>

      {added && (
        <div className="pd-toast">
          <span>✓</span>
          {product.name} added to your cart
          <button type="button" onClick={() => navigate('/cart')}>
            View cart →
          </button>
        </div>
      )}
    </div>
  )
}

const styles = `
  .pd-page {
    --green: #0c831f;
    --green-dark: #076617;
    --green-soft: #eaf8ec;
    --yellow: #f7d708;
    --ink: #202020;
    --muted: #707070;
    min-height: 100vh;
    background:
      radial-gradient(circle at 5% 18%, rgba(247,215,8,.09), transparent 22rem),
      radial-gradient(circle at 95% 30%, rgba(12,131,31,.07), transparent 24rem),
      #fafafa;
    color: var(--ink);
    font-family: Inter, Arial, sans-serif;
  }

  .pd-page *,
  .pd-page *::before,
  .pd-page *::after {
    box-sizing: border-box;
  }

  .pd-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(255,255,255,.94);
    backdrop-filter: blur(18px);
    border-bottom: 1px solid rgba(0,0,0,.07);
  }

  .pd-header-inner {
    max-width: 1440px;
    min-height: 76px;
    margin: 0 auto;
    padding: 12px 32px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .pd-logo {
    margin-right: auto;
    border: 0;
    background: transparent;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    padding: 0;
  }

  .pd-logo-icon {
    width: 43px;
    height: 43px;
    display: grid;
    place-items: center;
    border-radius: 13px;
    background: var(--yellow);
    font-size: 23px;
    box-shadow: 0 7px 18px rgba(247,215,8,.25);
    transition: transform .25s ease;
  }

  .pd-logo:hover .pd-logo-icon {
    transform: rotate(-7deg) scale(1.06);
  }

  .pd-logo-name {
    font-size: 25px;
    font-weight: 900;
    letter-spacing: -1.4px;
  }

  .pd-back-button,
  .pd-cart-button {
    min-height: 43px;
    border: 0;
    border-radius: 11px;
    padding: 0 15px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 800;
    transition: .2s ease;
  }

  .pd-back-button {
    background: #f2f2f2;
    color: #333;
  }

  .pd-back-button:hover {
    background: #e8e8e8;
    transform: translateX(-2px);
  }

  .pd-cart-button {
    background: #111;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .pd-cart-button:hover {
    transform: translateY(-2px);
    background: #242424;
  }

  .pd-main {
    max-width: 1280px;
    margin: 0 auto;
    padding: 24px 32px 100px;
  }

  .pd-mobile-back {
    display: none;
  }

  .pd-breadcrumb {
    display: flex;
    align-items: center;
    gap: 7px;
    color: #999;
    font-size: 11px;
    margin-bottom: 18px;
  }

  .pd-breadcrumb button {
    border: 0;
    background: transparent;
    color: #777;
    padding: 0;
    cursor: pointer;
    font-size: inherit;
  }

  .pd-breadcrumb button:hover {
    color: var(--green);
  }

  .pd-breadcrumb strong {
    color: #333;
    font-weight: 700;
  }

  .pd-product {
    position: relative;
    display: grid;
    grid-template-columns: 52% 48%;
    overflow: hidden;
    border: 1px solid #e9e9e9;
    border-radius: 28px;
    background: #fff;
    box-shadow: 0 16px 50px rgba(0,0,0,.055);
  }

  .pd-image-area {
    min-height: 620px;
    position: relative;
    padding: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: linear-gradient(145deg, #f4faf4, #fff7c9);
  }

  .pd-image-glow {
    position: absolute;
    width: 380px;
    height: 380px;
    border-radius: 50%;
    background: rgba(255,255,255,.72);
    filter: blur(2px);
  }

  .pd-image {
    width: min(100%, 520px);
    height: 540px;
    position: relative;
    z-index: 1;
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,.58);
    border: 1px solid rgba(255,255,255,.8);
    box-shadow: 0 20px 55px rgba(0,0,0,.07);
    overflow: hidden;
    animation: pd-image-in .55s ease both;
  }

  @keyframes pd-image-in {
    from { opacity: 0; transform: scale(.96) translateY(8px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

  .pd-image::before {
    content: "";
    position: absolute;
    width: 280px;
    height: 280px;
    border-radius: 50%;
    background: rgba(12,131,31,.06);
  }

  .pd-image-top {
    position: absolute;
    left: 20px;
    right: 20px;
    top: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pd-fresh-badge,
  .pd-discount {
    padding: 7px 10px;
    border-radius: 999px;
    font-size: 9px;
    font-weight: 900;
  }

  .pd-fresh-badge {
    background: #fff;
    color: var(--green);
    box-shadow: 0 6px 15px rgba(0,0,0,.06);
  }

  .pd-discount {
    background: var(--green);
    color: #fff;
  }

  .pd-product-emoji {
    position: relative;
    z-index: 2;
    font-size: 190px;
    filter: drop-shadow(0 22px 20px rgba(0,0,0,.13));
    animation: pd-float 3.4s ease-in-out infinite;
  }

  @keyframes pd-float {
    0%,100% { transform: translateY(0) rotate(-3deg); }
    50% { transform: translateY(-12px) rotate(3deg); }
  }

  .pd-image-bottom {
    position: absolute;
    left: 20px;
    right: 20px;
    bottom: 18px;
    display: flex;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .pd-image-bottom span {
    padding: 7px 10px;
    border-radius: 999px;
    background: rgba(255,255,255,.86);
    color: #555;
    font-size: 9px;
    font-weight: 750;
  }

  .pd-content {
    padding: 48px 45px;
  }

  .pd-category-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .pd-category {
    color: var(--green);
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .pd-rating {
    padding: 6px 9px;
    border-radius: 8px;
    background: #fff8cf;
    color: #7a6500;
    font-size: 9px;
    font-weight: 800;
  }

  .pd-content h1 {
    margin: 12px 0 10px;
    font-size: clamp(30px, 3vw, 43px);
    line-height: 1.05;
    letter-spacing: -1.8px;
  }

  .pd-description {
    max-width: 520px;
    margin: 0;
    color: #686868;
    font-size: 13px;
    line-height: 1.65;
  }

  .pd-delivery {
    margin-top: 22px;
    padding: 13px;
    border: 1px solid #dcefdc;
    border-radius: 13px;
    background: #f4fbf4;
    display: flex;
    align-items: center;
    gap: 11px;
  }

  .pd-delivery-icon {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    flex: 0 0 38px;
    border-radius: 11px;
    background: var(--green);
    color: #fff;
    font-size: 17px;
  }

  .pd-delivery div:nth-child(2) {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .pd-delivery strong {
    font-size: 12px;
  }

  .pd-delivery span {
    color: #777;
    font-size: 10px;
  }

  .pd-delivery-check {
    margin-left: auto;
    color: var(--green) !important;
    font-size: 17px !important;
    font-weight: 900;
  }

  .pd-divider {
    height: 1px;
    margin: 24px 0;
    background: #ededed;
  }

  .pd-section-title-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .pd-section h3 {
    margin: 0;
    font-size: 14px;
  }

  .pd-section-title-row p {
    margin: 4px 0 0;
    color: #999;
    font-size: 10px;
  }

  .pd-variants {
    display: grid;
    grid-template-columns: repeat(2, minmax(0,1fr));
    gap: 9px;
  }

  .pd-variant {
    min-height: 93px;
    position: relative;
    border: 1px solid #e1e1e1;
    border-radius: 13px;
    background: #fff;
    padding: 12px;
    cursor: pointer;
    text-align: left;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 4px;
    transition: .2s ease;
  }

  .pd-variant:hover:not(:disabled) {
    border-color: rgba(12,131,31,.5);
    transform: translateY(-2px);
  }

  .pd-variant.selected {
    border: 2px solid var(--green);
    background: #f6fcf6;
    padding: 11px;
    box-shadow: 0 5px 16px rgba(12,131,31,.08);
  }

  .pd-variant:disabled {
    opacity: .45;
    cursor: not-allowed;
  }

  .pd-variant-check {
    position: absolute;
    top: 9px;
    right: 9px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: var(--green);
    color: #fff;
    font-size: 9px;
    font-weight: 900;
  }

  .pd-variant strong {
    font-size: 12px;
  }

  .pd-variant div {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .pd-variant b {
    font-size: 13px;
  }

  .pd-variant del {
    color: #999;
    font-size: 9px;
  }

  .pd-variant small {
    color: #b00020;
    font-size: 8px;
  }

  .pd-variant em {
    color: var(--green);
    font-size: 8px;
    font-style: normal;
    font-weight: 850;
  }

  .pd-stock-hint {
    color: #999 !important;
    font-weight: 600 !important;
  }

  .pd-price-row {
    margin-top: 23px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .pd-current-price {
    font-size: 29px;
    font-weight: 900;
    letter-spacing: -.8px;
  }

  .pd-mrp {
    margin-left: 9px;
    color: #999;
    font-size: 12px;
    text-decoration: line-through;
  }

  .pd-save {
    padding: 7px 9px;
    border-radius: 8px;
    background: var(--green-soft);
    color: var(--green);
    font-size: 9px;
    font-weight: 850;
  }

  .pd-buy-row {
    display: flex;
    gap: 10px;
    margin-top: 15px;
  }

  .pd-quantity {
    height: 50px;
    min-width: 125px;
    border: 1px solid #dedede;
    border-radius: 11px;
    background: #fff;
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  .pd-quantity button {
    width: 40px;
    height: 100%;
    border: 0;
    background: #f5f5f5;
    color: #222;
    cursor: pointer;
    font-size: 21px;
  }

  .pd-quantity button:hover:not(:disabled) {
    background: #e9e9e9;
  }

  .pd-quantity button:disabled {
    opacity: .35;
    cursor: not-allowed;
  }

  .pd-quantity span {
    flex: 1;
    text-align: center;
    font-size: 13px;
    font-weight: 850;
  }

  .pd-add {
    flex: 1;
    min-height: 50px;
    border: 0;
    border-radius: 11px;
    background: var(--green);
    color: #fff;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    font-weight: 850;
    box-shadow: 0 10px 22px rgba(12,131,31,.18);
    transition: .2s ease;
  }

  .pd-add:hover:not(:disabled) {
    background: var(--green-dark);
    transform: translateY(-2px);
  }

  .pd-add strong {
    font-size: 11px;
  }

  .pd-add.added {
    background: #111;
  }

  .pd-add:disabled {
    opacity: .4;
    cursor: not-allowed;
    box-shadow: none;
  }

  .pd-stock-row {
    margin-top: 9px;
    display: flex;
    justify-content: space-between;
    gap: 10px;
    color: #999;
    font-size: 9px;
  }

  .pd-stock-row span:first-child {
    color: var(--green);
    font-weight: 750;
  }

  .pd-stock-row span:first-child.out {
    color: #b00020;
  }

  .pd-stock-row i {
    display: inline-block;
    width: 6px;
    height: 6px;
    margin-right: 5px;
    border-radius: 50%;
    background: currentColor;
  }

  .pd-information {
    margin-top: 18px;
    padding: 30px 32px;
    border: 1px solid #e9e9e9;
    border-radius: 22px;
    background: #fff;
    box-shadow: 0 10px 35px rgba(0,0,0,.035);
  }

  .pd-information-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .pd-eyebrow {
    color: var(--green);
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 1px;
  }

  .pd-information h2 {
    margin: 6px 0 0;
    font-size: 22px;
    letter-spacing: -.7px;
  }

  .pd-info-icon {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    border-radius: 13px;
    background: #fff7c9;
    font-size: 19px;
  }

  .pd-information > p {
    max-width: 850px;
    margin: 12px 0 0;
    color: #666;
    font-size: 12px;
    line-height: 1.65;
  }

  .pd-info-grid {
    display: grid;
    grid-template-columns: repeat(4,1fr);
    gap: 10px;
    margin-top: 22px;
  }

  .pd-info-grid div {
    padding: 15px;
    border-radius: 13px;
    background: #f7f7f7;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .pd-info-grid span {
    color: #999;
    font-size: 9px;
  }

  .pd-info-grid strong {
    font-size: 12px;
  }

  .pd-info-grid .text-out {
    color: #b00020;
  }

  .pd-benefits {
    margin-top: 14px;
    display: grid;
    grid-template-columns: repeat(3,1fr);
    gap: 10px;
  }

  .pd-benefits div {
    min-height: 92px;
    padding: 17px;
    border: 1px solid #ededed;
    border-radius: 16px;
    background: #fff;
    display: grid;
    grid-template-columns: 38px 1fr;
    grid-template-rows: auto auto;
    column-gap: 10px;
  }

  .pd-benefits span {
    grid-row: 1 / 3;
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border-radius: 11px;
    background: var(--green-soft);
  }

  .pd-benefits strong {
    align-self: end;
    font-size: 11px;
  }

  .pd-benefits small {
    margin-top: 3px;
    color: #999;
    font-size: 9px;
  }

  .pd-toast {
    position: fixed;
    left: 50%;
    bottom: 24px;
    z-index: 200;
    transform: translateX(-50%);
    min-height: 50px;
    width: min(480px, calc(100vw - 28px));
    padding: 9px 11px;
    border-radius: 14px;
    background: #111;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 9px;
    box-shadow: 0 15px 40px rgba(0,0,0,.24);
    animation: pd-toast-in .25s ease;
    font-size: 11px;
    font-weight: 700;
  }

  .pd-toast > span {
    width: 31px;
    height: 31px;
    flex: 0 0 31px;
    display: grid;
    place-items: center;
    border-radius: 9px;
    background: var(--green);
  }

  .pd-toast button {
    margin-left: auto;
    border: 0;
    background: var(--yellow);
    color: #111;
    border-radius: 8px;
    padding: 8px 10px;
    cursor: pointer;
    font-size: 9px;
    font-weight: 900;
  }

  @keyframes pd-toast-in {
    from { opacity: 0; transform: translate(-50%, 12px); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }

  .pd-not-found {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 25px;
  }

  .pd-not-found-card {
    width: min(440px, 100%);
    padding: 45px 30px;
    border: 1px solid #e8e8e8;
    border-radius: 24px;
    background: #fff;
    text-align: center;
    box-shadow: 0 20px 55px rgba(0,0,0,.07);
  }

  .pd-not-found-icon {
    font-size: 58px;
  }

  .pd-not-found-label {
    display: inline-block;
    margin-top: 15px;
    color: var(--green);
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 1px;
  }

  .pd-not-found h2 {
    margin: 8px 0 6px;
    font-size: 24px;
  }

  .pd-not-found p {
    margin: 0;
    color: #777;
    font-size: 12px;
  }

  .pd-not-found button {
    margin-top: 20px;
    border: 0;
    border-radius: 11px;
    background: #111;
    color: #fff;
    padding: 12px 17px;
    cursor: pointer;
    font-size: 11px;
    font-weight: 800;
  }

  @media (max-width: 1050px) {
    .pd-product {
      grid-template-columns: 48% 52%;
    }

    .pd-image-area {
      min-height: 570px;
      padding: 22px;
    }

    .pd-image {
      height: 490px;
    }

    .pd-content {
      padding: 38px 30px;
    }
  }

  @media (max-width: 850px) {
    .pd-header-inner {
      padding: 10px 16px;
    }

    .pd-main {
      padding: 18px 16px 90px;
    }

    .pd-product {
      grid-template-columns: 1fr;
    }

    .pd-image-area {
      min-height: 440px;
    }

    .pd-image {
      height: 390px;
    }

    .pd-product-emoji {
      font-size: 150px;
    }

    .pd-info-grid {
      grid-template-columns: repeat(2,1fr);
    }
  }

  @media (max-width: 600px) {
    .pd-header-inner {
      min-height: 65px;
      padding: 10px 14px;
    }

    .pd-logo-name {
      display: none;
    }

    .pd-back-button {
      display: none;
    }

    .pd-cart-button {
      min-height: 40px;
      padding: 0 12px;
    }

    .pd-main {
      padding: 13px 13px 85px;
    }

    .pd-mobile-back {
      display: block;
      margin: 0 0 12px;
      border: 0;
      background: transparent;
      padding: 0;
      color: #666;
      cursor: pointer;
      font-size: 11px;
      font-weight: 700;
    }

    .pd-breadcrumb {
      display: none;
    }

    .pd-product {
      border-radius: 22px;
    }

    .pd-image-area {
      min-height: 340px;
      padding: 15px;
    }

    .pd-image {
      height: 310px;
      border-radius: 19px;
    }

    .pd-product-emoji {
      font-size: 115px;
    }

    .pd-image-bottom span {
      font-size: 8px;
      padding: 6px 8px;
    }

    .pd-content {
      padding: 25px 18px;
    }

    .pd-content h1 {
      font-size: 29px;
    }

    .pd-category-row {
      align-items: flex-start;
    }

    .pd-rating {
      font-size: 8px;
    }

    .pd-variants {
      grid-template-columns: 1fr 1fr;
    }

    .pd-price-row {
      align-items: flex-start;
    }

    .pd-current-price {
      font-size: 26px;
    }

    .pd-buy-row {
      flex-direction: column;
    }

    .pd-quantity {
      width: 100%;
      justify-content: center;
    }

    .pd-quantity button {
      width: 42%;
    }

    .pd-quantity span {
      width: 16%;
      flex: 0 0 16%;
    }

    .pd-add {
      width: 100%;
    }

    .pd-stock-row {
      flex-direction: column;
      gap: 5px;
    }

    .pd-information {
      padding: 22px 17px;
      border-radius: 19px;
    }

    .pd-information h2 {
      font-size: 19px;
    }

    .pd-info-grid {
      grid-template-columns: 1fr 1fr;
    }

    .pd-benefits {
      grid-template-columns: 1fr;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pd-product-emoji,
    .pd-image,
    .pd-toast {
      animation: none !important;
    }
  }
`
