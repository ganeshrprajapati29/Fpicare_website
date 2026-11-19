import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const PORT = Number(process.env.PORT) || 5055;
const HOST = process.env.HOST || '127.0.0.1';

connectDB()
  .then(() => {
    app.listen(PORT, HOST, () => console.log(`FPicare API running on http://${HOST}:${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to start:', err.message);
    process.exit(1);
  });
