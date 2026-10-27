import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

function loadOrders() {
  try {
    return JSON.parse(localStorage.getItem('quickorders') || '[]')
  } catch {
    return []
  }
}

const statusConfig = {
  placed: { label: 'Order Placed', icon: '🧾', tone: 'green' },
  accepted: { label: 'Accepted', icon: '✅', tone: 'green' },
  preparing: { label: 'Preparing', icon: '👨‍🍳', tone: 'yellow' },
  ready: { label: 'Ready', icon: '📦', tone: 'blue' },
  out_for_delivery: { label: 'Out for Delivery', icon: '🛵', tone: 'orange' },
  delivered: { label: 'Delivered', icon: '🎉', tone: 'green' },
}

const timeline = [
  'placed',
  'accepted',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
]

function formatDate(value) {
  if (!value) return 'Just now'

  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return value
  }
}

function getStatus(status) {
  return (
    statusConfig[status] || {
      label: 'Order Processing',
      icon: '🛍️',
      tone: 'green',
    }
  )
}

export default function OrderDetails() {
  const navigate = useNavigate()
  const { orderId } = useParams()
  const location = useLocation()

  const [order, setOrder] = useState(location.state?.order || null)

  useEffect(() => {
    if (order) return

    const found = loadOrders().find((savedOrder) => savedOrder.id === orderId)

    if (found) setOrder(found)
  }, [order, orderId])

  const currentStep = useMemo(() => {
    if (!order) return 0

    const index = timeline.indexOf(order.status)
    return index >= 0 ? index : 0
  }, [order])

  const currentStatus = getStatus(order?.status)
  const isDelivered = order?.status === 'delivered'

  if (!order) {
    return (
      <div className="order-page order-not-found">
        <style>{styles}</style>

        <div className="not-found-card">
          <div className="not-found-icon">📦</div>
          <span className="not-found-kicker">Blinkit Orders</span>
          <h1>Order not found</h1>
          <p>
            We couldn't find this order in your saved orders. It may have been
            removed or the order link may no longer be available.
          </p>
          <button type="button" onClick={() => navigate('/')}>
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="order-page">
      <style>{styles}</style>

      <header className="order-header">
        <div className="order-header-inner">
          <button
            className="order-logo"
            type="button"
            onClick={() => navigate('/')}
            aria-label="Go to Blinkit home"
          >
            <span className="order-logo-icon">
              <span>B</span>
            </span>
            <span className="order-brand">
              blink<span>it</span>
            </span>
          </button>

          <div className="header-center">
            <span className="header-lock">🔒</span>
            <span>Order tracking</span>
          </div>

          <button
            className="continue-button"
            type="button"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </button>
        </div>
      </header>

      <main className="order-container">
        <div className="breadcrumb">
          <button type="button" onClick={() => navigate('/')}>
            Home
          </button>
          <span>›</span>
          <span>Order details</span>
        </div>

        <section className={`confirmation-card ${isDelivered ? 'delivered' : ''}`}>
          <div className="confirmation-orbit orbit-one" />
          <div className="confirmation-orbit orbit-two" />

          <div className="confirmation-icon">{isDelivered ? '🎉' : '🛍️'}</div>

          <div className="confirmation-content">
            <span className="confirmation-kicker">
              {isDelivered ? 'Order delivered' : 'Order confirmed'}
            </span>

            <h1>
              {isDelivered ? 'Your order has arrived!' : 'Your order is on its way!'}
            </h1>

            <p>
              {isDelivered
                ? 'We hope you enjoy your groceries.'
                : 'Your groceries are being prepared for a speedy delivery.'}
            </p>

            <div className="order-meta">
              <span>Order ID: <strong>{order.id}</strong></span>
              <span className="meta-separator">•</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
          </div>

          <div className="status-pill">
            <span className="status-pill-dot" />
            {currentStatus.label}
          </div>
        </section>

        <div className="order-grid">
          <section className="order-left">
            <div className="order-card delivery-status-card">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">LIVE UPDATE</span>
                  <h2>Delivery status</h2>
                  <p>
                    {isDelivered
                      ? 'Your order has completed its journey.'
                      : 'We’ll keep your order moving every step of the way.'}
                  </p>
                </div>

                <div className="delivery-eta">
                  <span>⚡</span>
                  <div>
                    <strong>{isDelivered ? 'Delivered' : '10 min'}</strong>
                    <small>{isDelivered ? 'Order complete' : 'Estimated delivery'}</small>
                  </div>
                </div>
              </div>

              <div className="timeline">
                {timeline.map((step, index) => {
                  const active = index <= currentStep
                  const current = index === currentStep
                  const config = getStatus(step)

                  return (
                    <div
                      key={step}
                      className={`timeline-step ${active ? 'active' : ''} ${
                        current ? 'current' : ''
                      }`}
                    >
                      <div className="timeline-rail">
                        <div className="timeline-circle">
                          {active ? '✓' : config.icon}
                        </div>

                        {index < timeline.length - 1 && (
                          <div className="timeline-line">
                            <span
                              style={{
                                transform:
                                  index < currentStep ? 'scaleY(1)' : 'scaleY(0)',
                              }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="timeline-content">
                        <div className="timeline-title-row">
                          <strong>{config.label}</strong>
                          {current && !isDelivered && (
                            <span className="now-badge">NOW</span>
                          )}
                        </div>

                        <small>
                          {active
                            ? current
                              ? 'Your order is at this stage'
                              : 'Completed'
                            : 'Coming up next'}
                        </small>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="order-card">
              <div className="section-heading compact">
                <div>
                  <span className="section-kicker">YOUR BAG</span>
                  <h2>Items ordered</h2>
                  <p>
                    {order.items?.length || 0}{' '}
                    {order.items?.length === 1 ? 'product' : 'products'}
                  </p>
                </div>

                <button
                  className="small-action"
                  type="button"
                  onClick={() => navigate('/')}
                >
                  Shop more
                </button>
              </div>

              <div className="items-list">
                {(order.items || []).map((item, index) => (
                  <div
                    key={item.variantId || `${item.name}-${item.variant}-${index}`}
                    className="ordered-item"
                  >
                    <div className="ordered-item-image">{item.emoji}</div>

                    <div className="ordered-item-info">
                      <strong>{item.name}</strong>
                      <span>
                        {item.variant} × {item.quantity}
                      </span>
                    </div>

                    <div className="ordered-item-price">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="order-right">
            <div className="order-card address-card">
              <div className="section-heading compact">
                <div>
                  <span className="section-kicker">DELIVERY TO</span>
                  <h2>Delivery address</h2>
                </div>
                <div className="section-icon">📍</div>
              </div>

              <div className="address-box">
                <div className="address-top">
                  <strong>{order.address.name}</strong>
                  <span>HOME</span>
                </div>

                <p>{order.address.phone}</p>

                <p>
                  {order.address.address}
                  {order.address.landmark
                    ? `, ${order.address.landmark}`
                    : ''}
                </p>

                <p>
                  {order.address.city} - {order.address.pincode}
                </p>
              </div>
            </div>

            <div className="order-card">
              <div className="section-heading compact">
                <div>
                  <span className="section-kicker">PAYMENT</span>
                  <h2>Payment details</h2>
                </div>
                <div className="section-icon">🔒</div>
              </div>

              <div className="payment-summary">
                <div className="payment-method">
                  <span>
                    {order.paymentMethod === 'cod'
                      ? '💵'
                      : order.paymentMethod === 'upi'
                        ? '📱'
                        : '💳'}
                  </span>

                  <div>
                    <strong>
                      {order.paymentMethod === 'cod'
                        ? 'Cash on Delivery'
                        : order.paymentMethod === 'upi'
                          ? 'UPI'
                          : 'Card'}
                    </strong>
                    <small>Payment status: {order.paymentStatus || 'pending'}</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-card bill-card">
              <span className="section-kicker">PAYMENT SUMMARY</span>
              <h2>Bill details</h2>

              <div className="bill-row">
                <span>Items</span>
                <strong>₹{order.subtotal}</strong>
              </div>

              {typeof order.mrpTotal === 'number' &&
                order.mrpTotal > order.subtotal && (
                  <div className="bill-row saving">
                    <span>Product savings</span>
                    <strong>− ₹{order.mrpTotal - order.subtotal}</strong>
                  </div>
                )}

              <div className="bill-row">
                <span>Delivery</span>
                <strong>
                  {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
                </strong>
              </div>

              <div className="bill-row">
                <span>Handling</span>
                <strong>₹{order.handlingFee}</strong>
              </div>

              <div className="bill-divider" />

              <div className="total-row">
                <span>Total paid</span>
                <strong>₹{order.total}</strong>
              </div>

              <div className="secure-strip">
                <span>🛡️</span>
                <div>
                  <strong>Safe & secure order</strong>
                  <small>Your order details are stored securely.</small>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <section className="bottom-actions">
          <div>
            <span className="bottom-icon">🛒</span>
            <div>
              <strong>Need anything else?</strong>
              <small>Continue shopping for your everyday essentials.</small>
            </div>
          </div>

          <button type="button" onClick={() => navigate('/')}>
            Continue Shopping →
          </button>
        </section>
      </main>
    </div>
  )
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .order-page {
    min-height: 100vh;
    background:
      radial-gradient(circle at 6% 0%, rgba(0, 200, 83, .09), transparent 27%),
      radial-gradient(circle at 94% 5%, rgba(255, 214, 10, .14), transparent 24%),
      #f7f8f5;
    color: #172018;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
  }

  .order-header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(255, 255, 255, .92);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid #e5ebe5;
    box-shadow: 0 5px 24px rgba(21, 45, 27, .05);
  }

  .order-header-inner {
    max-width: 1220px;
    min-height: 76px;
    margin: 0 auto;
    padding: 13px 24px;
    display: flex;
    align-items: center;
    gap: 18px;
  }

  .order-logo {
    border: 0;
    background: transparent;
    padding: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
  }

  .order-logo-icon {
    width: 42px;
    height: 42px;
    border-radius: 13px;
    background: #ffd60a;
    display: grid;
    place-items: center;
    transform: rotate(-3deg);
    box-shadow: 0 7px 18px rgba(255, 214, 10, .25);
    transition: .25s ease;
  }

  .order-logo:hover .order-logo-icon {
    transform: rotate(0) scale(1.06);
  }

  .order-logo-icon span {
    color: #122016;
    font-size: 24px;
    line-height: 1;
    font-weight: 950;
    letter-spacing: -2px;
  }

  .order-brand {
    color: #101c13;
    font-size: 24px;
    font-weight: 900;
    letter-spacing: -1.2px;
  }

  .order-brand span {
    color: #00a83b;
  }

  .header-center {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #657168;
    font-size: 11px;
    font-weight: 800;
  }

  .header-lock {
    width: 28px;
    height: 28px;
    border-radius: 9px;
    background: #eefaf1;
    display: grid;
    place-items: center;
    font-size: 12px;
  }

  .continue-button {
    border: 1px solid #dce5de;
    border-radius: 11px;
    background: #fff;
    color: #263229;
    padding: 10px 14px;
    cursor: pointer;
    font-size: 10px;
    font-weight: 900;
    transition: .2s ease;
  }

  .continue-button:hover {
    background: #f3fff5;
    border-color: #b9dcc1;
    transform: translateY(-1px);
  }

  .order-container {
    width: min(100%, 1220px);
    margin: 0 auto;
    padding: 24px 24px 75px;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 17px;
    color: #879189;
    font-size: 10px;
    font-weight: 800;
  }

  .breadcrumb button {
    border: 0;
    background: transparent;
    padding: 0;
    color: #087d32;
    font: inherit;
    cursor: pointer;
  }

  .breadcrumb button:hover {
    text-decoration: underline;
  }

  .confirmation-card {
    position: relative;
    overflow: hidden;
    min-height: 170px;
    margin-bottom: 20px;
    padding: 28px 30px;
    border: 1px solid #cdebd4;
    border-radius: 22px;
    background:
      radial-gradient(circle at 88% 20%, rgba(255, 214, 10, .18), transparent 24%),
      linear-gradient(135deg, #f0fff3, #ffffff 65%);
    display: flex;
    align-items: center;
    gap: 20px;
    box-shadow: 0 12px 36px rgba(0, 168, 59, .07);
  }

  .confirmation-card.delivered {
    background:
      radial-gradient(circle at 88% 20%, rgba(255, 214, 10, .24), transparent 24%),
      linear-gradient(135deg, #f2fff5, #ffffff 65%);
  }

  .confirmation-icon {
    position: relative;
    z-index: 2;
    width: 76px;
    height: 76px;
    border-radius: 24px;
    background: #fff;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    font-size: 38px;
    box-shadow: 0 9px 25px rgba(20, 78, 36, .09);
    animation: confirmationFloat 2.7s ease-in-out infinite;
  }

  @keyframes confirmationFloat {
    0%, 100% { transform: translateY(0) rotate(-2deg); }
    50% { transform: translateY(-4px) rotate(2deg); }
  }

  .confirmation-content {
    position: relative;
    z-index: 2;
  }

  .confirmation-kicker,
  .section-kicker {
    display: block;
    color: #078238;
    font-size: 8px;
    font-weight: 950;
    letter-spacing: 1.1px;
  }

  .confirmation-content h1 {
    margin: 5px 0 5px;
    color: #152119;
    font-size: clamp(24px, 3.2vw, 34px);
    line-height: 1.08;
    letter-spacing: -1px;
  }

  .confirmation-content p {
    margin: 0;
    color: #68756d;
    font-size: 11px;
    line-height: 1.5;
  }

  .order-meta {
    margin-top: 13px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 7px;
    color: #78837c;
    font-size: 9px;
  }

  .order-meta strong {
    color: #27342b;
  }

  .meta-separator {
    color: #b2bbb5;
  }

  .status-pill {
    position: relative;
    z-index: 2;
    margin-left: auto;
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 11px;
    border: 1px solid #cce8d3;
    border-radius: 999px;
    background: rgba(255,255,255,.85);
    color: #087d32;
    font-size: 9px;
    font-weight: 900;
    white-space: nowrap;
  }

  .status-pill-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #00c853;
    box-shadow: 0 0 0 4px rgba(0, 200, 83, .1);
  }

  .confirmation-orbit {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }

  .orbit-one {
    width: 190px;
    height: 190px;
    right: -65px;
    bottom: -105px;
    border: 30px solid rgba(0, 200, 83, .045);
  }

  .orbit-two {
    width: 100px;
    height: 100px;
    right: 110px;
    top: -45px;
    border: 18px solid rgba(255, 214, 10, .08);
  }

  .order-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.48fr) minmax(330px, .8fr);
    gap: 18px;
    align-items: start;
  }

  .order-left,
  .order-right {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .order-right {
    position: sticky;
    top: 94px;
  }

  .order-card {
    border: 1px solid #e2e9e3;
    border-radius: 20px;
    padding: 22px;
    background: rgba(255,255,255,.97);
    box-shadow: 0 10px 30px rgba(24, 53, 31, .055);
  }

  .section-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 22px;
  }

  .section-heading.compact {
    margin-bottom: 17px;
  }

  .section-heading h2 {
    margin: 4px 0 0;
    color: #1a251e;
    font-size: 18px;
    letter-spacing: -.35px;
  }

  .section-heading p {
    margin: 5px 0 0;
    color: #89938c;
    font-size: 10px;
    line-height: 1.45;
  }

  .delivery-eta {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 11px;
    border: 1px solid #d7efdc;
    border-radius: 11px;
    background: #f3fff5;
    flex-shrink: 0;
  }

  .delivery-eta > span {
    font-size: 16px;
  }

  .delivery-eta div {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .delivery-eta strong {
    color: #087d32;
    font-size: 10px;
  }

  .delivery-eta small {
    color: #809087;
    font-size: 7px;
  }

  .timeline {
    display: flex;
    flex-direction: column;
  }

  .timeline-step {
    display: flex;
    min-height: 67px;
    gap: 13px;
  }

  .timeline-rail {
    width: 38px;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
  }

  .timeline-circle {
    position: relative;
    z-index: 2;
    width: 35px;
    height: 35px;
    border-radius: 12px;
    border: 1px solid #dfe5e0;
    background: #f6f8f6;
    color: #a1aaa3;
    display: grid;
    place-items: center;
    font-size: 14px;
    font-weight: 950;
    transition: .25s ease;
  }

  .timeline-step.active .timeline-circle {
    background: #e9faed;
    border-color: #bfe4c7;
    color: #078238;
  }

  .timeline-step.current .timeline-circle {
    background: #00c853;
    border-color: #00c853;
    color: #fff;
    box-shadow: 0 6px 15px rgba(0, 200, 83, .2);
    animation: currentPulse 1.8s ease-in-out infinite;
  }

  @keyframes currentPulse {
    0%, 100% { box-shadow: 0 6px 15px rgba(0, 200, 83, .2); }
    50% { box-shadow: 0 6px 20px rgba(0, 200, 83, .38); }
  }

  .timeline-line {
    width: 2px;
    flex: 1;
    margin: -1px 0;
    background: #e6ebe7;
    overflow: hidden;
  }

  .timeline-line span {
    display: block;
    width: 100%;
    height: 100%;
    background: #00c853;
    transform-origin: top;
    transition: transform .45s ease;
  }

  .timeline-content {
    flex: 1;
    padding: 3px 0 18px;
  }

  .timeline-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .timeline-content strong {
    color: #27332b;
    font-size: 11px;
  }

  .timeline-content small {
    display: block;
    margin-top: 4px;
    color: #98a19b;
    font-size: 8px;
  }

  .timeline-step.active .timeline-content strong {
    color: #087d32;
  }

  .now-badge {
    padding: 3px 5px;
    border-radius: 5px;
    background: #e6faeb;
    color: #087d32;
    font-size: 7px;
    font-weight: 950;
    letter-spacing: .5px;
  }

  .small-action {
    border: 1px solid #cfe8d4;
    border-radius: 9px;
    background: #f4fff6;
    color: #078238;
    padding: 7px 9px;
    cursor: pointer;
    font-size: 9px;
    font-weight: 900;
  }

  .small-action:hover {
    background: #e6faeb;
  }

  .items-list {
    display: flex;
    flex-direction: column;
    gap: 11px;
  }

  .ordered-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 5px 0 11px;
    border-bottom: 1px solid #eef1ee;
  }

  .ordered-item:last-child {
    padding-bottom: 0;
    border-bottom: 0;
  }

  .ordered-item-image {
    width: 50px;
    height: 50px;
    border-radius: 13px;
    background: #f2f8f3;
    display: grid;
    place-items: center;
    font-size: 26px;
    flex-shrink: 0;
  }

  .ordered-item-info {
    min-width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .ordered-item-info strong {
    color: #263229;
    font-size: 11px;
  }

  .ordered-item-info span {
    color: #8a958d;
    font-size: 9px;
  }

  .ordered-item-price {
    color: #1d2921;
    font-size: 11px;
    font-weight: 900;
  }

  .section-icon {
    width: 35px;
    height: 35px;
    border-radius: 11px;
    background: #effaf2;
    display: grid;
    place-items: center;
    font-size: 16px;
  }

  .address-box {
    padding: 14px;
    border: 1px solid #e2ebe3;
    border-radius: 13px;
    background: #f9fbf9;
  }

  .address-top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .address-top strong {
    font-size: 12px;
  }

  .address-top span {
    padding: 3px 7px;
    border-radius: 5px;
    background: #fff1b9;
    color: #776300;
    font-size: 7px;
    font-weight: 950;
    letter-spacing: .4px;
  }

  .address-box p {
    margin: 5px 0;
    color: #69766e;
    font-size: 10px;
    line-height: 1.5;
  }

  .payment-summary {
    padding: 12px;
    border-radius: 12px;
    background: #f7faf7;
    border: 1px solid #e5ebe5;
  }

  .payment-method {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .payment-method > span {
    width: 37px;
    height: 37px;
    border-radius: 10px;
    background: #fff;
    display: grid;
    place-items: center;
    font-size: 17px;
  }

  .payment-method div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .payment-method strong {
    font-size: 10px;
  }

  .payment-method small {
    color: #8a948d;
    font-size: 8px;
  }

  .bill-card h2 {
    margin: 4px 0 18px;
    font-size: 18px;
    letter-spacing: -.3px;
  }

  .bill-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 12px;
    color: #69756d;
    font-size: 11px;
  }

  .bill-row strong {
    color: #29352d;
  }

  .bill-row.saving,
  .bill-row.saving strong {
    color: #078238;
  }

  .bill-divider {
    height: 1px;
    margin: 17px 0;
    background: #e7ece8;
  }

  .total-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
  }

  .total-row span {
    font-size: 12px;
    font-weight: 800;
  }

  .total-row strong {
    font-size: 21px;
    letter-spacing: -.4px;
  }

  .secure-strip {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-top: 16px;
    padding: 11px;
    border: 1px solid #d9efde;
    border-radius: 11px;
    background: #f4fff6;
  }

  .secure-strip > span {
    font-size: 16px;
  }

  .secure-strip div {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .secure-strip strong {
    color: #087d32;
    font-size: 9px;
  }

  .secure-strip small {
    color: #7e8b83;
    font-size: 7px;
  }

  .bottom-actions {
    margin-top: 18px;
    padding: 15px 17px;
    border: 1px solid #e1e9e2;
    border-radius: 17px;
    background: rgba(255,255,255,.9);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
  }

  .bottom-actions > div {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .bottom-icon {
    width: 38px;
    height: 38px;
    border-radius: 11px;
    background: #f0faf2;
    display: grid;
    place-items: center;
    font-size: 17px;
  }

  .bottom-actions > div > div {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .bottom-actions strong {
    font-size: 10px;
  }

  .bottom-actions small {
    color: #89948c;
    font-size: 8px;
  }

  .bottom-actions button,
  .not-found-card button {
    border: 0;
    border-radius: 10px;
    background: #00c853;
    color: #fff;
    padding: 11px 15px;
    cursor: pointer;
    font-size: 10px;
    font-weight: 900;
    box-shadow: 0 7px 16px rgba(0, 168, 59, .17);
    transition: .2s ease;
  }

  .bottom-actions button:hover,
  .not-found-card button:hover {
    background: #00b848;
    transform: translateY(-1px);
  }

  .order-not-found {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 20px;
  }

  .not-found-card {
    width: min(100%, 430px);
    padding: 35px;
    border: 1px solid #e1e9e2;
    border-radius: 22px;
    background: #fff;
    text-align: center;
    box-shadow: 0 15px 40px rgba(24, 53, 31, .08);
  }

  .not-found-icon {
    width: 72px;
    height: 72px;
    margin: 0 auto 16px;
    border-radius: 22px;
    background: #f0faf2;
    display: grid;
    place-items: center;
    font-size: 32px;
  }

  .not-found-kicker {
    color: #078238;
    font-size: 8px;
    font-weight: 950;
    letter-spacing: 1px;
  }

  .not-found-card h1 {
    margin: 7px 0 7px;
    font-size: 25px;
  }

  .not-found-card p {
    margin: 0 0 20px;
    color: #7b867f;
    font-size: 11px;
    line-height: 1.6;
  }

  @media (max-width: 900px) {
    .order-grid {
      grid-template-columns: 1fr;
    }

    .order-right {
      position: static;
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: start;
    }

    .order-right .bill-card {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 650px) {
    .order-header-inner {
      min-height: 66px;
      padding: 9px 14px;
    }

    .order-logo-icon {
      width: 37px;
      height: 37px;
    }

    .order-logo-icon span {
      font-size: 21px;
    }

    .order-brand {
      font-size: 21px;
    }

    .header-center {
      display: none;
    }

    .continue-button {
      margin-left: auto;
      padding: 9px 10px;
      font-size: 9px;
    }

    .order-container {
      padding: 17px 12px 55px;
    }

    .breadcrumb {
      margin-bottom: 13px;
    }

    .confirmation-card {
      min-height: 0;
      padding: 20px;
      border-radius: 18px;
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .confirmation-icon {
      width: 58px;
      height: 58px;
      border-radius: 18px;
      font-size: 28px;
    }

    .confirmation-content {
      flex: 1;
      min-width: 190px;
    }

    .confirmation-content h1 {
      font-size: 23px;
    }

    .status-pill {
      margin-left: 0;
      width: 100%;
    }

    .order-card {
      padding: 17px;
      border-radius: 17px;
    }

    .order-right {
      display: flex;
    }

    .section-heading {
      flex-direction: column;
    }

    .delivery-eta {
      align-self: stretch;
      width: fit-content;
    }

    .bottom-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .bottom-actions button {
      width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .confirmation-icon,
    .timeline-step.current .timeline-circle,
    .continue-button,
    .bottom-actions button,
    .not-found-card button {
      animation: none !important;
      transition: none !important;
      transform: none !important;
    }
  }
`
