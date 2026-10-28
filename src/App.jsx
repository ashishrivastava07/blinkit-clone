import { useCallback, useEffect, useState } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from './lib/supabase'
import './App.css'
import './dashboard.css'
import './product-catalogue.css'

const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const catalogueCategories = [
  { slug: '', name: 'All products' },
  { slug: 'fruits-vegetables', name: 'Fruits & vegetables' },
  { slug: 'dairy-breakfast', name: 'Dairy & breakfast' },
  { slug: 'atta-rice-dal', name: 'Atta, rice & dal' },
  { slug: 'oil-masala', name: 'Oil & masala' },
  { slug: 'snacks', name: 'Snacks' },
  { slug: 'beverages', name: 'Beverages' },
  { slug: 'bakery', name: 'Bakery' },
  { slug: 'personal-care', name: 'Personal care' },
  { slug: 'cleaning', name: 'Cleaning' },
  { slug: 'baby-care', name: 'Baby care' },
  { slug: 'pet-supplies', name: 'Pet supplies' },
]
const fail = (error) => { throw new Error(error?.message || 'Unable to complete that request.') }

function useAuth() {
  const [state, setState] = useState({ loading: true, user: null, roles: [], profile: null, error: '' })
  useEffect(() => {
    if (!supabase) {
      setState({ loading: false, user: null, roles: [], profile: null, error: '' })
      return
    }

    let active = true
    let requestId = 0
    const load = async (session) => {
      const currentRequest = ++requestId
      const user = session?.user || null
      if (!user) {
        if (active && currentRequest === requestId) setState({ loading: false, user: null, roles: [], profile: null, error: '' })
        return
      }

      setState(previous => ({ ...previous, loading: true, error: '' }))
      try {
        const [rolesResult, profileResult] = await Promise.all([
          supabase.from('user_roles').select('role').eq('user_id', user.id),
          supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        ])
        if (rolesResult.error) fail(rolesResult.error)
        if (profileResult.error) fail(profileResult.error)
        if (active && currentRequest === requestId) {
          setState({
            loading: false,
            user,
            roles: rolesResult.data?.map(row => row.role) || [],
            profile: profileResult.data || null,
            error: '',
          })
        }
      } catch (error) {
        if (active && currentRequest === requestId) {
          setState({ loading: false, user, roles: [], profile: null, error: error.message })
        }
      }
    }

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) throw error
      return load(data.session)
    }).catch(error => {
      if (active) setState({ loading: false, user: null, roles: [], profile: null, error: error.message })
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => {
        if (active) load(session)
      }, 0)
    })
    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])
  return state
}

function Shell({ children, auth, kind = 'customer' }) {
  const navigate = useNavigate()
  const [logoutError, setLogoutError] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)
  const links = kind === 'customer' ? [['/', 'Shop'], ['/search', 'Search'], ['/cart', 'Cart'], ['/orders', 'Orders'], ['/account', 'Account']] : kind === 'shopkeeper' ? [['/shopkeeper/dashboard', 'Overview'], ['/shopkeeper/products', 'Products'], ['/shopkeeper/orders', 'Orders'], ['/shopkeeper/inventory', 'Inventory'], ['/shopkeeper/store', 'Store']] : kind === 'delivery_agent' ? [['/delivery/dashboard', 'My deliveries'], ['/delivery/available-orders', 'Available'], ['/delivery/my-deliveries', 'History'], ['/delivery/profile', 'Profile']] : [['/admin/dashboard', 'Overview'], ['/admin/users', 'Users'], ['/admin/stores', 'Stores'], ['/admin/products', 'Products'], ['/admin/orders', 'Orders'], ['/admin/reports', 'Reports']]
  const logout = async () => {
    setLoggingOut(true)
    setLogoutError('')
    try {
      const { error } = await supabase.auth.signOut()
      if (error) fail(error)
      navigate('/login', { replace: true })
    } catch (error) {
      setLogoutError(error.message)
    } finally {
      setLoggingOut(false)
    }
  }
  return (
    <div className={`app-shell ${kind}`}>
      <header className="top">
        <Link className="logo" to={kind === 'customer' ? '/' : links[0][0]}>⚡ blinkit</Link>
        <nav>{links.map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}</nav>
        <span className="user-name">{auth.profile?.name || auth.user?.email}</span>
        <button className="ghost logout-button" type="button" onClick={logout} disabled={loggingOut}>
          {loggingOut ? 'Logging out…' : 'Log out'}
        </button>
      </header>
      {logoutError && <p className="logout-error" role="alert">{logoutError}</p>}
      {kind !== 'customer' && <aside><b>{kind.replace('_', ' ')}</b>{links.map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}</aside>}
      <div className={kind === 'customer' ? '' : 'dashboard-content'}>{children}</div>
    </div>
  )
}

function Guard({ auth, role, children }) { if (auth.loading) return <Loading />; if (auth.error) return <main className="empty"><h1>Unable to load your account</h1><Message error={auth.error} /><button onClick={() => supabase.auth.signOut()}>Sign out and try again</button></main>; if (!auth.user) return <Navigate to="/login" replace />; if (role && !auth.roles.includes(role)) return <Navigate to="/unauthorized" replace />; return children }
function Loading() { return <div className="loading">Loading…</div> }
function Message({ error }) { return error ? <p className="message error">{error}</p> : null }
function requireDb() { if (!isSupabaseConfigured) throw new Error('Supabase is not configured. Copy .env.example to .env.local and add the project URL and publishable key.') }

function AuthPage({ register = false }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  const submit = async event => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      requireDb()
      const result = register
        ? await supabase.auth.signUp({ email: form.email, password: form.password, options: { data: { name: form.name } } })
        : await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
      if (result.error) fail(result.error)
      if (register && !result.data.session) {
        setError('Check your email to confirm the account, then sign in.')
        return
      }

      if (register) {
        navigate('/')
        return
      }

      const { data: roles, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', result.data.user.id)
      if (roleError) fail(roleError)
      const roleSet = new Set(roles?.map(row => row.role))
      const destination = roleSet.has('admin') ? '/admin/dashboard'
        : roleSet.has('shopkeeper') ? '/shopkeeper/dashboard'
          : roleSet.has('delivery_agent') ? '/delivery/dashboard' : '/'
      navigate(destination)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <Link className="logo" to="/">⚡ blinkit</Link>
        <h1>{register ? 'Create your customer account' : 'Welcome back'}</h1>
        <p>{register ? 'Registration creates customer accounts only. Privileged roles are provisioned by an administrator.' : 'Sign in to continue shopping or to access your assigned role.'}</p>
        {register && <label>Name<input required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></label>}
        <label>Email<input required type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} /></label>
        <label>Password<input required minLength="8" type="password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} /></label>
        <Message error={error} />
        <button disabled={busy}>{busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'}</button>
        <p>{register ? 'Already have an account?' : 'New here?'} <Link to={register ? '/login' : '/register'}>{register ? 'Sign in' : 'Register'}</Link></p>
      </form>
    </main>
  )
}

