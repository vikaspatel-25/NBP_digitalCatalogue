import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import router from './routes/routes.index.js'
import { connectDB } from './db/connection.js'
import cookieParser from 'cookie-parser'

dotenv.config({ path: './.env' })

const url = process.env.MONGO_URI
await connectDB(url)

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
app.use(express.json())
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

app.use('/', router)

app.listen(PORT, () => {
  console.log(`server started ${PORT}`)
})
