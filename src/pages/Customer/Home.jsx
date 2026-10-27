import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const PRODUCTS = [
  {
    id: 'milk',
    name: 'Amul Taaza Milk',
    category: 'Dairy',
    emoji: '🥛',
    description: 'Fresh and nutritious toned milk.',
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
    description: 'Fresh, naturally sweet bananas.',
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
    description: 'Soft and wholesome brown bread.',
    variants: [
      { id: 'bread-400', label: '400 g', price: 45, mrp: 50, stock: 7 },
    ],
  },
  {
    id: 'eggs',
    name: 'Farm Eggs',
    category: 'Dairy',
    emoji: '🥚',
    description: 'Fresh farm eggs for your everyday meals.',
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
    description: 'Classic salted potato chips.',
    variants: [
      { id: 'lays-52', label: '52 g', price: 20, mrp: 20, stock: 25 },
    ],
  },
  {
    id: 'salt',
    name: 'Tata Salt',
    category: 'Essentials',
    emoji: '🧂',
    description: 'Iodised salt for everyday cooking.',
    variants: [
      { id: 'salt-1kg', label: '1 kg', price: 28, mrp: 30, stock: 16 },
    ],
  },
  {
    id: 'coke',
    name: 'Coca-Cola',
    category: 'Beverages',
    emoji: '🥤',
    description: 'Refreshing sparkling soft drink.',
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
    description: 'Fresh red tomatoes for cooking and salads.',
    variants: [
      { id: 'tomato-500', label: '500 g', price: 29, mrp: 38, stock: 4 },
      { id: 'tomato-1kg', label: '1 kg', price: 55, mrp: 76, stock: 0 },
    ],
  },
]