function useCatalogue(query = '', category = '') {
  const [state, setState] = useState({ loading: true, data: [], error: '' })
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        requireDb()
        const { data, error } = await supabase
          .from('products')
          .select('id,name,description,brand,image_url,shop_id,categories(name,slug),product_variants(id,name,sku,price,discount_price,inventory(stock_quantity,reserved_quantity))')
          .eq('is_active', true)
          .order('name')
        if (error) fail(error)
        if (mounted) setState({ loading: false, data: data || [], error: '' })
      } catch (err) {
        if (mounted) setState({ loading: false, data: [], error: err.message })
      }
    })()
    return () => { mounted = false }
  }, [])

  const normalizedQuery = query.trim().toLowerCase()
  const data = state.data.filter(product => {
    if (category && product.categories?.slug !== category) return false
    if (!normalizedQuery) return true
    const searchableFields = [
      product.name,
      product.brand,
      product.description,
      product.categories?.name,
      ...(product.product_variants || []).flatMap(variant => [variant.name, variant.sku]),
    ]
    return searchableFields.some(value => value?.toLowerCase().includes(normalizedQuery))
  })
  return { ...state, data }
}
function useCartActions(userId) {
  const [cartCount, setCartCount] = useState(0)
  const [cartError, setCartError] = useState('')

  useEffect(() => {
    let active = true
    supabase.from('carts').select('cart_items(quantity)').eq('user_id', userId).maybeSingle()
      .then(({ data, error }) => {
        if (error) throw error
        if (active) setCartCount(data?.cart_items?.reduce((sum, item) => sum + item.quantity, 0) || 0)
      })
      .catch(error => {
        if (active) setCartError(error.message)
      })
    return () => { active = false }
  }, [userId])

  const add = async (product, variant) => {
    setCartError('')
    try {
      const { data: cart, error: cartError } = await supabase
        .from('carts')
        .upsert({ user_id: userId, shop_id: product.shop_id, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
        .select()
        .single()
      if (cartError) fail(cartError)

      const { data: existing, error: lookupError } = await supabase
        .from('cart_items')
        .select('id,quantity')
        .eq('cart_id', cart.id)
        .eq('variant_id', variant.id)
        .maybeSingle()
      if (lookupError) fail(lookupError)

      const result = existing
        ? await supabase.from('cart_items')
          .update({ quantity: existing.quantity + 1, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
        : await supabase.from('cart_items').insert({ cart_id: cart.id, variant_id: variant.id, quantity: 1 })
      if (result.error) fail(result.error)
      setCartCount(count => count + 1)
    } catch (error) {
      setCartError(error.message)
    }
  }

  return { cartCount, cartError, add }
}
function ProductCard({ product, onAdd }) {
  const [imageFailed, setImageFailed] = useState(false)
  const variant = product.product_variants?.[0]
  const available = variant?.inventory?.[0]
  const stock = available ? available.stock_quantity - (available.reserved_quantity || 0) : null
  const price = variant?.discount_price ?? variant?.price
  return (
    <article className="card product-card">
      <Link className="product-card-link" to={`/products/${product.id}`} aria-label={`View ${product.name} details`}>
        <div className={`product-image${imageFailed || !product.image_url ? ' image-fallback' : ''}`}>
          <span className="product-image-fallback-label" aria-hidden="true">Photo unavailable</span>
          {product.image_url && !imageFailed && (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              decoding="async"
              onError={() => setImageFailed(true)}
            />
          )}
        </div>
        <small>{product.categories?.name || 'Essentials'}{product.brand ? ` · ${product.brand}` : ''}</small>
        <h3>{product.name}</h3>
        <p>{variant?.name || 'Unavailable'} · {stock === null ? 'Availability confirmed at checkout' : stock > 0 ? 'In stock' : 'Out of stock'}</p>
      </Link>
      <div>
        <b>{price != null ? money.format(price) : '—'}</b>
        {variant?.discount_price != null && variant.price > price && <del>{money.format(variant.price)}</del>}
        <button disabled={!variant || stock === 0} onClick={() => onAdd(product, variant)}>{stock === 0 ? 'OUT' : 'ADD'}</button>
      </div>
    </article>
  )
}

function RatingStars({ rating, label }) {
  return <span className="rating-stars" role="img" aria-label={label}>{'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}</span>
}

function ProductDetail({ auth }) {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [selectedVariantId, setSelectedVariantId] = useState('')
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsAvailable, setReviewsAvailable] = useState(true)
  const [reviewError, setReviewError] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const { cartCount, cartError, add } = useCartActions(auth.user.id)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    setLoading(true)
    setProduct(null)
    setReviews([])
    setRating(0)
    setReviewText('')
    setReviewsLoading(true)
    setReviewsAvailable(true)
    setError('')
    setReviewError('')

    const loadProduct = async () => {
      try {
        const { data: loadedProduct, error: productError } = await supabase.from('products')
          .select('id,name,description,brand,image_url,shop_id,categories(name,slug),product_variants(id,name,sku,price,discount_price,inventory(stock_quantity,reserved_quantity))')
          .eq('id', id)
          .eq('is_active', true)
          .maybeSingle()
        if (productError) fail(productError)
        if (!active) return

        setProduct(loadedProduct)
        setSelectedVariantId(loadedProduct?.product_variants?.[0]?.id || '')
        setLoading(false)
        if (!loadedProduct) return

        let reviewResult
        try {
          reviewResult = await supabase.from('product_reviews')
            .select('user_id,rating,review_text,created_at')
            .eq('product_id', id)
            .order('created_at', { ascending: false })
        } catch (reviewsLoadError) {
          if (active) {
            setReviewsAvailable(false)
            setReviewError(reviewsLoadError.message)
          }
          return
        }
        if (!active) return
        if (reviewResult.error) {
          setReviewsAvailable(false)
          setReviewError(reviewResult.error.message)
          return
        }

        const productReviews = reviewResult.data || []
        const ownReview = productReviews.find(review => review.user_id === auth.user.id)
        setReviews(productReviews)
        setRating(ownReview?.rating || 0)
        setReviewText(ownReview?.review_text || '')
      } catch (loadError) {
        if (active) setError(loadError.message)
      } finally {
        if (active) {
          setLoading(false)
          setReviewsLoading(false)
        }
      }
    }

    loadProduct()
    return () => { active = false }
  }, [id, auth.user.id])

  const selectedVariant = product?.product_variants?.find(variant => variant.id === selectedVariantId)
  const inventory = selectedVariant?.inventory?.[0]
  const stock = inventory ? inventory.stock_quantity - (inventory.reserved_quantity || 0) : null
  const price = selectedVariant?.discount_price ?? selectedVariant?.price
  const averageRating = reviews.length
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    : 0

  const submitReview = async event => {
    event.preventDefault()
    if (!rating) {
      setError('Choose a star rating before submitting your review.')
      return
    }
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const { error: saveError } = await supabase.from('product_reviews').upsert({
        product_id: id,
        user_id: auth.user.id,
        rating,
        review_text: reviewText.trim() || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'product_id,user_id' })
      if (saveError) fail(saveError)

      const { data, error: loadError } = await supabase.from('product_reviews')
        .select('user_id,rating,review_text,created_at')
        .eq('product_id', id)
        .order('created_at', { ascending: false })
      if (loadError) fail(loadError)
      setReviews(data || [])
      setNotice('Your rating has been saved.')
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Shell auth={auth}><Loading /></Shell>
  if (error && !product) return <Shell auth={auth}><main className="narrow"><Message error={error} /><Link to="/search">Back to products</Link></main></Shell>
  if (!product) return <Shell auth={auth}><main className="narrow empty"><h1>Product not found</h1><Link to="/search">Back to products</Link></main></Shell>

  return (
    <Shell auth={auth}>
      <main className="product-detail-page">
        <Link className="product-back-link" to="/search">← Back to products</Link>
        <Message error={error || cartError} />
        <section className="product-detail card">
          <ProductDetailImage key={product.id} product={product} />
          <div className="product-detail-info">
            <p className="eyebrow">{product.categories?.name || 'Essentials'}{product.brand ? ` · ${product.brand}` : ''}</p>
            <h1>{product.name}</h1>
            <div className="product-rating-summary">
              {reviewsLoading ? <span>Loading ratings…</span> : !reviewsAvailable ? <span>Ratings are not available yet</span> : reviews.length ? <><RatingStars rating={averageRating} label={`${averageRating.toFixed(1)} out of 5 stars`} /><b>{averageRating.toFixed(1)}</b><span>{reviews.length} {reviews.length === 1 ? 'rating' : 'ratings'}</span></> : <span>No ratings yet</span>}
            </div>
            <p className="product-description">{product.description || 'No description available.'}</p>
            {product.product_variants?.length > 1 && (
              <label className="variant-picker">
                Pack size
                <select value={selectedVariantId} onChange={event => setSelectedVariantId(event.target.value)}>
                  {product.product_variants.map(variant => <option key={variant.id} value={variant.id}>{variant.name}</option>)}
                </select>
              </label>
            )}
            <div className="product-detail-price">
              <b>{price != null ? money.format(price) : 'Price unavailable'}</b>
              {selectedVariant?.discount_price != null && selectedVariant.price > price && <del>{money.format(selectedVariant.price)}</del>}
              <span>{stock === null ? 'Stock availability will be confirmed at checkout' : stock > 0 ? `${stock} in stock` : 'Currently out of stock'}</span>
            </div>
            <button disabled={!selectedVariant || stock === 0} onClick={() => add(product, selectedVariant)}>
              {stock === 0 ? 'Out of stock' : 'Add to cart'}
            </button>
            <button className="product-cart-link" onClick={() => navigate('/cart')}>View cart ({cartCount})</button>
          </div>
        </section>

        <section className="product-detail-section card">
          <h2>Product features</h2>
          <ul className="product-feature-list">
            {product.brand && <li><b>Brand</b><span>{product.brand}</span></li>}
            {product.categories?.name && <li><b>Category</b><span>{product.categories.name}</span></li>}
            {selectedVariant && <li><b>Pack size</b><span>{selectedVariant.name}</span></li>}
            <li><b>Availability</b><span>{stock === null ? 'Confirmed at checkout' : stock > 0 ? 'Available to order' : 'Currently unavailable'}</span></li>
          </ul>
        </section>

        <section className="product-detail-section card">
          <h2>Ratings & reviews</h2>
          {reviewsAvailable ? (
            <>
              <div className="review-summary">
                {reviewsLoading ? <p>Loading ratings and reviews…</p> : reviews.length ? <><RatingStars rating={averageRating} label={`${averageRating.toFixed(1)} out of 5 stars`} /><strong>{averageRating.toFixed(1)} / 5</strong><span>Based on {reviews.length} {reviews.length === 1 ? 'rating' : 'ratings'}</span></> : <p>No reviews yet. Be the first to share your experience.</p>}
              </div>
              {!reviewsLoading && (
                <form className="review-form" onSubmit={submitReview}>
                  <h3>{reviews.some(review => review.user_id === auth.user.id) ? 'Update your rating' : 'Rate this product'}</h3>
                  <div className="rating-input" role="radiogroup" aria-label="Your rating">
                    {[1, 2, 3, 4, 5].map(value => (
                      <button
                        aria-checked={rating === value}
                        aria-label={`${value} ${value === 1 ? 'star' : 'stars'}`}
                        className={value <= rating ? 'selected' : ''}
                        key={value}
                        onClick={() => setRating(value)}
                        role="radio"
                        type="button"
                      >★</button>
                    ))}
                  </div>
                  <label htmlFor="product-review">Review (optional)</label>
                  <textarea id="product-review" maxLength="1000" rows="3" value={reviewText} onChange={event => setReviewText(event.target.value)} />
                  <button disabled={busy}>{busy ? 'Saving…' : 'Submit rating'}</button>
                  {notice && <p className="review-notice">{notice}</p>}
                </form>
              )}
            </>
          ) : (
            <p className="review-unavailable">Ratings and reviews are not available yet. Product details are still available.</p>
          )}
          {reviewError && <p className="review-unavailable" role="status">Review service response: {reviewError}</p>}
          <div className="product-reviews">
            {reviews.filter(review => review.review_text).map(review => (
              <article key={review.user_id}>
                <RatingStars rating={review.rating} label={`${review.rating} out of 5 stars`} />
                <time dateTime={review.created_at}>{new Date(review.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</time>
                <p>{review.review_text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </Shell>
  )
}

function ProductDetailImage({ product }) {
  const [imageFailed, setImageFailed] = useState(false)
  return (
    <div className={`product-detail-image${imageFailed || !product.image_url ? ' image-fallback' : ''}`}>
      <span className="product-image-fallback-label" aria-hidden="true">Photo unavailable</span>
      {product.image_url && !imageFailed && <img src={product.image_url} alt={product.name} onError={() => setImageFailed(true)} />}
    </div>
  )
}

function CustomerHome({ auth }) {
  const { loading, data, error } = useCatalogue()
  const { cartCount, cartError, add } = useCartActions(auth.user.id)
  const [category, setCategory] = useState('')
  const navigate = useNavigate()
  const visibleProducts = category ? data.filter(product => product.categories?.slug === category) : data
  return (
    <Shell auth={auth}>
      <section className="hero">
        <div><b>DELIVERED IN MINUTES</b><h1>Groceries at your door, faster than you can plan dinner.</h1><p>Fresh picks and daily essentials for your neighborhood.</p><Link className="button" to="/search">Shop now</Link></div>
        <span>🛒</span>
      </section>
      <main>
        <div className="heading">
          <div><h2>Popular products</h2><p>{loading ? 'Loading the catalogue…' : `${visibleProducts.length} products from your local shop`}</p></div>
          <Link to="/search">Search products</Link>
        </div>
        <div className="catalogue-categories" aria-label="Filter products by category">
          {catalogueCategories.map(item => (
            <button
              className={category === item.slug ? 'active' : ''}
              key={item.slug || 'all'}
              onClick={() => setCategory(item.slug)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <Message error={error || cartError} />
        {loading ? <Loading /> : (
          <div className="products">
            {visibleProducts.map(item => <ProductCard key={item.id} product={item} onAdd={add} />)}
          </div>
        )}
        {!loading && !error && !visibleProducts.length && <p className="empty">No products in this category yet.</p>}
        <button className="cart-float" onClick={() => navigate('/cart')}>🛒 {cartCount} in cart</button>
      </main>
    </Shell>
  )
}
function SearchPage({ auth }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const { loading, data, error } = useCatalogue(query, category)
  const { cartCount, cartError, add } = useCartActions(auth.user.id)
  return (
    <Shell auth={auth}>
      <main>
        <div className="heading">
          <div><h1>Search groceries</h1><p>Browse the complete local product catalogue.</p></div>
          <input autoFocus value={query} placeholder="Milk, bread, snacks…" onChange={event => setQuery(event.target.value)} />
        </div>
        <div className="catalogue-categories" aria-label="Filter products by category">
          {catalogueCategories.map(item => (
            <button
              className={category === item.slug ? 'active' : ''}
              key={item.slug || 'all'}
              onClick={() => setCategory(item.slug)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <Message error={error || cartError} />
        {loading ? <Loading /> : <div className="products">{data.map(item => <ProductCard key={item.id} product={item} onAdd={add} />)}</div>}
        {!loading && !error && !data.length && <p className="empty">No products match your search.</p>}
        <Link className="cart-float button" to="/cart">🛒 {cartCount} in cart</Link>
      </main>
    </Shell>
  )
}

function Cart({ auth }) {
  const [cart, setCart] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const load = async () => {
    const { data, error: getError } = await supabase
      .from('carts')
      .select('id,shop_id,cart_items(id,quantity,product_variants(id,name,price,discount_price,products(name,image_url)))')
      .eq('user_id', auth.user.id)
      .maybeSingle()
    if (getError) setError(getError.message)
    else setCart(data || { cart_items: [] })
  }

  useEffect(() => { load() }, [])

  const change = async (id, quantity) => {
    const result = quantity
      ? await supabase.from('cart_items').update({ quantity, updated_at: new Date().toISOString() }).eq('id', id)
      : await supabase.from('cart_items').delete().eq('id', id)
    if (result.error) setError(result.error.message)
    else load()
  }

  if (!cart) return <Shell auth={auth}><Loading /></Shell>
  const total = cart.cart_items.reduce(
    (sum, item) => sum + (item.product_variants.discount_price ?? item.product_variants.price) * item.quantity,
    0,
  )

  return (
    <Shell auth={auth}>
      <main className="narrow">
        <h1>Your cart</h1>
        <Message error={error} />
        {cart.cart_items.length === 0
          ? <p className="empty">Your cart is empty. <Link to="/shop">Start shopping</Link></p>
          : (
            <>
              {cart.cart_items.map(item => {
                const product = item.product_variants.products
                return (
                  <div className="cart-row" key={item.id}>
                    <div className="cart-product-image">
                      <span aria-hidden="true">🛒</span>
                      {product?.image_url && <img src={product.image_url} alt="" loading="lazy" onError={event => { event.currentTarget.hidden = true }} />}
                    </div>
                    <div>
                      <b>{product?.name}</b>
                      <small>{item.product_variants.name} · {money.format(item.product_variants.discount_price ?? item.product_variants.price)}</small>
                    </div>
                    <div className="counter">
                      <button onClick={() => change(item.id, item.quantity - 1)} aria-label={`Remove one ${product?.name}`}>−</button>
                      {item.quantity}
                      <button onClick={() => change(item.id, item.quantity + 1)} aria-label={`Add one ${product?.name}`}>+</button>
                    </div>
                  </div>
                )
              })}
              <section className="checkout">
                <p>Subtotal <b>{money.format(total)}</b></p>
                <p>Delivery <b>{total >= 199 ? 'FREE' : money.format(25)}</b></p>
                <hr />
                <h3>To pay <b>{money.format(total + (total >= 199 ? 0 : 25))}</b></h3>
                <button onClick={() => navigate('/checkout')}>Continue to checkout</button>
              </section>
            </>
          )}
      </main>
    </Shell>
  )
}

function Addresses({ auth, selectMode = false }) { const [rows, setRows] = useState([]); const [form, setForm] = useState({ label: 'Home', address_line: '', city: '', state: '', postal_code: '', is_default: false }); const [error, setError] = useState(''); const navigate = useNavigate(); const load = async () => { const { data, error: e } = await supabase.from('addresses').select('*').order('is_default', { ascending: false }); if (e) setError(e.message); else setRows(data || []) }; useEffect(() => { load() }, []); const save = async (event) => { event.preventDefault(); const { error: e } = await supabase.from('addresses').insert({ ...form, user_id: auth.user.id }); if (e) setError(e.message); else { setForm({ label: 'Home', address_line: '', city: '', state: '', postal_code: '', is_default: false }); load() } }; return <Shell auth={auth}><main className="two-col"><section><h1>Saved addresses</h1><Message error={error} />{rows.map((row) => <article className="card address" key={row.id}><b>{row.label} {row.is_default && <small>DEFAULT</small>}</b><p>{row.address_line}, {row.city}, {row.state} {row.postal_code}</p><button className="link-button" onClick={async () => { await supabase.from('addresses').delete().eq('id', row.id); load() }}>Delete</button>{selectMode && <button onClick={() => navigate(`/checkout?address=${row.id}`)}>Deliver here</button>}</article>)}</section><form className="card form" onSubmit={save}><h2>Add address</h2>{Object.entries(form).filter(([key]) => key !== 'is_default').map(([key, value]) => <label key={key}>{key.replace('_', ' ')}<input required value={value} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>)}<label><input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} /> Default address</label><button>Save address</button></form></main></Shell> }

function Checkout({ auth }) { const [addresses, setAddresses] = useState([]); const [cart, setCart] = useState(null); const [addressId, setAddressId] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const navigate = useNavigate(); useEffect(() => { Promise.all([supabase.from('addresses').select('*').order('is_default', { ascending: false }), supabase.from('carts').select('id,shop_id,cart_items(quantity,variant_id)').eq('user_id', auth.user.id).maybeSingle()]).then(([a, c]) => { setAddresses(a.data || []); setAddressId(a.data?.[0]?.id || ''); setCart(c.data) }) }, []); const place = async () => { try { if (!addressId || !cart?.cart_items?.length) throw new Error('Choose an address and add items to your cart.'); setBusy(true); const { data, error: rpcError } = await supabase.rpc('place_order', { p_shop_id: cart.shop_id, p_address_id: addressId, p_items: cart.cart_items.map((item) => ({ variant_id: item.variant_id, quantity: item.quantity })), p_coupon_code: null }); if (rpcError) fail(rpcError); await supabase.from('cart_items').delete().eq('cart_id', cart.id); navigate(`/orders/${data}`) } catch (err) { setError(err.message) } finally { setBusy(false) } }; return <Shell auth={auth}><main className="narrow"><h1>Checkout</h1><Message error={error} />{!addresses.length ? <p>Add an <Link to="/account/addresses">address</Link> before checkout.</p> : <section className="card"><h2>Delivery address</h2>{addresses.map((address) => <label className="radio" key={address.id}><input type="radio" checked={addressId === address.id} onChange={() => setAddressId(address.id)} /> {address.label}: {address.address_line}, {address.city}</label>)}</section>}<section className="card"><h2>Payment</h2><p>Cash on delivery is available. Online payments are intentionally not shown until Razorpay test credentials and webhook verification are configured.</p></section><button disabled={busy} onClick={place}>{busy ? 'Validating stock…' : 'Place cash-on-delivery order'}</button></main></Shell> }

function CustomerOrders({ auth }) { const [orders, setOrders] = useState([]); useEffect(() => { supabase.from('orders').select('id,order_status,total_amount,created_at,order_items(product_name_snapshot,variant_name_snapshot,quantity)').order('created_at', { ascending: false }).then(({ data }) => setOrders(data || [])) }, []); return <Shell auth={auth}><main><h1>My orders</h1><OrderList orders={orders} /></main></Shell> }
function OrderDetail({ auth }) { const { id } = useParams(); const [order, setOrder] = useState(null); useEffect(() => { supabase.from('orders').select('*,order_items(*),order_status_history(*)').eq('id', id).single().then(({ data }) => setOrder(data)) }, [id]); return <Shell auth={auth}><main className="narrow">{!order ? <Loading /> : <section className="card"><h1>Order {order.id.slice(0, 8)}</h1><Status status={order.order_status} /><p>{money.format(order.total_amount)}</p>{order.order_items.map((item) => <p key={item.id}>{item.product_name_snapshot} · {item.variant_name_snapshot} × {item.quantity}</p>)}<h2>Tracking</h2>{order.order_status_history.map((step) => <p key={step.id}>✓ {step.status.replaceAll('_', ' ')}</p>)}</section>}</main></Shell> }
function Status({ status }) { return <span className={`status ${status}`}>{status.replaceAll('_', ' ')}</span> }
function OrderList({ orders, action }) { return <div className="orders">{orders.map((order) => <article className="card" key={order.id}><div><b>#{order.id.slice(0, 8)}</b><small>{new Date(order.created_at).toLocaleString()}</small></div><Status status={order.order_status} /><p>{order.shop_name ? `${order.shop_name} · ${order.shop_address}` : order.order_items?.map((item) => `${item.product_name_snapshot} × ${item.quantity}`).join(', ')}</p><b>{money.format(order.total_amount)}</b>{action && action(order)}</article>)}{!orders.length && <p className="empty">No orders yet.</p>}</div> }

function Dashboard({ auth, role }) {
  const location = useLocation()
  const [orders, setOrders] = useState([])
  const [inventory, setInventory] = useState([])
  const [shops, setShops] = useState([])
  const [userCount, setUserCount] = useState(0)
  const [pendingShopCount, setPendingShopCount] = useState(0)
  const [orderCount, setOrderCount] = useState(0)
  const [availability, setAvailability] = useState('offline')
  const [availableTasks, setAvailableTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingAvailability, setUpdatingAvailability] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const orderRequest = supabase
        .from('orders')
        .select('id,order_status,total_amount,created_at,order_items(product_name_snapshot,quantity)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(10)
      const requests = [orderRequest]
      if (role === 'shopkeeper') {
        requests.push(supabase.from('inventory')
          .select('id,stock_quantity,reserved_quantity,low_stock_threshold,product_variants(name,products(name))'))
      }
      if (role === 'admin') {
        requests.push(supabase.from('shops').select('id,name,status,approval_status').order('created_at', { ascending: false }).limit(10))
        requests.push(supabase.from('profiles').select('id', { count: 'exact', head: true }))
        requests.push(supabase.from('shops').select('id', { count: 'exact', head: true }).eq('approval_status', 'pending'))
      }
      if (role === 'delivery_agent') {
        requests.push(supabase.from('delivery_agents').select('availability_status').eq('user_id', auth.user.id).maybeSingle())
      }

      const results = await Promise.all(requests)
      const failed = results.find(result => result.error)
      if (failed) fail(failed.error)
      setOrders(results[0].data || [])
      setOrderCount(results[0].count ?? results[0].data?.length ?? 0)

      if (role === 'shopkeeper') setInventory(results[1].data || [])
      if (role === 'admin') {
        setShops(results[1].data || [])
        setUserCount(results[2].count || 0)
        setPendingShopCount(results[3].count || 0)
      }
      if (role === 'delivery_agent') {
        const status = results[1].data?.availability_status || 'offline'
        setAvailability(status)
        if (status === 'available') {
          const { data, error: taskError } = await supabase.rpc('available_delivery_orders')
          if (taskError) fail(taskError)
          setAvailableTasks(data || [])
        } else {
          setAvailableTasks([])
        }
      }
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }, [auth.user.id, role])

  useEffect(() => { load() }, [load])

  const updateAvailability = async () => {
    setUpdatingAvailability(true)
    setError('')
    try {
      const next = availability === 'available' ? 'offline' : 'available'
      const { data, error: updateError } = await supabase
        .from('delivery_agents')
        .update({ availability_status: next, updated_at: new Date().toISOString() })
        .eq('user_id', auth.user.id)
        .select('user_id')
        .maybeSingle()
      if (updateError) setError(updateError.message)
      else if (!data) setError('This account has no delivery-agent profile yet. Ask an admin to provision it.')
      else await load()
    } catch (updateError) {
      setError(updateError.message)
    } finally {
      setUpdatingAvailability(false)
    }
  }

  const inProgress = orders.filter(order => !['delivered', 'cancelled', 'rejected', 'failed'].includes(order.order_status)).length
  const deliveredValue = orders
    .filter(order => order.order_status === 'delivered')
    .reduce((sum, order) => sum + Number(order.total_amount), 0)
  const lowStock = inventory.filter(item => item.stock_quantity - item.reserved_quantity <= item.low_stock_threshold)
  const pageTitle = role === 'admin'
    ? location.pathname === '/admin/stores' ? 'Store management' : location.pathname === '/admin/reports' ? 'Platform reports' : 'Platform overview'
    : role === 'delivery_agent' ? 'Delivery workspace' : 'Store overview'
  const quickLinks = role === 'shopkeeper'
    ? [['/shopkeeper/orders', 'Manage orders'], ['/shopkeeper/inventory', 'Review inventory'], ['/shopkeeper/products', 'View products']]
    : role === 'delivery_agent'
      ? [['/delivery/available-orders', 'Available deliveries'], ['/delivery/my-deliveries', 'My delivery history']]
      : [['/admin/users', 'Manage users'], ['/admin/stores', 'Review stores'], ['/admin/orders', 'Monitor orders'], ['/admin/reports', 'Open reports']]

  return (
    <Shell auth={auth} kind={role}>
      <main>
        <div className="dashboard-heading">
          <div><p className="eyebrow">{role.replace('_', ' ')}</p><h1>{pageTitle}</h1></div>
          <button className="ghost" onClick={load} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh data'}</button>
        </div>
        <Message error={error} />
        {loading ? <Loading /> : (
          <>
            <div className="metrics">
              <article><p>{role === 'delivery_agent' ? 'Visible orders' : 'Total orders'}</p><h2>{orderCount}</h2></article>
              {role === 'admin' ? (
                <>
                  <article><p>Registered users</p><h2>{userCount}</h2></article>
                  <article><p>Stores awaiting approval</p><h2>{pendingShopCount}</h2></article>
                </>
              ) : role === 'shopkeeper' ? (
                <>
                  <article><p>Delivered value · latest 10</p><h2>{money.format(deliveredValue)}</h2></article>
                  <article><p>Low stock items</p><h2>{lowStock.length}</h2></article>
                </>
              ) : (
                <>
                  <article><p>Active deliveries</p><h2>{inProgress}</h2></article>
                  <article><p>Available orders</p><h2>{availableTasks.length}</h2></article>
                </>
              )}
            </div>
            {role === 'delivery_agent' && (
              <section className="card dashboard-panel">
                <div className="dashboard-panel-heading">
                  <div><h2>Delivery availability</h2><p>Set yourself available to see and claim ready orders.</p></div>
                  <button onClick={updateAvailability} disabled={updatingAvailability || availability === 'busy' || availability === 'suspended'}>
                    {updatingAvailability ? 'Updating…' : availability === 'available' ? 'Go offline' : 'Go online'}
                  </button>
                </div>
                <p>Current status: <b>{availability.replaceAll('_', ' ')}</b></p>
                {availability === 'offline' && <p className="dashboard-note">You are offline and will not receive available delivery offers.</p>}
              </section>
            )}
            {role === 'shopkeeper' && (
              <section className="card dashboard-panel">
                <div className="dashboard-panel-heading"><h2>Low stock</h2><Link to="/shopkeeper/inventory">Manage inventory</Link></div>
                {lowStock.length ? lowStock.slice(0, 5).map(item => (
                  <p className="dashboard-row" key={item.id}>
                    <span>{item.product_variants?.products?.name || 'Product'} · {item.product_variants?.name || 'Variant'}</span>
                    <b>{item.stock_quantity - item.reserved_quantity} left</b>
                  </p>
                )) : <p className="dashboard-note">All inventory is above its low-stock threshold.</p>}
              </section>
            )}
            {role === 'admin' && location.pathname === '/admin/stores' && (
              <section className="card dashboard-panel">
                <h2>Recent stores</h2>
                {shops.length ? shops.map(shop => (
                  <p className="dashboard-row" key={shop.id}><span>{shop.name}</span><b>{shop.approval_status} · {shop.status}</b></p>
                )) : <p className="dashboard-note">No stores are visible to this account.</p>}
              </section>
            )}
            <section className="dashboard-actions">
              {quickLinks.map(([to, label]) => <Link className="button" key={to} to={to}>{label} →</Link>)}
            </section>
            <section className="card dashboard-panel">
              <h2>{role === 'admin' && location.pathname === '/admin/reports' ? 'Latest platform activity' : 'Recent orders'}</h2>
              <OrderList orders={orders} />
            </section>
          </>
        )}
      </main>
    </Shell>
  )
}
function ShopProductForm({ shops, categories, product, onCancel, onSave, saving }) {
  const firstVariant = product?.product_variants?.[0]
  const [form, setForm] = useState({
    shop_id: product?.shop_id || shops[0]?.shop_id || '',
    category_id: product?.category_id || '',
    name: product?.name || '',
    description: product?.description || '',
    brand: product?.brand || '',
    variant_name: firstVariant?.name || '',
    sku: firstVariant?.sku || '',
    price: firstVariant?.price ?? '',
    discount_price: firstVariant?.discount_price ?? '',
    stock: firstVariant?.inventory?.[0]?.stock_quantity ?? 0,
  })
  const [image, setImage] = useState(null)
  const [formError, setFormError] = useState('')

  const submit = event => {
    event.preventDefault()
    const price = Number(form.price)
    const discount = form.discount_price === '' ? null : Number(form.discount_price)
    const stock = Number(form.stock)
    if (!Number.isFinite(price) || price < 0 || (discount !== null && (!Number.isFinite(discount) || discount < 0 || discount > price))) {
      setFormError('Enter a valid price and a discount price no greater than the regular price.')
      return
    }
    if (!Number.isInteger(stock) || stock < 0) {
      setFormError('Stock must be a whole number greater than or equal to zero.')
      return
    }
    setFormError('')
    onSave({ ...form, price, discount_price: discount, stock, image }, setFormError)
  }

  return (
    <form className="card shop-product-form" onSubmit={submit}>
      <div className="shop-product-form-heading">
        <div><h2>{product ? 'Edit product' : 'Add a product'}</h2><p>Product details, price, stock, and an optional product photo.</p></div>
        {onCancel && <button className="ghost" type="button" onClick={onCancel}>Cancel</button>}
      </div>
      <div className="shop-product-form-grid">
        {!product && (
          <label>Shop
            <select required value={form.shop_id} onChange={event => setForm({ ...form, shop_id: event.target.value })}>
              {shops.map(shop => <option key={shop.shop_id} value={shop.shop_id}>{shop.shops?.name || 'Your shop'}</option>)}
            </select>
          </label>
        )}
        <label>Product name
          <input required maxLength="160" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} />
        </label>
        <label>Category
          <select value={form.category_id} onChange={event => setForm({ ...form, category_id: event.target.value })}>
            <option value="">Select category</option>
            {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label>Brand
          <input maxLength="120" value={form.brand} onChange={event => setForm({ ...form, brand: event.target.value })} />
        </label>
        <label>Pack size / variant
          <input required maxLength="80" placeholder="e.g. 500 g" value={form.variant_name} onChange={event => setForm({ ...form, variant_name: event.target.value })} />
        </label>
        <label>SKU
          <input maxLength="100" placeholder="Optional; generated if blank" value={form.sku} onChange={event => setForm({ ...form, sku: event.target.value })} />
        </label>
        <label>Price (₹)
          <input required type="number" min="0" step="0.01" value={form.price} onChange={event => setForm({ ...form, price: event.target.value })} />
        </label>
        <label>Discount price (₹)
          <input type="number" min="0" step="0.01" value={form.discount_price} onChange={event => setForm({ ...form, discount_price: event.target.value })} />
        </label>
        <label>Opening stock
          <input required type="number" min="0" step="1" value={form.stock} onChange={event => setForm({ ...form, stock: event.target.value })} />
        </label>
        <label className="shop-product-image-input">Product photo
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={event => setImage(event.target.files?.[0] || null)} />
          <small>JPG, PNG, WebP or AVIF, up to 5 MB. {product?.image_url ? 'Choose a new file to replace the current photo.' : ''}</small>
        </label>
        <label className="shop-product-description">Description
          <textarea maxLength="1000" rows="3" value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} />
        </label>
      </div>
      {formError && <p className="message error">{formError}</p>}
      <button disabled={saving}>{saving ? 'Saving product…' : product ? 'Save product changes' : 'Add product'}</button>
    </form>
  )
}

function ShopProducts({ auth }) {
  const location = useLocation()
  const adminView = location.pathname.startsWith('/admin/')
  const inventoryView = location.pathname === '/shopkeeper/inventory'
  const role = adminView ? 'admin' : 'shopkeeper'
  const [rows, setRows] = useState([])
  const [shops, setShops] = useState([])
  const [categories, setCategories] = useState([])
  const [stockDrafts, setStockDrafts] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState('')
  const [savingProduct, setSavingProduct] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [canManageProducts, setCanManageProducts] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      if (adminView) {
        const { data, error: loadError } = await supabase
          .from('products')
          .select('id,name,brand,is_active,product_variants(id,name,sku,price,discount_price,inventory(id,stock_quantity,low_stock_threshold))')
          .order('name')
        if (loadError) fail(loadError)
        setRows(data || [])
        return
      }

      const [membershipResult, categoryResult] = await Promise.all([
        supabase.from('shop_members').select('shop_id,role,shops(id,name)').eq('user_id', auth.user.id),
        supabase.from('categories').select('id,name').eq('is_active', true).order('name'),
      ])
      if (membershipResult.error) fail(membershipResult.error)
      if (categoryResult.error) fail(categoryResult.error)
      const memberships = membershipResult.data || []
      const manageable = memberships.filter(item => ['owner', 'manager', 'catalog_manager'].includes(item.role))
      const shopIds = manageable.map(item => item.shop_id)
      setShops(manageable)
      setCategories(categoryResult.data || [])
      setCanManageProducts(shopIds.length > 0)
      if (!shopIds.length) {
        setRows([])
        return
      }

      const { data, error: loadError } = await supabase
        .from('products')
        .select('id,shop_id,category_id,name,description,brand,image_url,is_active,product_variants(id,name,sku,price,discount_price,inventory(id,stock_quantity,low_stock_threshold))')
        .in('shop_id', shopIds)
        .order('name')
      if (loadError) fail(loadError)
      setRows(data || [])
      setStockDrafts({})
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }, [adminView, auth.user.id])

  useEffect(() => { load() }, [load])

  const saveStock = async (inventoryId, stock) => {
    const quantity = Number(stock)
    if (!Number.isInteger(quantity) || quantity < 0) {
      setError('Stock must be a whole number greater than or equal to zero.')
      return
    }
    setSavingId(inventoryId)
    setError('')
    try {
      const { data, error: updateError } = await supabase
        .from('inventory')
        .update({ stock_quantity: quantity, updated_at: new Date().toISOString() })
        .eq('id', inventoryId)
        .select('id')
        .maybeSingle()
      if (updateError) setError(updateError.message)
      else if (!data) setError('Inventory was not updated. Check that you have permission to manage this stock.')
      else await load()
    } catch (updateError) {
      setError(updateError.message)
    } finally {
      setSavingId('')
    }
  }

  const saveProduct = async (form, setFormError) => {
    setSavingProduct(true)
    setError('')
    let uploadedPath = ''
    let imageUploaded = false
    let productId = editingProduct?.id
    try {
      let imageUrl = editingProduct?.image_url || null
      if (form.image) {
        if (form.image.size > 5 * 1024 * 1024) throw new Error('Choose an image smaller than 5 MB.')
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(form.image.type)) {
          throw new Error('Choose a JPG, PNG, WebP, or AVIF image.')
        }
        const safeName = form.image.name.replace(/[^a-zA-Z0-9._-]/g, '-')
        uploadedPath = `${form.shop_id}/${crypto.randomUUID()}-${safeName}`
        const { error: uploadError } = await supabase.storage.from('product-images')
          .upload(uploadedPath, form.image, { contentType: form.image.type, upsert: false })
        if (uploadError) fail(uploadError)
        imageUploaded = true
        imageUrl = supabase.storage.from('product-images').getPublicUrl(uploadedPath).data.publicUrl
      }

      const productValues = {
        category_id: form.category_id || null,
        name: form.name.trim(),
        description: form.description.trim() || null,
        brand: form.brand.trim() || null,
        image_url: imageUrl,
      }
      if (editingProduct) {
        const variant = editingProduct.product_variants?.[0]
        if (variant) {
          const { data: updatedVariant, error: variantError } = await supabase.from('product_variants')
            .update({
              name: form.variant_name.trim(),
              sku: form.sku.trim() || variant.sku,
              price: form.price,
              discount_price: form.discount_price,
            })
            .eq('id', variant.id)
            .select('id')
            .maybeSingle()
          if (variantError) fail(variantError)
          if (!updatedVariant) throw new Error('Product details were saved, but its variant was not updated.')
          const inventory = variant.inventory?.[0]
          if (inventory) {
            const { data: updatedInventory, error: inventoryError } = await supabase.from('inventory')
              .update({ stock_quantity: form.stock, updated_at: new Date().toISOString() })
              .eq('id', inventory.id)
              .select('id')
              .maybeSingle()
            if (inventoryError) fail(inventoryError)
            if (!updatedInventory) throw new Error('Product details were saved, but its stock was not updated.')
          }
        }
        const { data: updatedProduct, error: productError } = await supabase.from('products')
          .update(productValues)
          .eq('id', editingProduct.id)
          .eq('shop_id', editingProduct.shop_id)
          .select('id')
          .maybeSingle()
        if (productError) fail(productError)
        if (!updatedProduct) throw new Error('Product was not updated. Check that your shop membership allows catalogue changes.')
      } else {
        const { data: createdProduct, error: productError } = await supabase.from('products')
          .insert({ ...productValues, shop_id: form.shop_id, is_active: true })
          .select('id')
          .single()
        if (productError) fail(productError)
        productId = createdProduct.id

        const { data: createdVariant, error: variantError } = await supabase.from('product_variants')
          .insert({
            product_id: productId,
            name: form.variant_name.trim(),
            sku: form.sku.trim() || `SKU-${productId.slice(0, 8).toUpperCase()}`,
            price: form.price,
            discount_price: form.discount_price,
            is_active: true,
          })
          .select('id')
          .single()
        if (variantError) fail(variantError)

        const { error: inventoryError } = await supabase.from('inventory')
          .insert({ shop_id: form.shop_id, variant_id: createdVariant.id, stock_quantity: form.stock, reserved_quantity: 0 })
        if (inventoryError) fail(inventoryError)
      }

      setShowProductForm(false)
      setEditingProduct(null)
      await load()
    } catch (saveError) {
      if (imageUploaded) {
        const { error: cleanupError } = await supabase.storage.from('product-images').remove([uploadedPath])
        if (cleanupError) setError(`${saveError.message} Image cleanup failed: ${cleanupError.message}`)
      }
      setFormError(saveError.message)
      if (productId && !editingProduct) {
        const { error: rollbackError } = await supabase.from('products').update({ is_active: false }).eq('id', productId)
        if (rollbackError) setError(`${saveError.message} Product cleanup failed: ${rollbackError.message}`)
      }
    } finally {
      setSavingProduct(false)
    }
  }

  const setProductActive = async product => {
    const nextActive = !product.is_active
    setSavingId(product.id)
    setError('')
    try {
      const { data, error: updateError } = await supabase.from('products')
        .update({ is_active: nextActive })
        .eq('id', product.id)
        .eq('shop_id', product.shop_id)
        .select('id')
        .maybeSingle()
      if (updateError) fail(updateError)
      if (!data) throw new Error('Product was not updated. Check that your shop membership allows catalogue changes.')
      await load()
    } catch (updateError) {
      setError(updateError.message)
    } finally {
      setSavingId('')
    }
  }

  return (
    <Shell auth={auth} kind={role}>
      <main>
        <div className="dashboard-heading">
          <div>
            <h1>{adminView ? 'Product catalogue' : inventoryView ? 'Inventory' : 'Products'}</h1>
            <p>{adminView ? 'Platform catalogue and stock controls.' : 'Manage products, prices, stock, and photos for your shop.'}</p>
          </div>
          <div className="shop-product-heading-actions">
            {!adminView && !inventoryView && canManageProducts && (
              <button onClick={() => { setEditingProduct(null); setShowProductForm(value => !value) }}>
                {showProductForm ? 'Close form' : 'Add product'}
              </button>
            )}
            <button className="ghost" onClick={load} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh data'}</button>
          </div>
        </div>
        <Message error={error} />
        {!adminView && !inventoryView && showProductForm && (
          <ShopProductForm shops={shops} categories={categories} onCancel={() => setShowProductForm(false)} onSave={saveProduct} saving={savingProduct} />
        )}
        {!adminView && !inventoryView && editingProduct && (
          <ShopProductForm key={editingProduct.id} shops={shops} categories={categories} product={editingProduct} onCancel={() => setEditingProduct(null)} onSave={saveProduct} saving={savingProduct} />
        )}
        {!adminView && !inventoryView && !loading && !canManageProducts && (
          <p className="dashboard-note">No product-manageable shop membership was found for this account.</p>
        )}
        {loading ? <Loading /> : (
          <div className="card table-wrap">
            <table>
              <thead><tr><th>Product</th><th>Variant</th><th>SKU</th><th>Price</th><th>Stock</th><th>{!inventoryView && !adminView ? 'Actions' : ''}</th></tr></thead>
              <tbody>
                {rows.flatMap(product => product.product_variants.map(variant => {
                  const record = variant.inventory?.[0]
                  const value = stockDrafts[record?.id] ?? record?.stock_quantity ?? 0
                  return (
                    <tr key={variant.id} className={!product.is_active ? 'shop-product-inactive' : ''}>
                      <td>
                        <div className="shop-product-cell">
                          {product.image_url ? <img src={product.image_url} alt="" loading="lazy" onError={event => { event.currentTarget.hidden = true }} /> : <span aria-hidden="true">📦</span>}
                          <div><b>{product.name}</b>{product.brand && <small>{product.brand}</small>}{!product.is_active && <small className="shop-product-archived">Removed from catalogue</small>}</div>
                        </div>
                      </td>
                      <td>{variant.name}</td>
                      <td>{variant.sku || '—'}</td>
                      <td>{money.format(variant.discount_price ?? variant.price)}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          disabled={!record}
                          value={value}
                          onChange={event => record && setStockDrafts(old => ({ ...old, [record.id]: event.target.value }))}
                          aria-label={`Stock for ${product.name} ${variant.name}`}
                        />
                      </td>
                      <td className="shop-product-actions">
                        {record && String(value) !== String(record.stock_quantity) && (
                          <button disabled={savingId === record.id} onClick={() => saveStock(record.id, value)}>
                            {savingId === record.id ? 'Saving…' : 'Save stock'}
                          </button>
                        )}
                        {!record && <small>No inventory record</small>}
                        {!adminView && !inventoryView && canManageProducts && product.is_active && (
                          <button className="shop-product-secondary-action" disabled={savingId === product.id} onClick={() => { setShowProductForm(false); setEditingProduct(product) }}>Edit</button>
                        )}
                        {!adminView && !inventoryView && canManageProducts && (
                          <button className={product.is_active ? 'shop-product-remove' : 'shop-product-restore'} disabled={savingId === product.id} onClick={() => setProductActive(product)}>
                            {savingId === product.id ? 'Saving…' : product.is_active ? 'Remove' : 'Restore'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                }))}
              </tbody>
            </table>
            {!rows.length && <p className="dashboard-note">{canManageProducts && !adminView ? 'No products in your shop yet. Add your first product above.' : 'No products are visible to this account.'}</p>}
          </div>
        )}
      </main>
    </Shell>
  )
}
function RoleOrders({ auth, role }) {
  const location = useLocation()
  const adminView = location.pathname.startsWith('/admin/')
  const availableView = location.pathname === '/delivery/available-orders'
  const effectiveRole = adminView ? 'admin' : role
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyOrderId, setBusyOrderId] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      if (availableView) {
        const { data, error: loadError } = await supabase.rpc('available_delivery_orders')
        if (loadError) fail(loadError)
        setOrders((data || []).map(task => ({
          id: task.order_id,
          order_status: 'ready_for_pickup',
          total_amount: task.total_amount,
          created_at: task.created_at,
          order_items: [],
          shop_name: task.shop_name,
          shop_address: task.shop_address,
        })))
      } else {
        let query = supabase
          .from('orders')
          .select('id,order_status,total_amount,created_at,order_items(product_name_snapshot,quantity)')
          .order('created_at', { ascending: false })
        if (effectiveRole === 'delivery_agent') {
          query = query.in('order_status', ['assigned', 'picked_up', 'out_for_delivery', 'delivered'])
        }
        const { data, error: loadError } = await query
        if (loadError) fail(loadError)
        setOrders(data || [])
      }
    } catch (loadError) {
      setOrders([])
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }, [availableView, effectiveRole])

  useEffect(() => { load() }, [load])

  const runOrderAction = async (order, operation) => {
    setBusyOrderId(order.id)
    setError('')
    try {
      const { error: actionError } = await operation()
      if (actionError) setError(actionError.message)
      else await load()
    } catch (actionError) {
      setError(actionError.message)
    } finally {
      setBusyOrderId('')
    }
  }

  const transition = (order, next) => runOrderAction(order, () => supabase.rpc('transition_order_status', {
    p_order_id: order.id,
    p_next_status: next,
    p_note: null,
  }))
  const claim = order => runOrderAction(order, () => supabase.rpc('claim_delivery', {
    p_order_id: order.id,
    p_note: null,
  }))
  const shopTransitions = { placed: 'accepted', accepted: 'preparing', preparing: 'ready_for_pickup' }
  const deliveryTransitions = { assigned: 'picked_up', picked_up: 'out_for_delivery', out_for_delivery: 'delivered' }
  const action = effectiveRole === 'admin' ? null : effectiveRole === 'shopkeeper'
    ? order => shopTransitions[order.order_status]
      ? <button disabled={busyOrderId === order.id} onClick={() => transition(order, shopTransitions[order.order_status])}>Advance order</button>
      : null
    : availableView
      ? order => <button disabled={busyOrderId === order.id} onClick={() => claim(order)}>Claim delivery</button>
      : order => deliveryTransitions[order.order_status]
        ? <button disabled={busyOrderId === order.id} onClick={() => transition(order, deliveryTransitions[order.order_status])}>Update status</button>
        : null

  const title = adminView ? 'All orders'
    : availableView ? 'Available deliveries'
      : effectiveRole === 'delivery_agent' ? 'My deliveries' : 'Order management'

  return (
    <Shell auth={auth} kind={effectiveRole}>
      <main>
        <div className="dashboard-heading">
          <div><h1>{title}</h1><p>{adminView ? 'Platform-wide order monitoring · actions are read-only.' : availableView ? 'Ready orders available to claim.' : 'Orders visible to your assigned role.'}</p></div>
          <button className="ghost" onClick={load} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh orders'}</button>
        </div>
        <Message error={error} />
        {loading ? <Loading /> : <OrderList orders={orders} action={action} busyOrderId={busyOrderId} />}
      </main>
    </Shell>
  )
}
function AdminUsers({ auth }) {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data, error: loadError } = await supabase
        .from('profiles')
        .select('id,name,phone,status,user_roles(role)')
        .order('created_at', { ascending: false })
      if (loadError) setError(loadError.message)
      else setUsers(data || [])
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => { load() }, [load])
  return (
    <Shell auth={auth} kind="admin">
      <main>
        <div className="dashboard-heading">
          <h1>Users</h1>
          <button className="ghost" onClick={load} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh users'}</button>
        </div>
        <Message error={error} />
        {loading ? <Loading /> : (
          <div className="card table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Phone</th><th>Role</th><th>Status</th></tr></thead>
              <tbody>{users.map(user => (
                <tr key={user.id}>
                  <td>{user.name || '—'}</td>
                  <td>{user.phone || '—'}</td>
                  <td>{user.user_roles?.map(item => item.role).join(', ') || 'customer'}</td>
                  <td>{user.status}</td>
                </tr>
              ))}</tbody>
            </table>
            {!users.length && <p className="dashboard-note">No users are visible to this account.</p>}
          </div>
        )}
      </main>
    </Shell>
  )
}
function Account({ auth }) {
  const [profile, setProfile] = useState(auth.profile)
  const [addresses, setAddresses] = useState([])
  const [form, setForm] = useState({ name: auth.profile?.name || '', phone: auth.profile?.phone || '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    const loadAccount = async () => {
      setLoading(true)
      setError('')
      try {
        const [profileResult, addressesResult] = await Promise.all([
          supabase.from('profiles').select('id,name,phone,status,created_at').eq('id', auth.user.id).maybeSingle(),
          supabase.from('addresses')
            .select('id,label,address_line,city,state,postal_code,is_default,created_at')
            .eq('user_id', auth.user.id)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false }),
        ])
        if (profileResult.error) fail(profileResult.error)
        if (addressesResult.error) fail(addressesResult.error)
        if (!active) return

        const loadedProfile = profileResult.data
        setProfile(loadedProfile)
        setForm({
          name: loadedProfile?.name || '',
          phone: loadedProfile?.phone || '',
        })
        setAddresses(addressesResult.data || [])
      } catch (loadError) {
        if (active) setError(loadError.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadAccount()
    return () => { active = false }
  }, [auth.user.id])

  const saveProfile = async event => {
    event.preventDefault()
    const name = form.name.trim()
    if (!name) {
      setError('Name cannot be empty.')
      return
    }
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const { data, error: saveError } = await supabase.from('profiles')
        .update({ name, phone: form.phone.trim() || null, updated_at: new Date().toISOString() })
        .eq('id', auth.user.id)
        .select('id,name,phone,status,created_at')
        .single()
      if (saveError) fail(saveError)
      setProfile(data)
      setForm({ name: data.name || '', phone: data.phone || '' })
      setNotice('Your profile has been updated.')
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Shell auth={auth}>
      <main className="account-page">
        <div className="account-page-heading">
          <div>
            <p className="eyebrow">Your account</p>
            <h1>Profile & personal details</h1>
            <p>Manage your contact information and delivery addresses.</p>
          </div>
          <Link className="button" to="/account/addresses">Manage addresses</Link>
        </div>
        <Message error={error} />

        <div className="account-content-grid">
          <form className="card account-details-form" onSubmit={saveProfile}>
            <div className="account-card-heading">
              <span className="account-avatar">{(form.name || auth.user.email || 'U').trim().charAt(0).toUpperCase()}</span>
              <div><h2>Personal details</h2><p>Update your name and contact number.</p></div>
            </div>
            <label htmlFor="account-name">Full name</label>
            <input id="account-name" autoComplete="name" required maxLength="120" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} />
            <label htmlFor="account-email">Email address</label>
            <input id="account-email" type="email" autoComplete="email" value={auth.user.email || ''} readOnly />
            <small className="account-help">Email is managed by your sign-in provider.</small>
            <label htmlFor="account-phone">Phone number</label>
            <input id="account-phone" type="tel" autoComplete="tel" value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} placeholder="Add a phone number" />
            <button disabled={saving || loading}>{saving ? 'Saving…' : 'Save changes'}</button>
            {notice && <p className="account-success" role="status">{notice}</p>}
          </form>

          <section className="card account-info-card">
            <h2>Account information</h2>
            {loading ? <p>Loading account details…</p> : (
              <dl className="account-info-list">
                <div><dt>Account status</dt><dd>{profile?.status ? profile.status.replaceAll('_', ' ') : 'Not available'}</dd></div>
                <div><dt>Account type</dt><dd>{auth.roles?.length ? auth.roles.map(role => role.replaceAll('_', ' ')).join(', ') : 'Customer'}</dd></div>
                <div><dt>Member since</dt><dd>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not available'}</dd></div>
                <div><dt>Email verified</dt><dd>{auth.user.email_confirmed_at ? 'Verified' : 'Not verified'}</dd></div>
              </dl>
            )}
          </section>
        </div>

        <section className="card account-addresses">
          <div className="account-card-heading">
            <div><h2>Saved delivery addresses</h2><p>{loading ? 'Loading addresses…' : `${addresses.length} saved ${addresses.length === 1 ? 'address' : 'addresses'}`}</p></div>
            <Link to="/account/addresses">Add or edit addresses</Link>
          </div>
          {!loading && !addresses.length && <p className="account-empty-address">No saved addresses yet. Add one to make checkout quicker.</p>}
          <div className="account-address-list">
            {addresses.map(address => (
              <article key={address.id}>
                <div><b>{address.label || 'Address'}{address.is_default && <span className="account-default-badge">Default</span>}</b></div>
                <p>{address.address_line}</p>
                <p>{[address.city, address.state, address.postal_code].filter(Boolean).join(', ')}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </Shell>
  )
}
function NotFound() { return <main className="empty"><h1>Page not found</h1><Link to="/">Back to shop</Link></main> }

function AppRoutes() {
  const auth = useAuth()
  if (!isSupabaseConfigured) {
    return <main className="empty"><h1>Configure Supabase to start</h1><p>Copy .env.example to .env.local and use the existing Blinkit Supabase project’s URL and publishable key.</p></main>
  }
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage register />} />
      <Route path="/unauthorized" element={<main className="empty"><h1>Unauthorized</h1><Link to="/">Go home</Link></main>} />
      <Route path="/" element={<Guard auth={auth}><CustomerHome auth={auth} /></Guard>} />
      <Route path="/shop" element={<Guard auth={auth}><CustomerHome auth={auth} /></Guard>} />
      <Route path="/search" element={<Guard auth={auth}><SearchPage auth={auth} /></Guard>} />
      <Route path="/products/:id" element={<Guard auth={auth}><ProductDetail auth={auth} /></Guard>} />
      <Route path="/cart" element={<Guard auth={auth}><Cart auth={auth} /></Guard>} />
      <Route path="/checkout" element={<Guard auth={auth}><Checkout auth={auth} /></Guard>} />
      <Route path="/orders" element={<Guard auth={auth}><CustomerOrders auth={auth} /></Guard>} />
      <Route path="/orders/:id" element={<Guard auth={auth}><OrderDetail auth={auth} /></Guard>} />
      <Route path="/account" element={<Guard auth={auth}><Account auth={auth} /></Guard>} />
      <Route path="/account/addresses" element={<Guard auth={auth}><Addresses auth={auth} /></Guard>} />
      <Route path="/shopkeeper/dashboard" element={<Guard auth={auth} role="shopkeeper"><Dashboard auth={auth} role="shopkeeper" /></Guard>} />
      <Route path="/shopkeeper/products" element={<Guard auth={auth} role="shopkeeper"><ShopProducts auth={auth} /></Guard>} />
      <Route path="/shopkeeper/inventory" element={<Guard auth={auth} role="shopkeeper"><ShopProducts auth={auth} /></Guard>} />
      <Route path="/shopkeeper/orders" element={<Guard auth={auth} role="shopkeeper"><RoleOrders auth={auth} role="shopkeeper" /></Guard>} />
      <Route path="/shopkeeper/store" element={<Guard auth={auth} role="shopkeeper"><Dashboard auth={auth} role="shopkeeper" /></Guard>} />
      <Route path="/delivery/dashboard" element={<Guard auth={auth} role="delivery_agent"><Dashboard auth={auth} role="delivery_agent" /></Guard>} />
      <Route path="/delivery/available-orders" element={<Guard auth={auth} role="delivery_agent"><RoleOrders auth={auth} role="delivery_agent" /></Guard>} />
      <Route path="/delivery/my-deliveries" element={<Guard auth={auth} role="delivery_agent"><RoleOrders auth={auth} role="delivery_agent" /></Guard>} />
      <Route path="/delivery/profile" element={<Guard auth={auth} role="delivery_agent"><Account auth={auth} /></Guard>} />
      <Route path="/admin/dashboard" element={<Guard auth={auth} role="admin"><Dashboard auth={auth} role="admin" /></Guard>} />
      <Route path="/admin/users" element={<Guard auth={auth} role="admin"><AdminUsers auth={auth} /></Guard>} />
      <Route path="/admin/products" element={<Guard auth={auth} role="admin"><ShopProducts auth={auth} /></Guard>} />
      <Route path="/admin/orders" element={<Guard auth={auth} role="admin"><RoleOrders auth={auth} role="shopkeeper" /></Guard>} />
      <Route path="/admin/stores" element={<Guard auth={auth} role="admin"><Dashboard auth={auth} role="admin" /></Guard>} />
      <Route path="/admin/reports" element={<Guard auth={auth} role="admin"><Dashboard auth={auth} role="admin" /></Guard>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
export default function App() { return <BrowserRouter><AppRoutes /></BrowserRouter> }
