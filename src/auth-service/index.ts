import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

app.use('/', authRoutes);

app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});
