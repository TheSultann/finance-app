import express from 'express';
import cors from 'cors';
import quoteRouter from './routes/quote.js';
import historyRouter from './routes/history.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/quote', quoteRouter);
app.use('/api/history', historyRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Finance proxy listening on http://localhost:${PORT}`);
});
