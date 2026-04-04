import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import pkg from 'pg';
// const { Pool } = pkg;
import { createClient } from '@supabase/supabase-js';

// Load env variables
dotenv.config();

// Supabase connection
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Test connection
(async () => {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  if (error) {
    console.error('Supabase connection error:', error.message);
  } else {
    console.log('Connected to Supabase successfully');
  }
})();

import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Pass supabase to routes (IMPORTANT)
app.use('/api/users', (req, res, next) => {
  req.supabase = supabase;
  next();
}, userRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// export { pool }; 