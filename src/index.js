import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import router from './routes/routes.index.js'
import { connectDB, ensureConnected } from './db/connection.js'
import cookieParser from 'cookie-parser'

// Resilient env configuration: supports .env, env, or process environment
if (fs.existsSync('./.env')) {
  dotenv.config({ path: './.env' });
}
if (!process.env.MONGO_URI && fs.existsSync('./env')) {
  dotenv.config({ path: './env' });
}
if (!process.env.MONGO_URI) {
  dotenv.config();
}

const isTestMode =
  process.env.NODE_ENV === 'test' ||
  process.execArgv.includes('--test') ||
  process.argv.some(arg => arg.includes('test'))

const url = process.env.MONGO_URI
if (url) {
  await connectDB(url)
} else if (!isTestMode) {
  console.warn('WARNING: MONGO_URI is not defined. Database not connected.')
}

const app = express()
const PORT = process.env.PORT || 7002

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.set('view engine', 'ejs')
app.set('views', path.resolve(__dirname, 'views'))
app.set('view cache', false)
app.set('etag', false)

app.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0'
  })
  next()
})

app.use(cookieParser())
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
)
app.use(express.urlencoded({ extended: true }))

app.use(
  express.static(path.resolve(__dirname, '../public'), {
    maxAge: 0,
    etag: false,
    lastModified: false,
    setHeaders: (res) => {
      res.set('Cache-Control', 'no-store')
    }
  })
)

// Serve React App for the beta redesigned paths
app.use(express.static(path.resolve(__dirname, '../frontend/dist'), { index: false }));

app.get(['/v2/admin*', '/v2/userPanel*'], (req, res) => {
  const newPath = req.originalUrl.replace(/^\/v2/, '') || '/';
  res.redirect(newPath);
});

app.use('/', router);

// Global 404 Catch-All Handler for Unmatched Routes
app.use((req, res) => {
  if (req.path.startsWith('/api/') || (req.accepts('json') && !req.accepts('html'))) {
    return res.status(404).json({
      success: false,
      error: 'Endpoint not found',
      path: req.originalUrl
    });
  }

  const cleanPath = req.originalUrl ? req.originalUrl.split('?')[0] : '';
  res.status(404).render('pages/404.ejs', {
    status: 404,
    title: 'Page Not Found (404) | NetZeroMart',
    badge: '404 Not Found',
    heading: 'Page Not Found',
    message: `We couldn't find the page you were looking for (${cleanPath ? '"' + cleanPath + '"' : 'requested URL'}). It may have been moved, deleted, or never existed.`,
    subMessage: 'Double-check the web address or navigate using the options below.',
    actionUrl: '/home',
    actionText: 'Return to Homepage',
    secondaryUrl: '/home#products',
    secondaryText: 'Browse Catalogue',
    type: 'page'
  });
});

// Global 500 Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  if (req.path.startsWith('/api/') || (req.accepts('json') && !req.accepts('html'))) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }

  res.status(500).render('pages/404.ejs', {
    status: 500,
    title: 'Server Error (500) | NetZeroMart',
    badge: '500 Server Error',
    heading: 'Something Went Wrong',
    message: 'An unexpected error occurred while processing your request.',
    subMessage: 'Our technical team has been notified. Please try returning to the home page or try again in a moment.',
    actionUrl: '/home',
    actionText: 'Return to Homepage',
    secondaryUrl: '/home#products',
    secondaryText: 'Browse Catalogue',
    type: 'error'
  });
});

if (!isTestMode && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`server started ${PORT}`)
  })
}

export default app
