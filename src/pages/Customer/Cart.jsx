import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

function money(value) {
  return `₹${Math.round(value)}`
}

export default function Cart() {
  const navigate = useNavigate()
  const [cart, setCart] = useState(getCart)
  const [removing, setRemoving] = useState(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  useEffect(() => {
    const updateCart = () => setCart(getCart())

    window.addEventListener('cartUpdated', updateCart)
    window.addEventListener('storage', updateCart)

    return () => {
      window.removeEventListener('cartUpdated', updateCart)
      window.removeEventListener('storage', updateCart)
    }
  }, [])

  const itemCount = useMemo(
    () => cart.reduce((total, item) => total + Number(item.quantity || 0), 0),
    [cart],
  )

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total + Number(item.price || 0) * Number(item.quantity || 0),
        0,
      ),
    [cart],
  )

  const mrpTotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total + Number(item.mrp || item.price || 0) * Number(item.quantity || 0),
        0,
      ),
    [cart],
  )

  const savings = Math.max(0, mrpTotal - subtotal)
  const freeDeliveryThreshold = 199
  const amountForFreeDelivery = Math.max(
    0,
    freeDeliveryThreshold - subtotal,
  )
  const deliveryFee = subtotal >= freeDeliveryThreshold ? 0 : 25
  const handlingFee = subtotal > 0 ? 4 : 0
  const grandTotal = subtotal + deliveryFee + handlingFee
  const freeDeliveryProgress = Math.min(
    100,
    (subtotal / freeDeliveryThreshold) * 100,
  )

  function updateQuantity(variantId, change) {
    const updatedCart = cart
      .map((item) => {
        if (item.variantId !== variantId) {
          return item
        }

        const currentQuantity = Number(item.quantity || 0)
        const stock =
          Number.isFinite(Number(item.stock)) && Number(item.stock) > 0
            ? Number(item.stock)
            : Number.POSITIVE_INFINITY

        const nextQuantity = Math.max(
          0,
          Math.min(currentQuantity + change, stock),
        )

        if (nextQuantity <= 0) {
          return null
        }

        return {
          ...item,
          quantity: nextQuantity,
        }
      })
      .filter(Boolean)

    saveCart(updatedCart)
    setCart(updatedCart)
  }

  function removeItem(variantId) {
    setRemoving(variantId)

    window.setTimeout(() => {
      const updatedCart = cart.filter(
        (item) => item.variantId !== variantId,
      )

      saveCart(updatedCart)
      setCart(updatedCart)
      setRemoving(null)
    }, 180)
  }

  function clearCart() {
    saveCart([])
    setCart([])
    setShowClearConfirm(false)
  }

  function continueShopping() {
    navigate('/')
  }

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <header className="cart-header">
          <div className="cart-header-inner">
            <button
              className="cart-logo"
              type="button"
              onClick={() => navigate('/')}
              aria-label="Go to Blinkit home"
            >
              <span className="cart-logo-mark">
                <span className="cart-logo-b">B</span>
              </span>
              <span className="cart-logo-word">blink<span>it</span></span>
            </button>

            <button
              className="cart-back-button"
              type="button"
              onClick={() => navigate('/')}
            >
              <span>←</span>
              Continue shopping
            </button>
          </div>
        </header>

        <main className="cart-empty-page">
          <div className="empty-orbit empty-orbit-one" />
          <div className="empty-orbit empty-orbit-two" />

          <div className="empty-cart-illustration" aria-hidden="true">
            <div className="empty-cart-bag">🛒</div>
            <span className="empty-float empty-float-one">🥛</span>
            <span className="empty-float empty-float-two">🍎</span>
            <span className="empty-float empty-float-three">🥦</span>
          </div>

          <div className="empty-cart-copy">
            <span className="empty-eyebrow">YOUR CART IS WAITING</span>
            <h1>Nothing here yet.</h1>
            <p>
              Add your everyday essentials and we’ll get them to your
              doorstep in minutes.
            </p>

            <button
              type="button"
              className="cart-primary-button"
              onClick={continueShopping}
            >
              Start shopping
              <span>→</span>
            </button>
          </div>

          <div className="empty-benefits">
            <div>
              <span>⚡</span>
              <p>
                <strong>Fast delivery</strong>
                <small>Everyday essentials in minutes</small>
              </p>
            </div>
            <div>
              <span>💚</span>
              <p>
                <strong>Fresh picks</strong>
                <small>Quality products, simple shopping</small>
              </p>
            </div>
            <div>
              <span>🔒</span>
              <p>
                <strong>Secure checkout</strong>
                <small>Safe and reliable payments</small>
              </p>
            </div>
          </div>
        </main>

        <style>{styles}</style>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <header className="cart-header">
        <div className="cart-header-inner">
          <button
            className="cart-logo"
            type="button"
            onClick={() => navigate('/')}
            aria-label="Go to Blinkit home"
          >
            <span className="cart-logo-mark">
              <span className="cart-logo-b">B</span>
            </span>
            <span className="cart-logo-word">blink<span>it</span></span>
          </button>

          <button
            className="cart-back-button"
            type="button"
            onClick={() => navigate('/')}
          >
            <span>←</span>
            Continue shopping
          </button>

          <div className="cart-header-status">
            <span className="status-dot" />
            <span>Fast delivery</span>
          </div>
        </div>
      </header>

      <main className="cart-main">
        <div className="cart-breadcrumb">
          <button type="button" onClick={() => navigate('/')}>
            Home
          </button>
          <span>›</span>
          <strong>Cart</strong>
        </div>

        <div className="cart-heading-row">
          <div>
            <span className="cart-eyebrow">READY TO CHECK OUT?</span>
            <h1>Your cart</h1>
            <p>
              {itemCount} {itemCount === 1 ? 'item' : 'items'} selected for
              delivery
            </p>
          </div>

          <button
            type="button"
            className="clear-cart-button"
            onClick={() => setShowClearConfirm(true)}
          >
            <span>⌫</span>
            Clear cart
          </button>
        </div>

        <section className="delivery-progress-card">
          <div className="delivery-progress-icon">⚡</div>

          <div className="delivery-progress-content">
            <div className="delivery-progress-top">
              <div>
                <strong>
                  {deliveryFee === 0
                    ? 'You unlocked FREE delivery'
                    : `Add ${money(amountForFreeDelivery)} more for FREE delivery`}
                </strong>
                <span>
                  {deliveryFee === 0
                    ? 'Your order qualifies for free delivery.'
                    : 'Free delivery on orders above ₹199.'}
                </span>
              </div>

              <b>{Math.round(freeDeliveryProgress)}%</b>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${freeDeliveryProgress}%` }}
              />
              <span
                className="progress-marker"
                style={{ left: `${freeDeliveryProgress}%` }}
              />
            </div>
          </div>

          <div className="delivery-bike" aria-hidden="true">
            🛵
          </div>
        </section>

        <div className="cart-layout">
          <section className="cart-items-section">
            <div className="section-card-head">
              <div>
                <h2>Items in your cart</h2>
                <p>Fresh picks, ready to go.</p>
              </div>

              <span className="item-count-pill">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>

            <div className="cart-items">
              {cart.map((item) => {
                const itemTotal =
                  Number(item.price || 0) * Number(item.quantity || 0)
                const itemMrp =
                  Number(item.mrp || item.price || 0) *
                  Number(item.quantity || 0)
                const itemSaving = Math.max(0, itemMrp - itemTotal)
                const itemDiscount =
                  item.mrp > item.price
                    ? Math.round(
                        ((item.mrp - item.price) / item.mrp) * 100,
                      )
                    : 0

                return (
                  <article
                    className={`cart-item ${
                      removing === item.variantId ? 'is-removing' : ''
                    }`}
                    key={item.variantId}
                  >
                    <div className="cart-item-image">
                      <div className="product-glow" />
                      <span>{item.emoji || '🛍️'}</span>

                      {itemDiscount > 0 && (
                        <span className="item-discount">
                          {itemDiscount}% OFF
                        </span>
                      )}
                    </div>

                    <div className="cart-item-content">
                      <div className="cart-item-top">
                        <div className="cart-item-details">
                          <span className="item-delivery">
                            <span>⚡</span> 10 min delivery
                          </span>

                          <h3>{item.name}</h3>

                          <p>
                            {item.variant}
                            {item.category ? ` · ${item.category}` : ''}
                          </p>
                        </div>

                        <button
                          type="button"
                          className="remove-item"
                          onClick={() => removeItem(item.variantId)}
                          aria-label={`Remove ${item.name}`}
                        >
                          <span>×</span>
                        </button>
                      </div>

                      <div className="cart-item-bottom">
                        <div className="item-price-block">
                          <div className="item-price-line">
                            <strong>{money(item.price)}</strong>
                            {item.mrp > item.price && (
                              <span>{money(item.mrp)}</span>
                            )}
                          </div>

                          {itemSaving > 0 && (
                            <small>You save {money(itemSaving)}</small>
                          )}
                        </div>

                        <div className="cart-quantity">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.variantId, -1)
                            }
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            −
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.variantId, 1)
                            }
                            disabled={
                              Number(item.stock) > 0 &&
                              Number(item.quantity) >= Number(item.stock)
                            }
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="cart-item-total">
                      <span>Item total</span>
                      <strong>{money(itemTotal)}</strong>
                    </div>
                  </article>
                )
              })}
            </div>

            <button
              type="button"
              className="continue-shopping-card"
              onClick={continueShopping}
            >
              <span className="continue-icon">＋</span>
              <span>
                <strong>Add more items</strong>
                <small>Browse groceries and everyday essentials</small>
              </span>
              <b>→</b>
            </button>

            <div className="cart-trust-grid">
              <div>
                <span>🥬</span>
                <strong>Fresh & quality</strong>
                <small>Carefully selected products</small>
              </div>
              <div>
                <span>⚡</span>
                <strong>Quick delivery</strong>
                <small>Get your order in minutes</small>
              </div>
              <div>
                <span>🔒</span>
                <strong>Secure payment</strong>
                <small>Your checkout is protected</small>
              </div>
            </div>
          </section>

          <aside className="bill-section">
            <div className="bill-card">
              <div className="bill-card-heading">
                <div>
                  <span className="bill-eyebrow">ORDER SUMMARY</span>
                  <h2>Bill details</h2>
                </div>
                <span className="bill-check">✓</span>
              </div>

              <div className="bill-rows">
                <div className="bill-row">
                  <span>Item total</span>
                  <strong>{money(subtotal)}</strong>
                </div>

                {savings > 0 && (
                  <div className="bill-row saving">
                    <span>Product savings</span>
                    <strong>− {money(savings)}</strong>
                  </div>
                )}

                <div className="bill-row">
                  <span>Delivery fee</span>
                  <strong className={deliveryFee === 0 ? 'free-text' : ''}>
                    {deliveryFee === 0 ? 'FREE' : money(deliveryFee)}
                  </strong>
                </div>

                <div className="bill-row">
                  <span>
                    Handling charge
                    <small> · packing & service</small>
                  </span>
                  <strong>{money(handlingFee)}</strong>
                </div>
              </div>

              <div className="bill-divider" />

              <div className="total-row">
                <div>
                  <span>Grand total</span>
                  <small>Inclusive of all applicable charges</small>
                </div>
                <strong>{money(grandTotal)}</strong>
              </div>

              {savings > 0 && (
                <div className="total-saving-banner">
                  <span>🎉</span>
                  <strong>You’re saving {money(savings)} on this order</strong>
                </div>
              )}

              <button
                type="button"
                className="checkout-button"
                onClick={() => navigate('/checkout')}
              >
                <span>Proceed to checkout</span>
                <b>→</b>
              </button>

              <p className="checkout-note">
                🔒 Safe & secure checkout
              </p>
            </div>

            <div className="delivery-summary-card">
              <div className="summary-icon">⚡</div>
              <div>
                <strong>Delivery in 10 minutes</strong>
                <p>We’ll deliver your order right to your doorstep.</p>
              </div>
            </div>

            <div className="payment-strip">
              <span>UPI</span>
              <span>Cards</span>
              <span>Wallets</span>
              <span>COD</span>
            </div>
          </aside>
        </div>
      </main>

      {showClearConfirm && (
        <div
          className="clear-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowClearConfirm(false)
            }
          }}
        >
          <div className="clear-modal" role="dialog" aria-modal="true">
            <div className="clear-modal-icon">🛒</div>
            <h2>Clear your cart?</h2>
            <p>
              All items currently in your cart will be removed. You can add
              them again anytime.
            </p>

            <div className="clear-modal-actions">
              <button
                type="button"
                className="cancel-clear"
                onClick={() => setShowClearConfirm(false)}
              >
                Keep items
              </button>
              <button
                type="button"
                className="confirm-clear"
                onClick={clearCart}
              >
                Clear cart
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{styles}</style>
    </div>
  )
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .cart-page {
    min-height: 100vh;
    background:
      radial-gradient(circle at 5% 5%, rgba(245, 217, 10, .12), transparent 22%),
      radial-gradient(circle at 95% 20%, rgba(0, 176, 74, .07), transparent 24%),
      #f7f8f6;
    color: #182018;
    font-family: Inter, Arial, sans-serif;
  }

  .cart-page button {
    font-family: inherit;
  }

  .cart-header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(255, 255, 255, .94);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(0, 0, 0, .07);
  }

  .cart-header-inner {
    max-width: 1220px;
    min-height: 74px;
    margin: 0 auto;
    padding: 12px 26px;
    display: flex;
    align-items: center;
    gap: 22px;
  }

  .cart-logo {
    border: 0;
    background: transparent;
    padding: 0;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .cart-logo-mark {
    width: 41px;
    height: 41px;
    border-radius: 13px;
    display: grid;
    place-items: center;
    background: #f5d90a;
    box-shadow: 0 7px 20px rgba(245, 217, 10, .25);
    transform: rotate(-4deg);
    transition: transform .25s ease;
  }

  .cart-logo:hover .cart-logo-mark {
    transform: rotate(4deg) scale(1.05);
  }

  .cart-logo-b {
    color: #111;
    font-size: 22px;
    font-weight: 950;
    letter-spacing: -2px;
  }

  .cart-logo-word {
    color: #111;
    font-size: 22px;
    font-weight: 900;
    letter-spacing: -1.2px;
  }

  .cart-logo-word span {
    color: #159447;
  }

  .cart-back-button {
    border: 1px solid #e9ebe7;
    background: #fff;
    color: #252b25;
    border-radius: 11px;
    padding: 10px 14px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 800;
    transition: transform .2s ease, border-color .2s ease, background .2s ease;
  }

  .cart-back-button:hover {
    transform: translateY(-1px);
    border-color: #cfe1d4;
    background: #f9fcfa;
  }

  .cart-back-button span {
    font-size: 16px;
  }

  .cart-header-status {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #3e483f;
    font-size: 12px;
    font-weight: 700;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #19a44d;
    box-shadow: 0 0 0 5px rgba(25, 164, 77, .10);
    animation: statusPulse 1.8s infinite;
  }

  .cart-main {
    max-width: 1220px;
    margin: 0 auto;
    padding: 24px 26px 80px;
  }

  .cart-breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 17px;
    color: #899089;
    font-size: 11px;
  }

  .cart-breadcrumb button {
    border: 0;
    padding: 0;
    background: transparent;
    color: #727a73;
    cursor: pointer;
    font-weight: 700;
  }

  .cart-breadcrumb button:hover {
    color: #149447;
  }

  .cart-breadcrumb strong {
    color: #222a23;
  }

  .cart-heading-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 22px;
  }

  .cart-eyebrow,
  .bill-eyebrow {
    display: block;
    color: #129447;
    font-size: 9px;
    font-weight: 950;
    letter-spacing: 1.5px;
    margin-bottom: 6px;
  }

  .cart-heading-row h1 {
    margin: 0;
    font-size: clamp(30px, 4vw, 42px);
    line-height: .98;
    letter-spacing: -1.8px;
    font-weight: 900;
  }

  .cart-heading-row p {
    margin: 9px 0 0;
    color: #747d75;
    font-size: 12px;
  }

  .clear-cart-button {
    border: 0;
    background: #fff1f0;
    color: #bc3630;
    border-radius: 10px;
    padding: 10px 13px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 11px;
    font-weight: 800;
    transition: transform .2s ease, background .2s ease;
  }

  .clear-cart-button:hover {
    background: #ffe7e5;
    transform: translateY(-1px);
  }

  .clear-cart-button span {
    font-size: 15px;
  }

  .delivery-progress-card {
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 17px 20px;
    margin-bottom: 20px;
    border: 1px solid #dcefe1;
    border-radius: 17px;
    background:
      linear-gradient(105deg, #effaf1, #fbfff8 62%, #fffdf0);
    box-shadow: 0 10px 30px rgba(30, 100, 45, .05);
  }

  .delivery-progress-card::after {
    content: '';
    position: absolute;
    width: 180px;
    height: 180px;
    border-radius: 50%;
    right: -80px;
    top: -105px;
    background: rgba(245, 217, 10, .15);
  }

  .delivery-progress-icon {
    width: 45px;
    height: 45px;
    border-radius: 13px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    background: #f5d90a;
    font-size: 22px;
    box-shadow: 0 7px 20px rgba(245, 217, 10, .20);
  }

  .delivery-progress-content {
    position: relative;
    z-index: 1;
    min-width: 0;
    flex: 1;
  }

  .delivery-progress-top {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 9px;
  }

  .delivery-progress-top div {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .delivery-progress-top strong {
    font-size: 12px;
    color: #1d3222;
  }

  .delivery-progress-top span {
    color: #718075;
    font-size: 10px;
  }

  .delivery-progress-top > b {
    color: #159447;
    font-size: 11px;
    white-space: nowrap;
  }

  .progress-track {
    position: relative;
    height: 7px;
    border-radius: 999px;
    background: #dce9de;
    overflow: visible;
  }

  .progress-fill {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #13a34b, #5ecb74);
    transition: width .45s ease;
  }

  .progress-marker {
    position: absolute;
    top: 50%;
    width: 15px;
    height: 15px;
    border: 3px solid #fff;
    border-radius: 50%;
    background: #18a34c;
    box-shadow: 0 2px 8px rgba(24, 163, 76, .25);
    transform: translate(-50%, -50%);
    transition: left .45s ease;
  }

  .delivery-bike {
    position: relative;
    z-index: 1;
    font-size: 28px;
    animation: bikeFloat 2.4s ease-in-out infinite;
  }

  .cart-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.55fr) minmax(330px, .78fr);
    gap: 22px;
    align-items: start;
  }

  .cart-items-section {
    min-width: 0;
  }

  .section-card-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 12px;
  }

  .section-card-head h2 {
    margin: 0;
    font-size: 18px;
    letter-spacing: -.5px;
  }

  .section-card-head p {
    margin: 4px 0 0;
    color: #8a928b;
    font-size: 10px;
  }

  .item-count-pill {
    padding: 7px 10px;
    border-radius: 999px;
    background: #eaf7ed;
    color: #158d45;
    font-size: 10px;
    font-weight: 850;
    white-space: nowrap;
  }

  .cart-items {
    display: flex;
    flex-direction: column;
    gap: 11px;
  }

  .cart-item {
    position: relative;
    overflow: hidden;
    display: grid;
    grid-template-columns: 108px minmax(0, 1fr) auto;
    gap: 16px;
    padding: 14px;
    background: rgba(255, 255, 255, .95);
    border: 1px solid #e6e9e5;
    border-radius: 17px;
    box-shadow: 0 7px 22px rgba(25, 45, 30, .035);
    animation: itemIn .38s ease both;
    transition: transform .2s ease, box-shadow .2s ease, opacity .18s ease;
  }

  .cart-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 13px 30px rgba(25, 45, 30, .07);
  }

  .cart-item.is-removing {
    opacity: 0;
    transform: translateX(20px) scale(.97);
  }

  .cart-item-image {
    position: relative;
    width: 108px;
    height: 108px;
    border-radius: 14px;
    overflow: hidden;
    display: grid;
    place-items: center;
    background:
      radial-gradient(circle at 50% 35%, #fff, #f2f7f1 70%);
    border: 1px solid #edf0ec;
  }

  .product-glow {
    position: absolute;
    width: 65px;
    height: 65px;
    border-radius: 50%;
    background: rgba(245, 217, 10, .18);
    filter: blur(2px);
  }

  .cart-item-image > span:not(.item-discount) {
    position: relative;
    z-index: 1;
    font-size: 53px;
    line-height: 1;
    filter: drop-shadow(0 8px 8px rgba(0, 0, 0, .08));
    animation: productFloat 3.2s ease-in-out infinite;
  }

  .item-discount {
    position: absolute;
    left: 8px;
    bottom: 8px;
    z-index: 2;
    padding: 4px 6px;
    border-radius: 6px;
    background: #159447;
    color: #fff;
    font-size: 8px;
    font-weight: 900;
  }

  .cart-item-content {
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .cart-item-top {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }

  .cart-item-details {
    min-width: 0;
  }

  .item-delivery {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #159447;
    font-size: 8px;
    font-weight: 850;
    letter-spacing: .2px;
  }

  .item-delivery span {
    font-size: 9px;
  }

  .cart-item-details h3 {
    margin: 7px 0 4px;
    font-size: 15px;
    line-height: 1.2;
    color: #202720;
  }

  .cart-item-details p {
    margin: 0;
    color: #8a928c;
    font-size: 10px;
  }

  .remove-item {
    width: 28px;
    height: 28px;
    border: 0;
    border-radius: 9px;
    background: #f7f8f7;
    color: #7b827c;
    cursor: pointer;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    transition: background .2s ease, color .2s ease, transform .2s ease;
  }

  .remove-item:hover {
    background: #fff0ef;
    color: #c23730;
    transform: rotate(5deg);
  }

  .remove-item span {
    font-size: 20px;
    line-height: 1;
    margin-top: -2px;
  }

  .cart-item-bottom {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    margin-top: 14px;
  }

  .item-price-line {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .item-price-line strong {
    color: #151b16;
    font-size: 17px;
  }

  .item-price-line span {
    color: #a0a6a1;
    text-decoration: line-through;
    font-size: 10px;
  }

  .item-price-block small {
    display: block;
    margin-top: 3px;
    color: #159447;
    font-size: 8px;
    font-weight: 800;
  }

  .cart-quantity {
    display: inline-flex;
    align-items: center;
    height: 35px;
    border-radius: 10px;
    overflow: hidden;
    background: #111713;
    color: #fff;
    box-shadow: 0 5px 14px rgba(0, 0, 0, .11);
  }

  .cart-quantity button {
    width: 33px;
    height: 100%;
    border: 0;
    background: transparent;
    color: #fff;
    cursor: pointer;
    font-size: 17px;
    transition: background .18s ease;
  }

  .cart-quantity button:hover:not(:disabled) {
    background: #263129;
  }

  .cart-quantity button:disabled {
    color: #5d655f;
    cursor: not-allowed;
  }

  .cart-quantity span {
    min-width: 30px;
    text-align: center;
    font-size: 11px;
    font-weight: 900;
  }

  .cart-item-total {
    min-width: 78px;
    align-self: flex-end;
    text-align: right;
    padding-bottom: 4px;
  }

  .cart-item-total span {
    display: block;
    color: #9aa09b;
    font-size: 8px;
    margin-bottom: 3px;
  }

  .cart-item-total strong {
    font-size: 13px;
    color: #283028;
  }

  .continue-shopping-card {
    width: 100%;
    margin-top: 11px;
    border: 1px dashed #c9dfce;
    border-radius: 15px;
    background: #f7fcf8;
    padding: 13px 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    text-align: left;
    transition: transform .2s ease, background .2s ease, border-color .2s ease;
  }

  .continue-shopping-card:hover {
    transform: translateY(-1px);
    background: #f0faf2;
    border-color: #a9ceb1;
  }

  .continue-icon {
    width: 35px;
    height: 35px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background: #e0f3e5;
    color: #159447;
    font-size: 20px;
    font-weight: 500;
  }

  .continue-shopping-card > span:nth-child(2) {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .continue-shopping-card strong {
    color: #243027;
    font-size: 11px;
  }

  .continue-shopping-card small {
    color: #859087;
    font-size: 9px;
  }

  .continue-shopping-card > b {
    margin-left: auto;
    color: #159447;
    font-size: 17px;
  }

  .cart-trust-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 9px;
    margin-top: 12px;
  }

  .cart-trust-grid > div {
    padding: 13px;
    border: 1px solid #e7ebe7;
    border-radius: 14px;
    background: rgba(255, 255, 255, .8);
  }

  .cart-trust-grid span {
    display: block;
    font-size: 20px;
    margin-bottom: 7px;
  }

  .cart-trust-grid strong,
  .cart-trust-grid small {
    display: block;
  }

  .cart-trust-grid strong {
    font-size: 9px;
    color: #303a31;
  }

  .cart-trust-grid small {
    margin-top: 3px;
    color: #919891;
    font-size: 8px;
    line-height: 1.4;
  }

  .bill-section {
    position: sticky;
    top: 96px;
  }

  .bill-card {
    padding: 20px;
    border: 1px solid #e3e9e3;
    border-radius: 20px;
    background: rgba(255, 255, 255, .97);
    box-shadow: 0 15px 40px rgba(25, 45, 30, .065);
  }

  .bill-card-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 19px;
  }

  .bill-card-heading h2 {
    margin: 0;
    font-size: 19px;
    letter-spacing: -.5px;
  }

  .bill-check {
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: #eaf7ed;
    color: #159447;
    font-weight: 950;
  }

  .bill-rows {
    display: flex;
    flex-direction: column;
    gap: 13px;
  }

  .bill-row {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    font-size: 11px;
  }

  .bill-row > span {
    color: #69736b;
  }

  .bill-row > span small {
    color: #9ca39d;
    font-size: 8px;
  }

  .bill-row strong {
    color: #343b35;
    font-size: 11px;
  }

  .bill-row.saving strong,
  .bill-row.saving span {
    color: #159447;
    font-weight: 800;
  }

  .free-text {
    color: #159447 !important;
  }

  .bill-divider {
    height: 1px;
    margin: 18px 0;
    background: #edf0ed;
  }

  .total-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
  }

  .total-row div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .total-row span {
    color: #202720;
    font-size: 12px;
    font-weight: 850;
  }

  .total-row small {
    color: #9aa19b;
    font-size: 7px;
  }

  .total-row > strong {
    color: #121812;
    font-size: 23px;
    letter-spacing: -.7px;
  }

  .total-saving-banner {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-top: 14px;
    padding: 9px 10px;
    border-radius: 9px;
    background: #eef9ef;
    color: #148d43;
    font-size: 9px;
  }

  .total-saving-banner strong {
    font-size: 9px;
  }

  .checkout-button {
    width: 100%;
    min-height: 51px;
    margin-top: 17px;
    border: 0;
    border-radius: 13px;
    background: linear-gradient(135deg, #0c9b43, #18a951);
    color: #fff;
    cursor: pointer;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-size: 12px;
    font-weight: 900;
    box-shadow: 0 11px 24px rgba(17, 157, 70, .22);
    transition: transform .2s ease, box-shadow .2s ease;
  }

  .checkout-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 29px rgba(17, 157, 70, .28);
  }

  .checkout-button b {
    width: 29px;
    height: 29px;
    border-radius: 9px;
    display: grid;
    place-items: center;
    background: rgba(255, 255, 255, .17);
    font-size: 17px;
  }

  .checkout-note {
    margin: 10px 0 0;
    text-align: center;
    color: #929a93;
    font-size: 8px;
  }

  .delivery-summary-card {
    display: flex;
    align-items: center;
    gap: 11px;
    margin-top: 10px;
    padding: 13px;
    border: 1px solid #e4ebe5;
    border-radius: 14px;
    background: #fbfffb;
  }

  .summary-icon {
    width: 35px;
    height: 35px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    background: #f5d90a;
    font-size: 18px;
  }

  .delivery-summary-card strong {
    display: block;
    color: #29322b;
    font-size: 10px;
  }

  .delivery-summary-card p {
    margin: 3px 0 0;
    color: #8c958e;
    font-size: 8px;
    line-height: 1.4;
  }

  .payment-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 9px;
  }

  .payment-strip span {
    padding: 5px 7px;
    border-radius: 6px;
    background: #f1f3f1;
    color: #747d76;
    font-size: 7px;
    font-weight: 800;
  }

  /* Empty state */

  .cart-empty-page {
    position: relative;
    min-height: calc(100vh - 74px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 45px 22px 70px;
  }

  .empty-orbit {
    position: absolute;
    border: 1px solid rgba(21, 148, 71, .08);
    border-radius: 50%;
    pointer-events: none;
  }

  .empty-orbit-one {
    width: 430px;
    height: 430px;
  }

  .empty-orbit-two {
    width: 610px;
    height: 610px;
  }

  .empty-cart-illustration {
    position: relative;
    width: 145px;
    height: 125px;
    display: grid;
    place-items: center;
    margin-bottom: 18px;
  }

  .empty-cart-bag {
    position: relative;
    z-index: 2;
    width: 95px;
    height: 95px;
    border-radius: 30px;
    display: grid;
    place-items: center;
    background: linear-gradient(145deg, #f7df22, #f3d209);
    font-size: 45px;
    box-shadow: 0 22px 45px rgba(245, 217, 10, .24);
    animation: emptyBounce 2.5s ease-in-out infinite;
  }

  .empty-float {
    position: absolute;
    z-index: 3;
    width: 37px;
    height: 37px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 9px 22px rgba(25, 45, 30, .09);
    font-size: 18px;
  }

  .empty-float-one {
    left: 0;
    top: 5px;
    animation: floatOne 3s ease-in-out infinite;
  }

  .empty-float-two {
    right: 0;
    top: 17px;
    animation: floatTwo 3.4s ease-in-out infinite;
  }

  .empty-float-three {
    left: 17px;
    bottom: 0;
    animation: floatThree 3.2s ease-in-out infinite;
  }

  .empty-cart-copy {
    position: relative;
    z-index: 2;
    max-width: 470px;
  }

  .empty-eyebrow {
    color: #159447;
    font-size: 9px;
    letter-spacing: 1.7px;
    font-weight: 950;
  }

  .empty-cart-copy h1 {
    margin: 8px 0 0;
    font-size: clamp(32px, 5vw, 48px);
    line-height: 1;
    letter-spacing: -2px;
    font-weight: 900;
  }

  .empty-cart-copy p {
    margin: 12px auto 0;
    max-width: 390px;
    color: #788078;
    font-size: 12px;
    line-height: 1.7;
  }

  .cart-primary-button {
    margin-top: 22px;
    border: 0;
    border-radius: 12px;
    background: #111713;
    color: #fff;
    cursor: pointer;
    padding: 13px 19px;
    display: inline-flex;
    align-items: center;
    gap: 13px;
    font-size: 12px;
    font-weight: 850;
    box-shadow: 0 11px 25px rgba(17, 23, 19, .17);
    transition: transform .2s ease, box-shadow .2s ease;
  }

  .cart-primary-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(17, 23, 19, .22);
  }

  .cart-primary-button span {
    font-size: 17px;
  }

  .empty-benefits {
    position: relative;
    z-index: 2;
    width: min(690px, 100%);
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 9px;
    margin-top: 42px;
  }

  .empty-benefits > div {
    padding: 13px;
    border: 1px solid #e5eae5;
    border-radius: 14px;
    background: rgba(255, 255, 255, .78);
    text-align: left;
  }

  .empty-benefits > div > span {
    display: block;
    margin-bottom: 7px;
    font-size: 20px;
  }

  .empty-benefits p {
    margin: 0;
  }

  .empty-benefits strong,
  .empty-benefits small {
    display: block;
  }

  .empty-benefits strong {
    color: #313a32;
    font-size: 9px;
  }

  .empty-benefits small {
    margin-top: 3px;
    color: #8b938d;
    font-size: 8px;
    line-height: 1.4;
  }

  /* Clear cart modal */

  .clear-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: grid;
    place-items: center;
    padding: 20px;
    background: rgba(15, 20, 16, .48);
    backdrop-filter: blur(7px);
    animation: fadeIn .18s ease;
  }

  .clear-modal {
    width: min(400px, 100%);
    padding: 25px;
    border-radius: 20px;
    background: #fff;
    box-shadow: 0 25px 70px rgba(0, 0, 0, .18);
    text-align: center;
    animation: modalIn .24s ease;
  }

  .clear-modal-icon {
    width: 54px;
    height: 54px;
    margin: 0 auto 13px;
    border-radius: 16px;
    display: grid;
    place-items: center;
    background: #fff7d6;
    font-size: 26px;
  }

  .clear-modal h2 {
    margin: 0;
    font-size: 20px;
    letter-spacing: -.5px;
  }

  .clear-modal p {
    margin: 8px 0 0;
    color: #7d857e;
    font-size: 11px;
    line-height: 1.6;
  }

  .clear-modal-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 9px;
    margin-top: 20px;
  }

  .clear-modal-actions button {
    min-height: 42px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 11px;
    font-weight: 850;
  }

  .cancel-clear {
    border: 1px solid #e1e5e1;
    background: #fff;
    color: #394139;
  }

  .confirm-clear {
    border: 0;
    background: #c83c35;
    color: #fff;
  }

  @keyframes itemIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes productFloat {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
  }

  @keyframes bikeFloat {
    0%, 100% {
      transform: translateY(0) rotate(-2deg);
    }
    50% {
      transform: translateY(-4px) rotate(2deg);
    }
  }

  @keyframes statusPulse {
    0%, 100% {
      box-shadow: 0 0 0 4px rgba(25, 164, 77, .08);
    }
    50% {
      box-shadow: 0 0 0 7px rgba(25, 164, 77, .14);
    }
  }

  @keyframes emptyBounce {
    0%, 100% {
      transform: translateY(0) rotate(-2deg);
    }
    50% {
      transform: translateY(-8px) rotate(2deg);
    }
  }

  @keyframes floatOne {
    0%, 100% { transform: translate(0, 0) rotate(-4deg); }
    50% { transform: translate(-5px, -8px) rotate(3deg); }
  }

  @keyframes floatTwo {
    0%, 100% { transform: translate(0, 0) rotate(4deg); }
    50% { transform: translate(5px, -9px) rotate(-3deg); }
  }

  @keyframes floatThree {
    0%, 100% { transform: translate(0, 0) rotate(-3deg); }
    50% { transform: translate(-3px, 6px) rotate(4deg); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes modalIn {
    from {
      opacity: 0;
      transform: translateY(8px) scale(.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cart-page *,
    .cart-page *::before,
    .cart-page *::after {
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
      transition-duration: .01ms !important;
    }
  }

  @media (max-width: 980px) {
    .cart-layout {
      grid-template-columns: minmax(0, 1fr) minmax(290px, .72fr);
    }

    .cart-item {
      grid-template-columns: 94px minmax(0, 1fr);
    }

    .cart-item-image {
      width: 94px;
      height: 94px;
    }

    .cart-item-total {
      display: none;
    }
  }

  @media (max-width: 820px) {
    .cart-layout {
      grid-template-columns: 1fr;
    }

    .bill-section {
      position: static;
    }

    .cart-trust-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    .delivery-progress-card {
      padding: 15px;
    }
  }

  @media (max-width: 600px) {
    .cart-header-inner {
      min-height: 65px;
      padding: 10px 14px;
      gap: 11px;
    }

    .cart-logo-word {
      display: none;
    }

    .cart-logo-mark {
      width: 38px;
      height: 38px;
    }

    .cart-back-button {
      padding: 9px 11px;
      font-size: 10px;
    }

    .cart-header-status {
      font-size: 9px;
    }

    .cart-main {
      padding: 18px 14px 55px;
    }

    .cart-heading-row {
      align-items: flex-start;
      margin-bottom: 17px;
    }

    .cart-heading-row h1 {
      font-size: 31px;
    }

    .clear-cart-button {
      padding: 8px 10px;
      font-size: 9px;
    }

    .delivery-progress-card {
      align-items: flex-start;
      gap: 10px;
      padding: 13px;
      border-radius: 14px;
    }

    .delivery-progress-icon {
      width: 38px;
      height: 38px;
      border-radius: 11px;
      font-size: 18px;
    }

    .delivery-progress-top strong {
      font-size: 10px;
    }

    .delivery-progress-top span {
      font-size: 8px;
    }

    .delivery-bike {
      display: none;
    }

    .cart-item {
      grid-template-columns: 74px minmax(0, 1fr);
      gap: 10px;
      padding: 10px;
      border-radius: 14px;
    }

    .cart-item-image {
      width: 74px;
      height: 74px;
      border-radius: 11px;
    }

    .cart-item-image > span:not(.item-discount) {
      font-size: 36px;
    }

    .item-discount {
      left: 5px;
      bottom: 5px;
      font-size: 6px;
      padding: 3px 4px;
    }

    .item-delivery {
      font-size: 7px;
    }

    .cart-item-details h3 {
      margin-top: 5px;
      font-size: 12px;
    }

    .cart-item-details p {
      font-size: 8px;
    }

    .remove-item {
      width: 24px;
      height: 24px;
    }

    .remove-item span {
      font-size: 17px;
    }

    .cart-item-bottom {
      margin-top: 9px;
      align-items: center;
    }

    .item-price-line strong {
      font-size: 14px;
    }

    .item-price-line span {
      font-size: 8px;
    }

    .item-price-block small {
      font-size: 7px;
    }

    .cart-quantity {
      height: 31px;
    }

    .cart-quantity button {
      width: 28px;
      font-size: 15px;
    }

    .cart-quantity span {
      min-width: 25px;
      font-size: 10px;
    }

    .cart-trust-grid {
      grid-template-columns: 1fr;
    }

    .cart-trust-grid > div {
      display: grid;
      grid-template-columns: 30px 1fr;
      column-gap: 8px;
      align-items: center;
      padding: 10px;
    }

    .cart-trust-grid span {
      grid-row: span 2;
      margin: 0;
    }

    .cart-trust-grid small {
      margin-top: 1px;
    }

    .empty-benefits {
      grid-template-columns: 1fr;
      max-width: 330px;
      margin-top: 30px;
    }

    .empty-benefits > div {
      display: grid;
      grid-template-columns: 28px 1fr;
      gap: 8px;
      align-items: center;
    }

    .empty-benefits > div > span {
      grid-row: span 2;
      margin: 0;
    }

    .empty-orbit-one {
      width: 310px;
      height: 310px;
    }

    .empty-orbit-two {
      width: 440px;
      height: 440px;
    }

    .empty-cart-copy h1 {
      font-size: 35px;
    }

    .empty-cart-copy p {
      font-size: 10px;
    }
  }

  @media (max-width: 390px) {
    .cart-header-status {
      display: none;
    }

    .cart-heading-row h1 {
      font-size: 28px;
    }

    .section-card-head h2 {
      font-size: 16px;
    }

    .cart-item {
      grid-template-columns: 66px minmax(0, 1fr);
    }

    .cart-item-image {
      width: 66px;
      height: 66px;
    }

    .cart-item-image > span:not(.item-discount) {
      font-size: 31px;
    }
  }
`