const CATEGORIES = [
  { name: 'All', emoji: '🛍️' },
  { name: 'Dairy', emoji: '🥛' },
  { name: 'Fruits', emoji: '🍎' },
  { name: 'Vegetables', emoji: '🥕' },
  { name: 'Snacks', emoji: '🍿' },
  { name: 'Beverages', emoji: '🥤' },
  { name: 'Bakery', emoji: '🍞' },
  { name: 'Essentials', emoji: '🧂' },
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

function ProductCard({ product, onAdd, onOpen, index = 0, added }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0])

  const availableVariants = product.variants.filter((variant) => variant.stock > 0)
  const activeVariant =
    selectedVariant?.stock > 0 ? selectedVariant : availableVariants[0]

  const discount =
    activeVariant && activeVariant.mrp > activeVariant.price
      ? Math.round(((activeVariant.mrp - activeVariant.price) / activeVariant.mrp) * 100)
      : 0

  return (
    <article className="bh-product" style={{ animationDelay: `${Math.min(index, 7) * 45}ms` }}>
      <div className="bh-product-image" onClick={onOpen}>
        <span className="bh-product-emoji">{product.emoji}</span>
        {discount > 0 && <div className="bh-discount">{discount}% OFF</div>}
        <button
          className="bh-view"
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onOpen()
          }}
        >
          View product
        </button>
      </div>

      <div className="bh-product-info">
        <div className="bh-delivery-time">⚡ 10 mins delivery</div>
        <h3 className="bh-product-name" onClick={onOpen}>{product.name}</h3>
        <p className="bh-description">{product.description}</p>

        {product.variants.length > 1 ? (
          <select
            className="bh-variant"
            value={activeVariant?.id || ''}
            onChange={(event) => {
              const variant = product.variants.find((item) => item.id === event.target.value)
              if (variant) setSelectedVariant(variant)
            }}
          >
            {product.variants.map((variant) => (
              <option key={variant.id} value={variant.id} disabled={variant.stock <= 0}>
                {variant.label}{variant.stock <= 0 ? ' — Out of stock' : ''}
              </option>
            ))}
          </select>
        ) : (
          <div className="bh-single-variant">{activeVariant?.label}</div>
        )}

        <div className="bh-product-bottom">
          <div>
            <span className="bh-price">₹{activeVariant?.price ?? '-'}</span>
            {activeVariant?.mrp > activeVariant?.price && (
              <span className="bh-mrp">₹{activeVariant.mrp}</span>
            )}
          </div>

          <button
            className={`bh-add ${added ? 'added' : ''}`}
            type="button"
            disabled={!activeVariant || activeVariant.stock <= 0}
            onClick={() => onAdd(product, activeVariant)}
          >
            {activeVariant?.stock > 0 ? (added ? '✓ ADDED' : 'ADD') : 'OUT'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState(getCart)
  const [addedProduct, setAddedProduct] = useState(null)

  useEffect(() => {
    const updateCart = () => setCart(getCart())
    window.addEventListener('cartUpdated', updateCart)
    return () => window.removeEventListener('cartUpdated', updateCart)
  }, [])

  useEffect(() => {
    if (!addedProduct) return
    const timer = window.setTimeout(() => setAddedProduct(null), 1200)
    return () => window.clearTimeout(timer)
  }, [addedProduct])

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart],
  )

  const cartTotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart],
  )

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return PRODUCTS.filter((product) => {
      const matchesCategory = category === 'All' || product.category === category
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [category, search])

  function addToCart(product, variant) {
    if (!variant || variant.stock <= 0) return

    const currentCart = getCart()
    const existingIndex = currentCart.findIndex((item) => item.variantId === variant.id)

    const updatedCart =
      existingIndex >= 0
        ? currentCart.map((item, index) =>
            index === existingIndex
              ? { ...item, quantity: Math.min(item.quantity + 1, variant.stock) }
              : item,
          )
        : [
            ...currentCart,
            {
              productId: product.id,
              variantId: variant.id,
              name: product.name,
              category: product.category,
              emoji: product.emoji,
              variant: variant.label,
              price: variant.price,
              mrp: variant.mrp,
              quantity: 1,
            },
          ]

    saveCart(updatedCart)
    setCart(updatedCart)
    setAddedProduct(product.id)
  }

  function openProduct(productId) {
    navigate(`/products/${productId}`)
  }

  function resetHome() {
    setCategory('All')
    setSearch('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="blinkit-home">
      <style>{`
        .blinkit-home{--green:#0c831f;--green-dark:#076617;--green-soft:#eaf8ec;--yellow:#f7d708;--ink:#202020;--muted:#707070;min-height:100vh;background:radial-gradient(circle at 4% 10%,rgba(247,215,8,.11),transparent 22rem),radial-gradient(circle at 94% 24%,rgba(12,131,31,.08),transparent 24rem),#fafafa;color:var(--ink);font-family:Inter,Arial,sans-serif;overflow-x:hidden}
        .blinkit-home *,.blinkit-home *::before,.blinkit-home *::after{box-sizing:border-box}
        .bh-header{position:sticky;top:0;z-index:100;background:rgba(255,255,255,.94);backdrop-filter:blur(18px);border-bottom:1px solid rgba(0,0,0,.07)}
        .bh-nav{max-width:1440px;min-height:76px;margin:auto;padding:12px 32px;display:grid;grid-template-columns:auto auto minmax(240px,1fr) auto;align-items:center;gap:24px}
        .bh-brand{border:0;background:transparent;cursor:pointer;display:flex;align-items:center;gap:10px;padding:0}
        .bh-brand-mark{width:43px;height:43px;display:grid;place-items:center;border-radius:13px;background:var(--yellow);font-size:23px;box-shadow:0 7px 18px rgba(247,215,8,.25);transition:transform .25s ease}
        .bh-brand:hover .bh-brand-mark{transform:rotate(-7deg) scale(1.06)}
        .bh-brand-name{font-size:25px;line-height:1;font-weight:900;letter-spacing:-1.4px}
        .bh-delivery{min-width:150px;cursor:pointer}.bh-delivery small{display:block;color:#8a8a8a;font-size:9px;font-weight:800;letter-spacing:.9px}.bh-delivery strong{display:block;margin-top:3px;font-size:13px}
        .bh-search{height:48px;border:1px solid #e8e8e8;border-radius:14px;background:#f4f5f4;display:flex;align-items:center;gap:11px;padding:0 15px;transition:.2s ease}
        .bh-search:focus-within{background:#fff;border-color:rgba(12,131,31,.35);box-shadow:0 0 0 4px rgba(12,131,31,.08)}
        .bh-search-icon{font-size:21px;color:#606060}.bh-search input{width:100%;border:0;outline:0;background:transparent;color:var(--ink);font-size:14px}.bh-clear{border:0;background:transparent;color:#777;font-size:19px;cursor:pointer;padding:3px}
        .bh-actions{display:flex;align-items:center;gap:8px}.bh-action{min-height:43px;border:0;border-radius:11px;padding:0 13px;background:transparent;cursor:pointer;font-size:13px;font-weight:650;transition:.2s}.bh-action:hover{background:#f2f2f2;transform:translateY(-1px)}
        .bh-cart{min-height:45px;padding:0 15px;border:0;border-radius:12px;background:#111;color:#fff;display:flex;align-items:center;gap:9px;cursor:pointer;font-weight:800;box-shadow:0 8px 20px rgba(0,0,0,.12);transition:.2s}.bh-cart:hover{transform:translateY(-2px);background:#242424}
        .bh-cart-count{min-width:21px;height:21px;padding:0 5px;border-radius:999px;display:grid;place-items:center;background:var(--yellow);color:#111;font-size:10px}
        .bh-main{max-width:1440px;margin:auto}.bh-hero-wrap{padding:28px 32px 10px}.bh-hero{min-height:300px;border-radius:28px;position:relative;overflow:hidden;isolation:isolate;display:flex;align-items:center;padding:42px 52px;background:linear-gradient(120deg,#fff5a7 0%,#fffbdc 48%,#eaf8ec 100%);box-shadow:0 18px 55px rgba(0,0,0,.07)}
        .bh-hero::before,.bh-hero::after{content:"";position:absolute;border-radius:50%;z-index:-1;pointer-events:none}.bh-hero::before{width:310px;height:310px;right:-90px;top:-110px;background:rgba(255,255,255,.5)}.bh-hero::after{width:190px;height:190px;right:170px;bottom:-120px;background:rgba(12,131,31,.08)}
        .bh-hero-content{max-width:670px;position:relative;z-index:2}.bh-pill{display:inline-flex;align-items:center;gap:7px;background:#111;color:#fff;border-radius:999px;padding:8px 13px;font-size:10px;font-weight:850;letter-spacing:.5px}
        .bh-hero h1{margin:15px 0 0;font-size:clamp(35px,5vw,63px);line-height:.98;letter-spacing:-3px}.bh-hero h1 span{color:var(--green)}.bh-hero p{max-width:580px;margin:17px 0 0;color:#555;font-size:15px;line-height:1.6}
        .bh-hero-buttons{margin-top:24px;display:flex;gap:10px;flex-wrap:wrap}.bh-primary{border:0;border-radius:12px;background:var(--green);color:#fff;padding:12px 18px;font-weight:800;cursor:pointer;box-shadow:0 10px 20px rgba(12,131,31,.2);transition:.2s}.bh-primary:hover{background:var(--green-dark);transform:translateY(-2px)}
        .bh-secondary{border:1px solid rgba(0,0,0,.1);border-radius:12px;background:rgba(255,255,255,.72);padding:12px 18px;font-weight:750;cursor:pointer}
        .bh-hero-visual{position:absolute;right:55px;bottom:-7px;width:310px;height:260px;display:grid;place-items:center;pointer-events:none}.bh-basket{width:205px;height:140px;border-radius:30px 30px 55px 55px;background:#fff;box-shadow:0 25px 45px rgba(0,0,0,.13);display:flex;align-items:flex-end;justify-content:center;padding-bottom:17px;font-size:95px;transform:rotate(-5deg);animation:bh-float 3.4s ease-in-out infinite}
        .bh-floating-food{position:absolute;font-size:42px;animation:bh-float 3s ease-in-out infinite}.bh-food-1{left:8px;top:27px}.bh-food-2{right:18px;top:50px;animation-delay:-.9s}.bh-food-3{left:35px;bottom:14px;animation-delay:-1.3s;font-size:32px}
        @keyframes bh-float{0%,100%{transform:translateY(0) rotate(-5deg)}50%{transform:translateY(-10px) rotate(2deg)}}
        .bh-trust-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:14px 32px 4px}.bh-trust-card{border:1px solid #ededed;background:#fff;border-radius:16px;padding:15px 17px;display:flex;align-items:center;gap:12px;box-shadow:0 7px 22px rgba(0,0,0,.035)}.bh-trust-icon{width:38px;height:38px;flex:0 0 38px;display:grid;place-items:center;border-radius:12px;background:var(--green-soft);font-size:18px}.bh-trust-card strong{display:block;font-size:12px}.bh-trust-card span{display:block;margin-top:3px;color:#777;font-size:10px}
        .bh-section{padding:28px 32px 0}.bh-section-head{display:flex;align-items:end;justify-content:space-between;gap:15px;margin-bottom:15px}.bh-section-head h2{margin:0;font-size:23px;letter-spacing:-.8px}.bh-section-head p{margin:4px 0 0;color:#777;font-size:12px}.bh-see-all{border:0;background:transparent;color:var(--green);cursor:pointer;font-weight:800;font-size:12px}
        .bh-categories{display:grid;grid-template-columns:repeat(8,minmax(90px,1fr));gap:12px}.bh-category{min-height:112px;border:1px solid #ececec;border-radius:18px;background:#fff;cursor:pointer;padding:13px 8px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;position:relative;overflow:hidden;transition:.2s}.bh-category::after{content:"";position:absolute;width:75px;height:75px;border-radius:50%;top:-33px;right:-25px;background:rgba(247,215,8,.14)}.bh-category:hover{transform:translateY(-4px);box-shadow:0 13px 30px rgba(0,0,0,.08)}.bh-category.active{border-color:var(--green);box-shadow:0 0 0 2px rgba(12,131,31,.1);transform:translateY(-2px)}.bh-category-icon{width:55px;height:55px;display:grid;place-items:center;border-radius:17px;background:#f7f7f7;font-size:29px;z-index:1}.bh-category.active .bh-category-icon{background:var(--green-soft)}.bh-category span:last-child{font-size:11px;font-weight:750}
        .bh-offers{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:13px}.bh-offer{min-height:145px;border:0;border-radius:20px;padding:22px;position:relative;overflow:hidden;text-align:left;cursor:pointer;transition:transform .2s}.bh-offer:hover{transform:translateY(-3px)}.bh-offer:nth-child(1){background:linear-gradient(135deg,#0c831f,#42b84f);color:#fff}.bh-offer:nth-child(2){background:linear-gradient(135deg,#fff0a0,#ffe15a)}.bh-offer:nth-child(3){background:linear-gradient(135deg,#ffe1dc,#ffc0b4)}.bh-offer strong{display:block;max-width:230px;font-size:18px;line-height:1.15}.bh-offer span{display:block;margin-top:9px;font-size:11px;opacity:.78}.bh-offer-emoji{position:absolute;right:18px;bottom:-8px;font-size:73px;transform:rotate(-7deg);opacity:.9}
        .bh-products-section{padding-bottom:115px}.bh-product-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:15px}.bh-product{border:1px solid #ededed;border-radius:18px;overflow:hidden;background:#fff;box-shadow:0 7px 25px rgba(0,0,0,.035);transition:.22s;animation:bh-card-in .4s ease both}.bh-product:hover{transform:translateY(-5px);box-shadow:0 16px 34px rgba(0,0,0,.09)}
        @keyframes bh-card-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.bh-product-image{height:190px;background:linear-gradient(145deg,#f8f8f8,#f1f6f1);display:grid;place-items:center;position:relative;cursor:pointer}.bh-product-emoji{font-size:83px;transition:.25s;filter:drop-shadow(0 12px 10px rgba(0,0,0,.08))}.bh-product:hover .bh-product-emoji{transform:scale(1.08) translateY(-3px)}.bh-discount{position:absolute;top:10px;left:10px;padding:6px 8px;border-radius:8px;background:var(--green-soft);color:var(--green);font-size:9px;font-weight:900}.bh-view{position:absolute;right:10px;bottom:10px;border:0;border-radius:9px;background:rgba(255,255,255,.92);padding:7px 9px;font-size:9px;font-weight:850;cursor:pointer;opacity:0;transform:translateY(5px);transition:.2s}.bh-product:hover .bh-view{opacity:1;transform:translateY(0)}
        .bh-product-info{padding:14px}.bh-delivery-time{color:var(--green);font-size:9px;font-weight:850;margin-bottom:6px;text-transform:uppercase;letter-spacing:.4px}.bh-product-name{margin:0;font-size:14px;line-height:1.25;cursor:pointer}.bh-description{min-height:31px;margin:6px 0 10px;color:#7a7a7a;font-size:10px;line-height:1.45}.bh-variant,.bh-single-variant{width:100%;min-height:35px;border:1px solid #e2e2e2;border-radius:9px;background:#fff;outline:0;padding:0 8px;font-size:10px;color:#333}.bh-single-variant{display:flex;align-items:center;padding:0 9px}.bh-product-bottom{margin-top:13px;display:flex;justify-content:space-between;align-items:center;gap:8px}.bh-price{font-size:17px;font-weight:900}.bh-mrp{display:inline-block;margin-left:5px;color:#999;font-size:10px;text-decoration:line-through}.bh-add{min-width:68px;height:35px;border:1px solid var(--green);border-radius:9px;background:#fff;color:var(--green);cursor:pointer;font-size:10px;font-weight:900;transition:.2s}.bh-add:hover:not(:disabled),.bh-add.added{background:var(--green);color:#fff;transform:scale(1.04)}.bh-add:disabled{opacity:.4;cursor:not-allowed}
        .bh-empty{grid-column:1/-1;padding:75px 20px;border:1px dashed #ddd;border-radius:20px;background:#fff;text-align:center}.bh-empty-icon{font-size:48px}.bh-empty h3{margin:12px 0 5px}.bh-empty p{margin:0;color:#777;font-size:12px}
        .bh-floating-cart{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);width:min(450px,calc(100vw - 28px));min-height:61px;z-index:90;border:0;border-radius:17px;background:#111;color:#fff;display:flex;justify-content:space-between;align-items:center;padding:10px 13px;cursor:pointer;box-shadow:0 16px 45px rgba(0,0,0,.24);animation:bh-cart-in .3s ease}.bh-floating-left{display:flex;align-items:center;gap:10px}.bh-floating-icon{width:38px;height:38px;border-radius:11px;background:var(--yellow);color:#111;display:grid;place-items:center}.bh-floating-text{text-align:left}.bh-floating-text strong{display:block;font-size:12px}.bh-floating-text span{display:block;color:#aaa;margin-top:2px;font-size:9px}.bh-floating-total{font-size:14px;font-weight:900}
        @keyframes bh-cart-in{from{opacity:0;transform:translate(-50%,20px)}to{opacity:1;transform:translate(-50%,0)}}.bh-toast{position:fixed;left:50%;top:90px;z-index:120;transform:translateX(-50%);background:#111;color:#fff;border-radius:999px;padding:10px 15px;font-size:11px;font-weight:750;box-shadow:0 12px 30px rgba(0,0,0,.18);animation:bh-toast .25s ease}@keyframes bh-toast{from{opacity:0;transform:translate(-50%,-7px)}to{opacity:1;transform:translate(-50%,0)}}
        @media(max-width:1150px){.bh-nav{grid-template-columns:auto minmax(200px,1fr) auto}.bh-delivery{display:none}.bh-categories{grid-template-columns:repeat(4,1fr)}.bh-product-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
        @media(max-width:820px){.bh-nav{padding:10px 16px;gap:10px}.bh-brand-name{display:none}.bh-action{display:none}.bh-hero-wrap{padding:15px 16px 8px}.bh-hero{min-height:310px;padding:30px 25px}.bh-hero h1{letter-spacing:-1.8px}.bh-hero-visual{right:-18px;opacity:.55;transform:scale(.8);transform-origin:bottom right}.bh-trust-row{padding-left:16px;padding-right:16px;grid-template-columns:1fr}.bh-section{padding-left:16px;padding-right:16px}.bh-offers{grid-template-columns:1fr 1fr}.bh-offer:first-child{grid-column:1/-1}.bh-product-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}}
        @media(max-width:520px){.bh-nav{grid-template-columns:auto 1fr auto}.bh-brand-mark{width:39px;height:39px}.bh-search{height:42px}.bh-cart{min-height:42px;padding:0 10px}.bh-cart-label{display:none}.bh-hero{min-height:360px;border-radius:22px;padding:25px 21px}.bh-hero h1{font-size:35px}.bh-hero p{max-width:275px;font-size:12px}.bh-hero-visual{right:-42px;bottom:-30px;opacity:.42;transform:scale(.7)}.bh-categories{display:flex;overflow-x:auto;padding-bottom:5px;scrollbar-width:none}.bh-categories::-webkit-scrollbar{display:none}.bh-category{min-width:88px}.bh-offers{grid-template-columns:1fr}.bh-offer:first-child{grid-column:auto}.bh-product-image{height:145px}.bh-product-emoji{font-size:62px}.bh-view{display:none}.bh-product-info{padding:10px}.bh-product-name{font-size:12px}.bh-description{min-height:42px}}
        @media(prefers-reduced-motion:reduce){.bh-basket,.bh-floating-food,.bh-product,.bh-floating-cart,.bh-toast{animation:none!important}.bh-product,.bh-category,.bh-basket,.bh-brand-mark{transition:none!important}}
      `}</style>

      <header className="bh-header">
        <nav className="bh-nav">
          <button className="bh-brand" type="button" onClick={resetHome}>
            <span className="bh-brand-mark">🛒</span>
            <span className="bh-brand-name">blinkit</span>
          </button>

          <div className="bh-delivery">
            <small>DELIVER TO</small>
            <strong>📍 Your location ▾</strong>
          </div>

          <div className="bh-search">
            <span className="bh-search-icon">⌕</span>
            <input
              type="text"
              placeholder="Search for milk, fruits, snacks and more..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <button className="bh-clear" type="button" onClick={() => setSearch('')}>
                ×
              </button>
            )}
          </div>

          <div className="bh-actions">
            <button className="bh-action" type="button" onClick={() => navigate('/orders')}>Orders</button>
            <button className="bh-action" type="button" onClick={() => navigate('/profile')}>Account</button>
            <button className="bh-cart" type="button" onClick={() => navigate('/cart')}>
              <span className="bh-cart-label">🛒 Cart</span>
              <span className="bh-cart-count">{cartCount}</span>
            </button>
          </div>
        </nav>
      </header>

      <main className="bh-main">
        <section className="bh-hero-wrap">
          <div className="bh-hero">
            <div className="bh-hero-content">
              <span className="bh-pill">⚡ QUICK DELIVERY · 10 MINUTES</span>
              <h1>Groceries at your<br /><span>doorstep. Fast.</span></h1>
              <p>Fresh groceries, snacks, beverages and everyday essentials — delivered quickly whenever you need them.</p>
              <div className="bh-hero-buttons">
                <button className="bh-primary" type="button" onClick={() => document.querySelector('.bh-products-section')?.scrollIntoView({ behavior: 'smooth' })}>Start shopping →</button>
                <button className="bh-secondary" type="button" onClick={() => document.querySelector('.bh-offers-section')?.scrollIntoView({ behavior: 'smooth' })}>View offers</button>
              </div>
            </div>
            <div className="bh-hero-visual" aria-hidden="true">
              <span className="bh-floating-food bh-food-1">🥦</span>
              <span className="bh-floating-food bh-food-2">🥛</span>
              <span className="bh-floating-food bh-food-3">🍎</span>
              <div className="bh-basket">🛍️</div>
            </div>
          </div>
        </section>

        <section className="bh-trust-row">
          <div className="bh-trust-card"><div className="bh-trust-icon">⚡</div><div><strong>Lightning-fast delivery</strong><span>Your essentials, delivered in minutes.</span></div></div>
          <div className="bh-trust-card"><div className="bh-trust-icon">🥬</div><div><strong>Fresh everyday essentials</strong><span>Hand-picked products for your daily needs.</span></div></div>
          <div className="bh-trust-card"><div className="bh-trust-icon">💚</div><div><strong>Easy & convenient</strong><span>Shop, pay and track your order with ease.</span></div></div>
        </section>

        <section className="bh-section">
          <div className="bh-section-head">
            <div><h2>Shop by category</h2><p>Everything you need, organised for you.</p></div>
            <button className="bh-see-all" type="button" onClick={() => setCategory('All')}>View all</button>
          </div>

          <div className="bh-categories">
            {CATEGORIES.map((item) => (
              <button
                key={item.name}
                type="button"
                className={`bh-category ${category === item.name ? 'active' : ''}`}
                onClick={() => { setCategory(item.name); setSearch('') }}
              >
                <span className="bh-category-icon">{item.emoji}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="bh-section bh-offers-section">
          <div className="bh-section-head"><div><h2>Deals for you</h2><p>Save more on your everyday favourites.</p></div></div>
          <div className="bh-offers">
            <button className="bh-offer" type="button" onClick={() => { setCategory('All'); setSearch('') }}>
              <strong>Fresh picks for every day</strong><span>Explore groceries & essentials</span><span className="bh-offer-emoji">🥦</span>
            </button>
            <button className="bh-offer" type="button" onClick={() => setCategory('Snacks')}>
              <strong>Snack time</strong><span>Crunchy favourites</span><span className="bh-offer-emoji">🍿</span>
            </button>
            <button className="bh-offer" type="button" onClick={() => setCategory('Beverages')}>
              <strong>Chill & refresh</strong><span>Drinks for every mood</span><span className="bh-offer-emoji">🥤</span>
            </button>
          </div>
        </section>

        <section className="bh-section bh-products-section">
          <div className="bh-section-head">
            <div>
              <h2>{search ? `Search results for "${search}"` : category === 'All' ? 'Popular products' : category}</h2>
              <p>{search ? 'Products matching your search' : 'Picked for your everyday shopping'}</p>
            </div>
            <span style={{ color: '#777', fontSize: 11 }}>{filteredProducts.length} products</span>
          </div>

          <div className="bh-product-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  added={addedProduct === product.id}
                  onAdd={addToCart}
                  onOpen={() => openProduct(product.id)}
                />
              ))
            ) : (
              <div className="bh-empty">
                <div className="bh-empty-icon">🔎</div>
                <h3>No products found</h3>
                <p>Try another search or choose a different category.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {addedProduct && <div className="bh-toast">✓ Added to cart</div>}

      {cartCount > 0 && (
        <button className="bh-floating-cart" type="button" onClick={() => navigate('/cart')}>
          <div className="bh-floating-left">
            <div className="bh-floating-icon">🛒</div>
            <div className="bh-floating-text">
              <strong>{cartCount} {cartCount === 1 ? 'item' : 'items'} in cart</strong>
              <span>Tap to view your cart</span>
            </div>
          </div>
          <div className="bh-floating-total">₹{cartTotal} →</div>
        </button>
      )}
    </div>
  )
}
