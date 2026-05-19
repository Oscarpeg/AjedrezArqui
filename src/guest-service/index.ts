import express from 'express';
import cors from 'cors';
import guestRoutes from './routes/guestRoutes';

const app = express();
const PORT = 3005;

app.use(cors());
app.use(express.json());

app.use('/guest', guestRoutes);

app.listen(PORT, () => {
  console.log(`Guest Service running on port ${PORT}`);
});
