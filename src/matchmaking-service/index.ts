import express from 'express';
import cors from 'cors';
import matchmakingRoutes from './routes/matchmakingRoutes';

const app = express();
const PORT = 3006;

app.use(cors());
app.use(express.json());

app.use('/matchmaking', matchmakingRoutes);

app.listen(PORT, () => {
  console.log(`Matchmaking Service running on port ${PORT}`);
});
