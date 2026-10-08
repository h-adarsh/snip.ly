import { customAlphabet } from 'nanoid'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import validator from 'validator'

const nanoid = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz', 6)

const json = (data, status = 200, headers = {}) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...headers
    }
  })
}

const withCors = (req, res, env) => {
  const headers = new Headers(res.headers)
  const requestOrigin = req.headers.get('Origin')
  if (requestOrigin && requestOrigin === env.CORS_ORIGIN) {
    headers.set('Access-Control-Allow-Origin', requestOrigin)
    headers.set('Vary', 'Origin')
  }
  headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  headers.set('Access-Control-Max-Age', '86400')
  return new Response(res.body, { status: res.status, headers })
}

const handleOptions = (req, env) => {
  return withCors(req, new Response(null, { status: 204 }), env)
}

const getJwtKey = (env) => {
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured')
  }
  return new TextEncoder().encode(env.JWT_SECRET)
}

const getAuthUser = async (req, env) => {
  const auth = req.headers.get('Authorization') || ''
  const token = auth.replace('Bearer ', '')
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getJwtKey(env))
    return payload?.userId || null
  } catch (error) {
    return null
  }
}

const normalizeUrl = (url) => {
  if (!url) return null

  let normalized = validator.trim(url)

  if (!normalized.match(/^https?:\/\//i)) {
    normalized = `http://${normalized}`
  }

  if (!validator.isURL(normalized, {
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true,
    allow_underscores: true
  })) {
    return null
  }

  return normalized
}

const isPrivateIp = (hostname) => {
  const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (!ipv4Match) return false

  const [a, b] = [Number(ipv4Match[1]), Number(ipv4Match[2])]

  if (a === 10) return true
  if (a === 127) return true
  if (a === 192 && b === 168) return true
  if (a === 172 && b >= 16 && b <= 31) return true

  return false
}

const isBlockedHost = (url) => {
  try {
    const { hostname } = new URL(url)
    const host = hostname.toLowerCase()

    if (host === 'localhost' || host.endsWith('.localhost')) return true
    if (host === '127.0.0.1' || host === '::1') return true
    if (isPrivateIp(host)) return true
  } catch (error) {
    return true
  }

  return false
}

const parseMeta = (html, key, attr = 'property') => {
  const pattern = new RegExp(`<meta[^>]+${attr}=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i')
  const match = html.match(pattern)
  return match ? match[1] : ''
}

const parseTitle = (html) => {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return match ? match[1] : ''
}

const fetchPreview = async (url) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'SniplyPreviewBot/1.0'
      }
    })
    const html = (await res.text()).slice(0, 200000)

    const ogTitle = parseMeta(html, 'og:title')
    const ogDescription = parseMeta(html, 'og:description')
    const ogImage = parseMeta(html, 'og:image')
    const ogSite = parseMeta(html, 'og:site_name')

    const twitterTitle = parseMeta(html, 'twitter:title', 'name')
    const twitterDescription = parseMeta(html, 'twitter:description', 'name')
    const twitterImage = parseMeta(html, 'twitter:image', 'name')
    const twitterSite = parseMeta(html, 'twitter:site', 'name')

    return {
      title: ogTitle || twitterTitle || parseTitle(html),
      description: ogDescription || twitterDescription,
      image: ogImage || twitterImage,
      siteName: ogSite || twitterSite
    }
  } catch (error) {
    return {
      title: '',
      description: '',
      image: '',
      siteName: ''
    }
  } finally {
    clearTimeout(timeout)
  }
}

const handleRegister = async (req, env) => {
  const body = await req.json().catch(() => ({}))
  const { name, email, password } = body

  if (!name || !email || !password) {
    return json({ message: 'All fields are required' }, 400)
  }

  const sanitizedName = validator.trim(name)
  if (validator.isEmpty(sanitizedName)) {
    return json({ message: 'Name cannot be empty' }, 400)
  }
  if (sanitizedName.length < 2 || sanitizedName.length > 50) {
    return json({ message: 'Name must be between 2 and 50 characters' }, 400)
  }

  const sanitizedEmail = validator.normalizeEmail(email)
  if (!validator.isEmail(sanitizedEmail)) {
    return json({ message: 'Invalid email address' }, 400)
  }

  const passwordErrors = []
  if (password.length < 8) passwordErrors.push('Password must be at least 8 characters long')
  if (!/[A-Z]/.test(password)) passwordErrors.push('Password must contain at least one uppercase letter')
  if (!/[a-z]/.test(password)) passwordErrors.push('Password must contain at least one lowercase letter')
  if (!/[0-9]/.test(password)) passwordErrors.push('Password must contain at least one number')
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    passwordErrors.push('Password must contain at least one special character')
  }

  if (passwordErrors.length > 0) {
    return json({ message: 'Password does not meet requirements', errors: passwordErrors }, 400)
  }

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?')
    .bind(sanitizedEmail)
    .first()
  if (existing) {
    return json({ message: 'User already exists' }, 400)
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const now = new Date().toISOString()
  const id = crypto.randomUUID()

  await env.DB.prepare(
    'INSERT INTO users (id, name, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
  )
    .bind(id, sanitizedName, sanitizedEmail, hashedPassword, now, now)
    .run()

  return json({ message: 'User registered successfully', user: { id, name: sanitizedName, email: sanitizedEmail } }, 201)
}

const handleLogin = async (req, env) => {
  const body = await req.json().catch(() => ({}))
  const { email, password } = body

  if (!email || !password) {
    return json({ message: 'Email and password are required' }, 400)
  }

  const sanitizedEmail = validator.normalizeEmail(email)
  if (!validator.isEmail(sanitizedEmail)) {
    return json({ message: 'Invalid email address' }, 400)
  }

  const user = await env.DB.prepare('SELECT id, name, email, password FROM users WHERE email = ?')
    .bind(sanitizedEmail)
    .first()

  if (!user) {
    return json({ message: 'Invalid credentials' }, 401)
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return json({ message: 'Invalid credentials' }, 401)
  }

  const token = await new SignJWT({ userId: user.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getJwtKey(env))

  return json({ token, user: { id: user.id, name: user.name, email: user.email } })
}

const handleCreateLink = async (req, env, userId) => {
  const body = await req.json().catch(() => ({}))
  const { url } = body

  if (!url) {
    return json({ message: 'URL is required' }, 400)
  }

  const normalizedUrl = normalizeUrl(url)
  if (!normalizedUrl) {
    return json({ message: 'Invalid URL format' }, 400)
  }

  if (isBlockedHost(normalizedUrl)) {
    return json({ message: 'URL host is not allowed' }, 400)
  }

  let shortId = ''
  let attempts = 0
  const maxAttempts = 3

  while (attempts < maxAttempts) {
    shortId = nanoid()
    const exists = await env.DB.prepare('SELECT id FROM links WHERE short_id = ?')
      .bind(shortId)
      .first()
    if (!exists) break
    attempts += 1
  }

  if (attempts === maxAttempts) {
    return json({ message: 'Failed to generate unique short ID' }, 500)
  }

  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  await env.DB.prepare(
    'INSERT INTO links (id, short_id, original_url, user_id, clicks, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )
    .bind(id, shortId, normalizedUrl, userId, 0, now, now)
    .run()

  const shortDomain = env.SHORT_DOMAIN || new URL(req.url).origin

  return json({
    id,
    shortId,
    originalUrl: normalizedUrl,
    userId,
    clicks: 0,
    createdAt: now,
    updatedAt: now,
    shortUrl: `${shortDomain}/${shortId}`
  }, 201)
}

const handleGetLinks = async (env, userId) => {
  const { results } = await env.DB.prepare(
    'SELECT id, short_id as shortId, original_url as originalUrl, user_id as userId, clicks, created_at as createdAt, updated_at as updatedAt FROM links WHERE user_id = ? ORDER BY created_at DESC'
  )
    .bind(userId)
    .all()

  return json(Array.isArray(results) ? results : [])
}

const handleDeleteLink = async (env, userId, linkId) => {
  const res = await env.DB.prepare('DELETE FROM links WHERE id = ? AND user_id = ?')
    .bind(linkId, userId)
    .run()

  if (!res.meta || res.meta.changes === 0) {
    return json({ message: 'Link not found' }, 404)
  }

  return json({ message: 'Link deleted successfully' })
}

const handlePreview = async (req, env) => {
  const url = new URL(req.url).searchParams.get('url')
  if (!url) {
    return json({ message: 'URL is required' }, 400)
  }

  const normalizedUrl = normalizeUrl(url)
  if (!normalizedUrl) {
    return json({ message: 'Invalid URL format' }, 400)
  }

  if (isBlockedHost(normalizedUrl)) {
    return json({ message: 'URL host is not allowed' }, 400)
  }

  const preview = await fetchPreview(normalizedUrl)
  return json({
    url: normalizedUrl,
    title: preview.title || '',
    description: preview.description || '',
    image: preview.image || '',
    siteName: preview.siteName || ''
  })
}

const handleRedirect = async (req, env, shortId) => {
  const link = await env.DB.prepare(
    'SELECT id, original_url as originalUrl FROM links WHERE short_id = ?'
  )
    .bind(shortId)
    .first()

  if (!link) {
    return new Response('Link not found', { status: 404 })
  }

  await env.DB.prepare('UPDATE links SET clicks = clicks + 1, updated_at = ? WHERE id = ?')
    .bind(new Date().toISOString(), link.id)
    .run()

  const target = link.originalUrl.match(/^https?:\/\//i)
    ? link.originalUrl
    : `https://${link.originalUrl}`

  return Response.redirect(target, 302)
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url)
    const { pathname } = url

    if (req.method === 'OPTIONS') {
      return handleOptions(req, env)
    }

    try {
      if (!env.JWT_SECRET || !env.CORS_ORIGIN) {
        return withCors(req, json({ message: 'Server is not configured' }, 500), env)
      }

      if (req.method === 'POST' && pathname === '/api/auth/register') {
        return withCors(req, await handleRegister(req, env), env)
      }

      if (req.method === 'POST' && pathname === '/api/auth/login') {
        return withCors(req, await handleLogin(req, env), env)
      }

      if (pathname.startsWith('/api/links')) {
        if (req.method === 'POST' && pathname === '/api/links/public') {
          return withCors(req, await handleCreateLink(req, env, null), env)
        }

        const userId = await getAuthUser(req, env)
        if (!userId) {
          return withCors(req, json({ message: 'No token, authorization denied' }, 401), env)
        }

        if (req.method === 'POST' && pathname === '/api/links') {
          return withCors(req, await handleCreateLink(req, env, userId), env)
        }

        if (req.method === 'GET' && pathname === '/api/links/my') {
          return withCors(req, await handleGetLinks(env, userId), env)
        }

        if (req.method === 'DELETE' && pathname.startsWith('/api/links/')) {
          const linkId = pathname.split('/').pop()
          return withCors(req, await handleDeleteLink(env, userId, linkId), env)
        }

        if (req.method === 'GET' && pathname === '/api/links/preview') {
          return withCors(req, await handlePreview(req, env), env)
        }
      }

      if (req.method === 'GET' && pathname === '/') {
        return withCors(req, json({ status: 'ok' }), env)
      }

      if (req.method === 'GET' && !pathname.startsWith('/api/')) {
        const shortId = pathname.replace(/^\//, '')
        if (shortId) {
          return handleRedirect(req, env, shortId)
        }
      }

      return withCors(req, json({ message: 'Not found' }, 404), env)
    } catch (error) {
      return withCors(req, json({ message: 'Server error', error: error?.message || 'unknown' }, 500), env)
    }
  }
}
