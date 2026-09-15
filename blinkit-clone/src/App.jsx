import { useState } from 'react'
import './App.css'

function App() {

  // Products available in our store
  const products = [
    {
      id: 1,
      name: 'Amul Milk',
      quantity: '1 litre',
      price: 32,
      image: '🥛',
    },
    {
      id: 2,
      name: 'Brown Bread',
      quantity: '400 g',
      price: 45,
      image: '🍞',
    },
    {
      id: 3,
      name: 'Farm Eggs',
      quantity: '6 pieces',
      price: 55,
      image: '🥚',
    },
    {
      id: 4,
      name: 'Cookies',
      quantity: '200 g',
      price: 40,
      image: '🍪',
    },
  ]

  // Cart state
  const [cart, setCart] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  // Add product to cart
  function addToCart(product) {

    setCart((currentCart) => {

      const existingProduct = currentCart.find(
        (item) => item.id === product.id
      )

      // If product is already in cart,
      // increase its quantity
      if (existingProduct) {

        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        )
      }

      // If product isn't in cart,
      // add it with quantity 1
      return [
        ...currentCart,
        {
          ...product,
          cartQuantity: 1,
        },
      ]
    })
  }
// Decrease product quantity
function decreaseQuantity(productId) {
  setCart((currentCart) => {
    return currentCart
      .map((item) =>
        item.id === productId
          ? { ...item, cartQuantity: item.cartQuantity - 1 }
          : item
      )
      .filter((item) => item.cartQuantity > 0)
  })
}

// Remove product completely
function removeFromCart(productId) {
  setCart((currentCart) =>
    currentCart.filter((item) => item.id !== productId)
  )
}
  // Calculate total number of items
  const cartCount = cart.reduce(
    (total, item) => total + item.cartQuantity,
    0
  )
  const filteredProducts = products.filter((product) =>
  product.name.toLowerCase().includes(searchTerm.toLowerCase())
)

  // Calculate total price
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.cartQuantity,
    0
  )

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">

        <div className="logo">
          blinkit
        </div>

        <div className="location">
          📍
          <span>Deliver to</span>
          <strong>Your Location</strong>
        </div>

        <div className="search">
          🔍
          <input
  type="text"
  placeholder="Search for products..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>
        </div>

        <button className="login-btn">
          Login
        </button>

        <button className="cart-btn">
          🛒 Cart {cartCount > 0 && `(${cartCount})`}
        </button>

      </header>


      {/* HERO */}
      <section className="hero-section">

        <h1>
          Groceries delivered within minutes
        </h1>

        <p>
          Fresh groceries, snacks and everyday essentials
          delivered straight to your doorstep.
        </p>

        <div className="hero-search">
          🔍

          <input
  type="text"
  placeholder="Search for milk, bread, fruits..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>

        </div>

      </section>


      {/* CATEGORIES */}
      <section className="section">

        <h2>
          Shop by Category
        </h2>

        <div className="categories">

          <div className="category">
            <div className="category-icon">🥛</div>
            <p>Dairy</p>
          </div>

          <div className="category">
            <div className="category-icon">🍎</div>
            <p>Fruits</p>
          </div>

          <div className="category">
            <div className="category-icon">🥦</div>
            <p>Vegetables</p>
          </div>

          <div className="category">
            <div className="category-icon">🍪</div>
            <p>Snacks</p>
          </div>

          <div className="category">
            <div className="category-icon">🥤</div>
            <p>Drinks</p>
          </div>

          <div className="category">
            <div className="category-icon">🧹</div>
            <p>Household</p>
          </div>

        </div>

      </section>


      {/* PRODUCTS */}
      <section className="section">

        <h2>
          Popular Products
        </h2>

        <div className="products">

          {filteredProducts.map((product) => (

            <div
              className="product-card"
              key={product.id}
            >

              <div className="product-image">
                {product.image}
              </div>

              <h3>
                {product.name}
              </h3>

              <p>
                {product.quantity}
              </p>

              <strong>
                ₹{product.price}
              </strong>

              <button
                onClick={() => addToCart(product)}
              >
                ADD
              </button>
              

            </div>

          ))}

        </div>

      </section>

{filteredProducts.length === 0 && (
  <p className="no-products">
    No products found 😔
  </p>
)}
      {/* CART SUMMARY */}

{cart.length > 0 && (

  <section className="cart-section">

    <h2>
      Your Cart
    </h2>

    {cart.map((item) => (

      <div
        className="cart-item"
        key={item.id}
      >

        <div className="cart-product">

          <span className="cart-product-name">
            {item.image} {item.name}
          </span>

          <span className="cart-product-quantity">
            {item.quantity}
          </span>

        </div>


        <div className="quantity-controls">

          <button
            className="quantity-btn"
            onClick={() => decreaseQuantity(item.id)}
          >
            −
          </button>

          <span>
            {item.cartQuantity}
          </span>

          <button
            className="quantity-btn"
            onClick={() => addToCart(item)}
          >
            +
          </button>

        </div>


        <strong>
          ₹{item.price * item.cartQuantity}
        </strong>


        <button
          className="remove-btn"
          onClick={() => removeFromCart(item.id)}
        >
          Remove
        </button>

      </div>

    ))}


    <div className="cart-total">

      <strong>
        Total
      </strong>

      <strong>
        ₹{cartTotal}
      </strong>

    </div>

  </section>

)}

    </div>
  )
}

export default App