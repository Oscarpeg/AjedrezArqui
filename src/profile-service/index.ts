import express from 'express';
import cors from 'cors';
import profileRoutes from './routes/profileRoutes';

const app = express();
const PORT = 3003;

app.use(cors());
app.use(express.json());

app.use('/profile', profileRoutes);

app.listen(PORT, () => {
  console.log(`Profile Service running on port ${PORT}`);
});
