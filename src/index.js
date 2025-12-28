import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './routes/routes.index.js';
import { connectDB } from './db/connection.js';
import cookieParser from 'cookie-parser';


dotenv.config({ path: './.env' });

const url = process.env.MONGO_URI ;
await connectDB(url);

const app = express();
const PORT = process.env.PORT || 7002;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup EJS
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'views'));

//middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', router);

// Static files
app.use(
  express.static(path.resolve(__dirname, '../public'), {
    maxAge: '0',
    etag: false,
    lastModified: true
  })
);


app.listen(PORT, () => {
  console.log(`server started ${PORT}`);
});
