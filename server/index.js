import express from 'express'

// Application data and authorization live in Supabase/Postgres. This service
// deliberately exposes no duplicate product/order API or privileged database key.
const app = express()
const port = process.env.PORT || 4000

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, dataBackend: 'supabase-postgres', api: 'health-only' })
})

app.use((_req, res) => {
  res.status(404).json({ message: 'Business APIs are Supabase RPCs and RLS-protected tables, not this Express process.' })
})

app.listen(port, () => console.log(`Health service running at http://localhost:${port}/api/health`))
