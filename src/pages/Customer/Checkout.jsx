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

function getSavedAddresses() {
  try {
    const saved = localStorage.getItem('quickaddresses')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveAddresses(addresses) {
  localStorage.setItem('quickaddresses', JSON.stringify(addresses))
}

export default function Checkout() {
  const navigate = useNavigate()

  const [cart, setCart] = useState(getCart)
  const [addresses, setAddresses] = useState(getSavedAddresses)
  const [selectedAddressId, setSelectedAddressId] = useState(
    () => getSavedAddresses()[0]?.id || '',
  )

  const [showAddressForm, setShowAddressForm] = useState(
    () => getSavedAddresses().length === 0,
  )

  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [placingOrder, setPlacingOrder] = useState(false)

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    landmark: '',
    city: '',
    pincode: '',
  })

  useEffect(() => {
    const latestCart = getCart()

    if (latestCart.length === 0) {
      navigate('/cart', { replace: true })
    }

    setCart(latestCart)
  }, [navigate])

  const itemCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart],
  )

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
    [cart],
  )

  const mrpTotal = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + item.mrp * item.quantity,
        0,
      ),
    [cart],
  )

  const savings = mrpTotal - subtotal
  const deliveryFee = subtotal >= 199 ? 0 : 25
  const handlingFee = subtotal > 0 ? 4 : 0
  const grandTotal = subtotal + deliveryFee + handlingFee

  const selectedAddress = addresses.find(
    (address) => address.id === selectedAddressId,
  )

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function addAddress(event) {
    event.preventDefault()

    if (
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.address.trim() ||
      !form.city.trim() ||
      !form.pincode.trim()
    ) {
      return
    }

    const newAddress = {
      id: `address-${Date.now()}`,
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      landmark: form.landmark.trim(),
      city: form.city.trim(),
      pincode: form.pincode.trim(),
    }

    const updatedAddresses = [...addresses, newAddress]

    saveAddresses(updatedAddresses)
    setAddresses(updatedAddresses)
    setSelectedAddressId(newAddress.id)
    setShowAddressForm(false)

    setForm({
      name: '',
      phone: '',
      address: '',
      landmark: '',
      city: '',
      pincode: '',
    })
  }

  function deleteAddress(addressId) {
    const updatedAddresses = addresses.filter(
      (address) => address.id !== addressId,
    )

    saveAddresses(updatedAddresses)
    setAddresses(updatedAddresses)

    if (selectedAddressId === addressId) {
      setSelectedAddressId(updatedAddresses[0]?.id || '')
    }

    if (updatedAddresses.length === 0) {
      setShowAddressForm(true)
    }
  }

  function placeOrder() {
    if (!selectedAddress || cart.length === 0 || placingOrder) {
      return
    }

    setPlacingOrder(true)

    const order = {
      id: `QC-${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
      status: 'placed',
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      address: selectedAddress,
      items: cart,
      subtotal,
      mrpTotal,
      savings,
      deliveryFee,
      handlingFee,
      total: grandTotal,
    }

    try {
      const existingOrders = JSON.parse(
        localStorage.getItem('quickorders') || '[]',
      )

      localStorage.setItem(
        'quickorders',
        JSON.stringify([order, ...existingOrders]),
      )

      localStorage.setItem('quickcart', '[]')
      window.dispatchEvent(new Event('cartUpdated'))

      navigate(`/orders/${order.id}`, {
        replace: true,
        state: { order },
      })
    } catch {
      setPlacingOrder(false)
    }
  }

  if (cart.length === 0) {
    return null
  }

  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <div className="checkout-header-inner">
          <button
            className="checkout-logo"
            type="button"
            onClick={() => navigate('/')}
          >
            <span className="checkout-logo-icon"><span className="checkout-logo-mark">B</span></span>
            <span className="checkout-brand-text">blink<span>it</span></span>
          </button>

          <div className="checkout-heading">
            <span>Secure checkout</span>
          </div>

          <button
            className="checkout-back"
            type="button"
            onClick={() => navigate('/cart')}
          >
            ← Back to cart
          </button>
        </div>
      </header>

      <main className="checkout-main">
        <div className="checkout-progress">
          <div className="progress-step active">
            <span>1</span>
            <strong>Address</strong>
          </div>

          <div className="progress-line" />

          <div
            className={`progress-step ${
              selectedAddress ? 'active' : ''
            }`}
          >
            <span>2</span>
            <strong>Payment</strong>
          </div>

          <div className="progress-line" />

          <div className="progress-step">
            <span>3</span>
            <strong>Confirmation</strong>
          </div>
        </div>

        <div className="checkout-layout">
          <section className="checkout-left">
            <div className="checkout-card">
              <div className="card-heading">
                <div>
                  <h1>Delivery address</h1>
                  <p>Where should we deliver your order?</p>
                </div>

                {!showAddressForm && (
                  <button
                    type="button"
                    className="add-address-button"
                    onClick={() => setShowAddressForm(true)}
                  >
                    + Add new
                  </button>
                )}
              </div>

              {addresses.length > 0 && !showAddressForm && (
                <div className="address-list">
                  {addresses.map((address) => (
                    <div
                      className={`address-card ${
                        selectedAddressId === address.id
                          ? 'selected'
                          : ''
                      }`}
                      key={address.id}
                    >
                      <button
                        type="button"
                        className="address-select"
                        onClick={() =>
                          setSelectedAddressId(address.id)
                        }
                      >
                        <span className="radio">
                          {selectedAddressId === address.id
                            ? '✓'
                            : ''}
                        </span>

                        <div className="address-content">
                          <div className="address-name-row">
                            <strong>{address.name}</strong>
                            <span>HOME</span>
                          </div>

                          <p>
                            {address.address}
                            {address.landmark
                              ? `, ${address.landmark}`
                              : ''}
                            , {address.city} - {address.pincode}
                          </p>

                          <small>📞 {address.phone}</small>
                        </div>
                      </button>

                      <button
                        type="button"
                        className="delete-address"
                        onClick={() =>
                          deleteAddress(address.id)
                        }
                        aria-label="Delete address"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {showAddressForm && (
                <form
                  className="address-form"
                  onSubmit={addAddress}
                >
                  <div className="form-row">
                    <label>
                      Full name
                      <input
                        type="text"
                        value={form.name}
                        placeholder="Enter your name"
                        onChange={(event) =>
                          updateForm('name', event.target.value)
                        }
                        required
                      />
                    </label>

                    <label>
                      Phone number
                      <input
                        type="tel"
                        value={form.phone}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        onChange={(event) =>
                          updateForm(
                            'phone',
                            event.target.value.replace(
                              /\\D/g,
                              '',
                            ),
                          )
                        }
                        required
                      />
                    </label>
                  </div>

                  <label>
                    Address
                    <textarea
                      value={form.address}
                      placeholder="House / flat / building, street"
                      rows="3"
                      onChange={(event) =>
                        updateForm('address', event.target.value)
                      }
                      required
                    />
                  </label>

                  <label>
                    Landmark
                    <input
                      type="text"
                      value={form.landmark}
                      placeholder="Nearby landmark (optional)"
                      onChange={(event) =>
                        updateForm('landmark', event.target.value)
                      }
                    />
                  </label>

                  <div className="form-row">
                    <label>
                      City
                      <input
                        type="text"
                        value={form.city}
                        placeholder="City"
                        onChange={(event) =>
                          updateForm('city', event.target.value)
                        }
                        required
                      />
                    </label>

                    <label>
                      Pincode
                      <input
                        type="text"
                        value={form.pincode}
                        placeholder="6-digit pincode"
                        maxLength={6}
                        onChange={(event) =>
                          updateForm(
                            'pincode',
                            event.target.value.replace(
                              /\\D/g,
                              '',
                            ),
                          )
                        }
                        required
                      />
                    </label>
                  </div>

                  <div className="form-actions">
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        className="cancel-address"
                        onClick={() =>
                          setShowAddressForm(false)
                        }
                      >
                        Cancel
                      </button>
                    )}

                    <button
                      type="submit"
                      className="save-address"
                    >
                      Save address
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="checkout-card">
              <div className="card-heading">
                <div>
                  <h2>Payment method</h2>
                  <p>Choose how you'd like to pay.</p>
                </div>
              </div>

              <div className="payment-options">
                <button
                  type="button"
                  className={`payment-option ${
                    paymentMethod === 'cod'
                      ? 'selected'
                      : ''
                  }`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <span className="payment-icon">💵</span>

                  <div>
                    <strong>Cash on Delivery</strong>
                    <small>Pay when your order arrives</small>
                  </div>

                  <span className="payment-radio">
                    {paymentMethod === 'cod' ? '✓' : ''}
                  </span>
                </button>

                <button
                  type="button"
                  className={`payment-option ${
                    paymentMethod === 'upi'
                      ? 'selected'
                      : ''
                  }`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  <span className="payment-icon">📱</span>

                  <div>
                    <strong>UPI</strong>
                    <small>
                      Google Pay, PhonePe, Paytm and more
                    </small>
                  </div>

                  <span className="payment-radio">
                    {paymentMethod === 'upi' ? '✓' : ''}
                  </span>
                </button>

                <button
                  type="button"
                  className={`payment-option ${
                    paymentMethod === 'card'
                      ? 'selected'
                      : ''
                  }`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <span className="payment-icon">💳</span>

                  <div>
                    <strong>Credit / Debit Card</strong>
                    <small>Visa, Mastercard and more</small>
                  </div>

                  <span className="payment-radio">
                    {paymentMethod === 'card' ? '✓' : ''}
                  </span>
                </button>
              </div>

              {(paymentMethod === 'upi' ||
                paymentMethod === 'card') && (
                <div className="payment-demo-note">
                  <span>ℹ️</span>
                  <p>
                    Online payment integration will be connected
                    to the payment provider later. For now,
                    placing the order creates the order record
                    without charging your card or UPI account.
                  </p>
                </div>
              )}
            </div>

            <div className="checkout-card">
              <div className="card-heading">
                <div>
                  <h2>Order summary</h2>
                  <p>
                    {itemCount}{' '}
                    {itemCount === 1 ? 'item' : 'items'}
                  </p>
                </div>

                <button
                  type="button"
                  className="edit-cart"
                  onClick={() => navigate('/cart')}
                >
                  Edit cart
                </button>
              </div>

              <div className="checkout-items">
                {cart.map((item) => (
                  <div
                    className="checkout-item"
                    key={item.variantId || item.key || `${item.name}-${item.variant}`}
                  >
                    <div className="checkout-item-image">
                      {item.emoji}
                    </div>

                    <div className="checkout-item-info">
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
          </section>

          <aside className="checkout-right">
            <div className="checkout-bill">
              <h2>Bill details</h2>

              <div className="bill-line">
                <span>
                  Item total
                  <small> ({itemCount})</small>
                </span>
                <strong>₹{subtotal}</strong>
              </div>

              <div className="bill-line">
                <span>MRP total</span>
                <strong>₹{mrpTotal}</strong>
              </div>

              {savings > 0 && (
                <div className="bill-line green">
                  <span>Product savings</span>
                  <strong>− ₹{savings}</strong>
                </div>
              )}

              <div className="bill-line">
                <span>Delivery fee</span>
                <strong>
                  {deliveryFee === 0
                    ? 'FREE'
                    : `₹${deliveryFee}`}
                </strong>
              </div>

              <div className="bill-line">
                <span>Handling charge</span>
                <strong>₹{handlingFee}</strong>
              </div>

              <div className="bill-divider" />

              <div className="grand-total">
                <span>Grand total</span>
                <strong>₹{grandTotal}</strong>
              </div>

              <div className="delivery-time">
                <span>⚡</span>

                <div>
                  <strong>Arriving in 10 minutes</strong>
                  <small>
                    Estimated delivery after order confirmation
                  </small>
                </div>
              </div>

              <button
                type="button"
                className="place-order-button"
                disabled={
                  !selectedAddress ||
                  placingOrder ||
                  cart.length === 0
                }
                onClick={placeOrder}
              >
                {placingOrder
                  ? 'Placing order...'
                  : `Place Order · ₹${grandTotal}`}
              </button>

              {!selectedAddress && (
                <p className="address-warning">
                  Please select or add a delivery address.
                </p>
              )}

              <div className="secure-payment">
                🔒 Safe & secure checkout
              </div>
            </div>
          </aside>
        </div>
      </main>

      <style>{styles}</style>
    </div>
  )
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .checkout-page {
    min-height: 100vh;
    background:
      radial-gradient(circle at 8% 0%, rgba(0, 200, 83, .08), transparent 28%),
      radial-gradient(circle at 92% 8%, rgba(255, 214, 10, .13), transparent 25%),
      #f7f8f5;
    color: #172018;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
  }

  .checkout-header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(255, 255, 255, .92);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid #e7ebe5;
    box-shadow: 0 5px 24px rgba(21, 45, 27, .05);
  }

  .checkout-header-inner {
    max-width: 1220px;
    min-height: 76px;
    margin: 0 auto;
    padding: 13px 24px;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .checkout-logo {
    border: 0;
    background: transparent;
    padding: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    flex-shrink: 0;
  }

  .checkout-logo-icon {
    width: 42px;
    height: 42px;
    border-radius: 13px;
    background: #ffd60a;
    display: grid;
    place-items: center;
    box-shadow: 0 7px 18px rgba(255, 214, 10, .25);
    transform: rotate(-3deg);
    transition: transform .25s ease;
  }

  .checkout-logo:hover .checkout-logo-icon {
    transform: rotate(0) scale(1.06);
  }

  .checkout-logo-mark {
    font-size: 24px;
    line-height: 1;
    font-weight: 950;
    color: #0f2014;
    letter-spacing: -2px;
  }

  .checkout-brand-text {
    font-size: 24px;
    font-weight: 900;
    letter-spacing: -1.2px;
    color: #0f1d13;
  }

  .checkout-brand-text span {
    color: #00a83b;
  }

  .checkout-heading {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #607065;
    font-size: 12px;
    font-weight: 700;
  }

  .checkout-heading::before {
    content: "🔒";
    width: 27px;
    height: 27px;
    border-radius: 9px;
    background: #eefaf1;
    display: grid;
    place-items: center;
    font-size: 12px;
  }

  .checkout-back {
    border: 1px solid #e1e7e1;
    border-radius: 12px;
    background: #fff;
    padding: 10px 14px;
    color: #233027;
    cursor: pointer;
    font-size: 11px;
    font-weight: 800;
    transition: .2s ease;
  }

  .checkout-back:hover {
    border-color: #b9d8c0;
    background: #f5fbf6;
    transform: translateY(-1px);
  }

  .checkout-main {
    max-width: 1220px;
    margin: 0 auto;
    padding: 28px 24px 90px;
  }

  .checkout-progress {
    max-width: 760px;
    margin: 0 auto 30px;
    padding: 12px 18px;
    border: 1px solid #e5ebe5;
    border-radius: 18px;
    background: rgba(255,255,255,.8);
    box-shadow: 0 10px 28px rgba(25, 54, 32, .05);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .progress-step {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #a4ada6;
    font-size: 11px;
    font-weight: 800;
    white-space: nowrap;
    transition: .25s ease;
  }

  .progress-step span {
    width: 29px;
    height: 29px;
    border-radius: 50%;
    border: 1px solid #d9e0da;
    background: #fff;
    display: grid;
    place-items: center;
    font-size: 10px;
    font-weight: 900;
    transition: .25s ease;
  }

  .progress-step.active {
    color: #087d32;
  }

  .progress-step.active span {
    background: #00c853;
    border-color: #00c853;
    color: #fff;
    box-shadow: 0 5px 14px rgba(0, 200, 83, .24);
  }

  .progress-line {
    height: 2px;
    width: 75px;
    background: #e2e8e3;
    margin: 0 12px;
    border-radius: 999px;
  }

  .progress-step.active + .progress-line {
    background: linear-gradient(90deg, #00c853, #dfe8e1);
  }

  .checkout-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) minmax(330px, .78fr);
    gap: 20px;
    align-items: start;
  }

  .checkout-left {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .checkout-card,
  .checkout-bill {
    background: rgba(255,255,255,.96);
    border: 1px solid #e4eae4;
    border-radius: 20px;
    padding: 23px;
    box-shadow: 0 10px 32px rgba(24, 53, 31, .055);
  }

  .checkout-card {
    animation: cardIn .45s ease both;
  }

  .checkout-left .checkout-card:nth-child(2) {
    animation-delay: .06s;
  }

  .checkout-left .checkout-card:nth-child(3) {
    animation-delay: .12s;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .card-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 19px;
  }

  .card-heading h1,
  .card-heading h2 {
    margin: 0;
    color: #172018;
    font-size: 19px;
    letter-spacing: -.45px;
  }

  .card-heading p {
    margin: 6px 0 0;
    color: #7c887f;
    font-size: 11px;
    line-height: 1.45;
  }

  .add-address-button,
  .edit-cart {
    border: 1px solid #bce3c7;
    border-radius: 10px;
    background: #f1fff4;
    color: #078238;
    padding: 8px 11px;
    font-size: 10px;
    font-weight: 900;
    cursor: pointer;
    transition: .2s ease;
  }

  .add-address-button:hover,
  .edit-cart:hover {
    background: #e3fae9;
    transform: translateY(-1px);
  }

  .address-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .address-card {
    position: relative;
    border: 1px solid #e0e7e1;
    border-radius: 14px;
    padding: 14px;
    background: #fff;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    transition: .22s ease;
  }

  .address-card:hover {
    border-color: #bddcc4;
    box-shadow: 0 8px 22px rgba(21, 70, 35, .06);
  }

  .address-card.selected {
    border: 2px solid #00b843;
    background: linear-gradient(135deg, #f5fff7, #fff);
    padding: 13px;
    box-shadow: 0 7px 22px rgba(0, 200, 83, .08);
  }

  .address-select {
    flex: 1;
    min-width: 0;
    border: 0;
    background: transparent;
    padding: 0;
    display: flex;
    align-items: flex-start;
    gap: 11px;
    text-align: left;
    cursor: pointer;
  }

  .radio,
  .payment-radio {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    border-radius: 50%;
    border: 1px solid #c7d0c8;
    background: #fff;
    display: grid;
    place-items: center;
    font-size: 10px;
    font-weight: 900;
    margin-top: 2px;
    transition: .2s ease;
  }

  .address-card.selected .radio,
  .payment-option.selected .payment-radio {
    background: #00c853;
    border-color: #00c853;
    color: #fff;
    box-shadow: 0 4px 10px rgba(0, 200, 83, .2);
  }

  .address-content {
    min-width: 0;
  }

  .address-name-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .address-name-row strong {
    font-size: 13px;
  }

  .address-name-row span {
    padding: 3px 7px;
    border-radius: 5px;
    background: #fff1b9;
    color: #7b6500;
    font-size: 8px;
    font-weight: 900;
    letter-spacing: .5px;
  }

  .address-content p {
    margin: 7px 0;
    color: #667269;
    font-size: 11px;
    line-height: 1.55;
  }

  .address-content small {
    color: #7b867e;
    font-size: 10px;
  }

  .delete-address {
    border: 0;
    background: #f7f8f7;
    width: 27px;
    height: 27px;
    border-radius: 8px;
    color: #98a19a;
    font-size: 17px;
    cursor: pointer;
    transition: .2s ease;
  }

  .delete-address:hover {
    background: #fff0f0;
    color: #c62828;
  }

  .address-form {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 16px;
    border-radius: 15px;
    background: linear-gradient(135deg, #f7fff8, #fff);
    border: 1px dashed #b9ddc1;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .address-form label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    color: #526057;
    font-size: 10px;
    font-weight: 800;
  }

  .address-form input,
  .address-form textarea {
    width: 100%;
    border: 1px solid #dce4dd;
    border-radius: 10px;
    background: #fff;
    padding: 11px 12px;
    outline: none;
    font: inherit;
    font-size: 12px;
    color: #172018;
    resize: vertical;
    transition: .2s ease;
  }

  .address-form input:focus,
  .address-form textarea:focus {
    border-color: #00b843;
    box-shadow: 0 0 0 3px rgba(0, 200, 83, .09);
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 9px;
  }

  .cancel-address,
  .save-address {
    border: 0;
    border-radius: 10px;
    padding: 11px 16px;
    cursor: pointer;
    font-size: 11px;
    font-weight: 900;
    transition: .2s ease;
  }

  .cancel-address {
    background: #eef1ee;
    color: #39443d;
  }

  .save-address {
    background: #00c853;
    color: #fff;
    box-shadow: 0 7px 16px rgba(0, 200, 83, .18);
  }

  .save-address:hover {
    background: #00b848;
    transform: translateY(-1px);
  }

  .payment-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .payment-option {
    width: 100%;
    border: 1px solid #e0e7e1;
    border-radius: 14px;
    background: #fff;
    padding: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    text-align: left;
    cursor: pointer;
    transition: .22s ease;
  }

  .payment-option:hover {
    border-color: #bcdcc4;
    transform: translateY(-1px);
  }

  .payment-option.selected {
    border: 2px solid #00b843;
    padding: 13px;
    background: #f7fff8;
  }

  .payment-icon {
    width: 40px;
    height: 40px;
    border-radius: 11px;
    background: #f2f6f2;
    display: grid;
    place-items: center;
    font-size: 19px;
    flex-shrink: 0;
  }

  .payment-option.selected .payment-icon {
    background: #e6faeb;
  }

  .payment-option > div {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .payment-option strong {
    color: #1d2820;
    font-size: 12px;
  }

  .payment-option small {
    color: #89938b;
    font-size: 9px;
  }

  .payment-demo-note {
    margin-top: 12px;
    padding: 11px 12px;
    border-radius: 11px;
    background: #fff9dc;
    border: 1px solid #f4e5a0;
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .payment-demo-note p {
    margin: 0;
    color: #716000;
    font-size: 9px;
    line-height: 1.55;
  }

  .checkout-items {
    display: flex;
    flex-direction: column;
    gap: 11px;
  }

  .checkout-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 5px 0 11px;
    border-bottom: 1px solid #eef1ee;
  }

  .checkout-item:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }

  .checkout-item-image {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: #f3f8f3;
    display: grid;
    place-items: center;
    font-size: 25px;
    flex-shrink: 0;
  }

  .checkout-item-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .checkout-item-info strong {
    font-size: 11px;
    color: #263229;
  }

  .checkout-item-info span {
    color: #89938b;
    font-size: 9px;
  }

  .checkout-item > strong {
    font-size: 11px;
    color: #1b271f;
  }

  .checkout-right {
    position: sticky;
    top: 96px;
  }

  .checkout-bill {
    overflow: hidden;
  }

  .checkout-bill::before {
    content: "";
    display: block;
    height: 4px;
    margin: -23px -23px 21px;
    background: linear-gradient(90deg, #00c853, #a7df36, #ffd60a);
  }

  .checkout-bill h2 {
    margin: 0 0 19px;
    font-size: 18px;
    letter-spacing: -.3px;
  }

  .bill-line {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 13px;
    font-size: 12px;
  }

  .bill-line span {
    color: #69756d;
  }

  .bill-line small {
    color: #9aa39d;
    font-size: 9px;
  }

  .bill-line strong {
    color: #303b34;
  }

  .bill-line.green span,
  .bill-line.green strong {
    color: #078238;
  }

  .bill-divider {
    height: 1px;
    background: #e9eee9;
    margin: 18px 0;
  }

  .grand-total {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .grand-total span {
    font-size: 13px;
    font-weight: 800;
  }

  .grand-total strong {
    font-size: 22px;
    letter-spacing: -.5px;
  }

  .delivery-time {
    margin-top: 17px;
    padding: 13px;
    background: linear-gradient(135deg, #effcf2, #f8fff9);
    border: 1px solid #d8f0dc;
    border-radius: 12px;
    display: flex;
    gap: 9px;
    align-items: center;
  }

  .delivery-time > span {
    width: 33px;
    height: 33px;
    border-radius: 10px;
    background: #dff8e6;
    display: grid;
    place-items: center;
    font-size: 17px;
  }

  .delivery-time div {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .delivery-time strong {
    color: #087d32;
    font-size: 11px;
  }

  .delivery-time small {
    color: #718077;
    font-size: 8px;
  }

  .place-order-button {
    position: relative;
    overflow: hidden;
    width: 100%;
    min-height: 50px;
    margin-top: 15px;
    border: 0;
    border-radius: 13px;
    background: linear-gradient(135deg, #00c853, #00a83b);
    color: #fff;
    cursor: pointer;
    font-size: 12px;
    font-weight: 900;
    box-shadow: 0 9px 22px rgba(0, 168, 59, .23);
    transition: .22s ease;
  }

  .place-order-button::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(110deg, transparent 25%, rgba(255,255,255,.25) 48%, transparent 70%);
    transform: translateX(-120%);
    transition: transform .6s ease;
  }

  .place-order-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 27px rgba(0, 168, 59, .28);
  }

  .place-order-button:hover:not(:disabled)::after {
    transform: translateX(120%);
  }

  .place-order-button:disabled {
    opacity: .45;
    cursor: not-allowed;
    box-shadow: none;
  }

  .address-warning {
    margin: 9px 0 0;
    color: #b3261e;
    text-align: center;
    font-size: 9px;
    font-weight: 700;
  }

  .secure-payment {
    margin-top: 13px;
    color: #87918a;
    text-align: center;
    font-size: 9px;
    font-weight: 700;
  }

  @media (max-width: 850px) {
    .checkout-layout {
      grid-template-columns: 1fr;
    }

    .checkout-right {
      position: static;
    }

    .checkout-bill {
      margin-top: 0;
    }
  }

  @media (max-width: 600px) {
    .checkout-header-inner {
      min-height: 66px;
      padding: 9px 14px;
      gap: 10px;
    }

    .checkout-logo-icon {
      width: 37px;
      height: 37px;
      border-radius: 11px;
    }

    .checkout-logo-mark {
      font-size: 21px;
    }

    .checkout-brand-text {
      font-size: 21px;
    }

    .checkout-heading {
      display: none;
    }

    .checkout-back {
      margin-left: auto;
      font-size: 10px;
      padding: 9px 10px;
    }

    .checkout-main {
      padding: 17px 12px 60px;
    }

    .checkout-progress {
      margin-bottom: 18px;
      padding: 10px 8px;
      border-radius: 15px;
    }

    .progress-line {
      width: 28px;
      margin: 0 5px;
    }

    .progress-step strong {
      display: none;
    }

    .checkout-card,
    .checkout-bill {
      padding: 16px;
      border-radius: 17px;
    }

    .checkout-bill::before {
      margin: -16px -16px 17px;
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .card-heading h1,
    .card-heading h2 {
      font-size: 17px;
    }

    .address-card {
      padding: 12px;
    }

    .address-card.selected {
      padding: 11px;
    }

    .payment-option {
      padding: 12px;
    }

    .payment-option.selected {
      padding: 11px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .checkout-card,
    .checkout-logo-icon,
    .checkout-back,
    .add-address-button,
    .edit-cart,
    .save-address,
    .payment-option,
    .place-order-button {
      animation: none !important;
      transition: none !important;
      transform: none !important;
    }

    .place-order-button::after {
      display: none;
    }
  }
`