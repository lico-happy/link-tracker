import { Router } from 'express'
import { nanoid } from 'nanoid'
import { pool } from '../db/index.js'
import { rateLimit } from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import { redis } from '../db/redis.js'

const limiter = process.env.NODE_ENV === 'test'
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 20,
      standardHeaders: true,
      store: new RedisStore({ sendCommand: (...args) => redis.sendCommand(args) }),
    })

export const linksRouter = Router()

// POST /api/links — create short link
linksRouter.post('/', limiter, async (req, res) => {
  const { url } = req.body
  if (!url) return res.status(400).json({ error: 'url is required' })

  // Validate URL
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error()
  } catch {
    return res.status(400).json({ error: 'invalid URL' })
  }

  const short_code = nanoid(6)
  const result = await pool.query(
    'INSERT INTO links (short_code, original_url) VALUES ($1, $2) RETURNING *',
    [short_code, url]
  )

  const base = process.env.BASE_URL || 'http://localhost:3001'
  res.json({ ...result.rows[0], short_url: `${base}/${short_code}` })
})

// GET /api/links — paginated links with click counts
linksRouter.get('/', async (req, res) => {
  const pageRaw = Number(req.query.page ?? 1)
  const limitRaw = Number(req.query.limit ?? 20)

  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(Math.floor(limitRaw), 100) : 20
  const offset = (page - 1) * limit

  const countResult = await pool.query('SELECT COUNT(*)::int AS total FROM links')
  const total = countResult.rows[0]?.total ?? 0

  const result = await pool.query(
    `SELECT l.*, COUNT(c.id) AS click_count, MAX(c.clicked_at) AS last_clicked
     FROM links l
     LEFT JOIN clicks c ON c.link_id = l.id
     GROUP BY l.id
     ORDER BY l.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  )

  const totalPages = Math.max(Math.ceil(total / limit), 1)
  res.json({
    items: result.rows,
    pagination: {
      total,
      page,
      limit,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_prev: page > 1,
    },
  })
})

// GET /api/links/:code/stats — click count for a short code
linksRouter.get('/:code/stats', async (req, res) => {
  const { code } = req.params
  const result = await pool.query(
    `SELECT l.short_code, l.original_url, l.created_at,
            COUNT(c.id) AS click_count
     FROM links l
     LEFT JOIN clicks c ON c.link_id = l.id
     WHERE l.short_code = $1
     GROUP BY l.id`,
    [code]
  )
  if (result.rows.length === 0) return res.status(404).json({ error: 'Link not found' })
  const row = result.rows[0]
  res.json({ short_code: row.short_code, original_url: row.original_url, click_count: Number(row.click_count), created_at: row.created_at })
})
