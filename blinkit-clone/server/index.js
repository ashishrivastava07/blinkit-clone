import express from 'express'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const port = process.env.PORT || 4000
const root = join(fileURLToPath(new URL('.', import.meta.url)), 'data')
const dbFile = join(root, 'store.json')

const seed = {
  users: [],
  orders: [],
  products: [
    { id: 'milk', name: 'Amul Taaza Milk', category: 'Dairy', variants: [{ label: '500 ml', price: 29, mrp: 32, stock: 18 }, { label: '1 litre', price: 56, mrp: 64, stock: 12 }] },
    { id: 'bananas', name: 'Farm Fresh Bananas', category: 'Fruits', variants: [{ label: '500 g', price: 38, mrp: 45, stock: 20 }, { label: '1 kg', price: 72, mrp: 90, stock: 9 }] },
  ],
}

function readDb() {
  if (!existsSync(dbFile)) { mkdirSync(root, { recursive: true }); writeFileSync(dbFile, JSON.stringify(seed, null, 2)) }
  return JSON.parse(readFileSync(dbFile, 'utf8'))
}
function writeDb(data) { writeFileSync(dbFile, JSON.stringify(data, null, 2)) }

app.use(express.json())
app.use((req, res, next) => { res.header('Access-Control-Allow-Origin', 'http://localhost:5173'); res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); next() })

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.get('/api/categories', (_req, res) => res.json(['Dairy', 'Fruits']))
app.get('/api/products', (req, res) => {
  const { search = '', category } = req.query
  const productList = readDb().products.filter(product => product.name.toLowerCase().includes(search.toLowerCase()) && (!category || product.category === category))
  res.json(productList)
})
app.get('/api/products/:id', (req, res) => {
  const product = readDb().products.find(item => item.id === req.params.id)
  if (!product) return res.status(404).json({ message: 'Product not found' })
  res.json(product)
})
app.post('/api/auth/request-otp', (req, res) => {
  if (!/^\d{10}$/.test(req.body.phone || '')) return res.status(400).json({ message: 'A 10-digit mobile number is required' })
  // Replace this with a verified SMS provider (Twilio, MSG91, etc.) in production.
  res.json({ message: 'Demo OTP sent', requestId: `otp_${Date.now()}` })
})
app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, otp } = req.body
  if (!/^\d{10}$/.test(phone || '') || !/^\d{6}$/.test(otp || '')) return res.status(400).json({ message: 'Valid phone and 6-digit OTP are required' })
  const db = readDb(); let user = db.users.find(item => item.phone === phone)
  if (!user) { user = { id: `usr_${Date.now()}`, phone, addresses: [], createdAt: new Date().toISOString() }; db.users.push(user); writeDb(db) }
  res.json({ user, token: `demo-token-${user.id}` })
})
app.get('/api/orders', (req, res) => res.json(readDb().orders.filter(order => !req.query.userId || order.userId === req.query.userId)))
app.post('/api/orders', (req, res) => {
  const { items, address, payment, userId } = req.body
  if (!Array.isArray(items) || !items.length || !address || !payment) return res.status(400).json({ message: 'Items, address and payment are required' })
  const db = readDb(); const order = { id: `BLK${Date.now().toString().slice(-7)}`, userId: userId || null, items, address, payment, status: 'Order placed', estimatedDelivery: '12–16 min', createdAt: new Date().toISOString() }
  db.orders.unshift(order); writeDb(db); res.status(201).json(order)
})
app.patch('/api/orders/:id/status', (req, res) => {
  const allowed = ['Order placed', 'Preparing', 'Picked up', 'Out for delivery', 'Delivered']
  if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Invalid order status' })
  const db = readDb(); const order = db.orders.find(item => item.id === req.params.id)
  if (!order) return res.status(404).json({ message: 'Order not found' })
  order.status = req.body.status; writeDb(db); res.json(order)
})

app.listen(port, () => console.log(`Blinkit API running at http://localhost:${port}`))
