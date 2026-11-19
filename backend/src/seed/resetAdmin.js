/* eslint-disable no-console */
// Create or reset an admin account:
//   npm run admin:reset -- admin@fpicare.in NewPassword123
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';

const [email, password] = process.argv.slice(2);
if (!email || !password || password.length < 6) {
  console.error('Usage: npm run admin:reset -- <email> <password (min 6 chars)>');
  process.exit(1);
}

await connectDB();
let user = await User.findOne({ email: email.toLowerCase() }).select('+password');
if (user) {
  user.password = password;
  user.role = 'admin';
  user.isActive = true;
  await user.save();
  console.log(`Admin password reset for ${email}`);
} else {
  user = await User.create({ name: 'FPicare Admin', email, password, role: 'admin' });
  console.log(`Admin created: ${email}`);
}
await mongoose.disconnect();
